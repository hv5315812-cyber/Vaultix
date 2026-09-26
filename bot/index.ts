import {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Interaction,
  ButtonInteraction,
} from 'discord.js';
import { initDatabase, PlayerDB, SpellDB, InventoryDB } from './database';
import { PlayerManager } from './systems/player';
import { CONFIG } from './config';
import { getFamilyByName } from './config/families';
import { SHOP_ITEMS, getShopItemById } from './config/shop';
import { RARITY_COLORS } from './config';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Initialize database
initDatabase();

// Create client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

// Command collection
const commands = new Collection<string, any>();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if (command.data && command.execute) {
    commands.set(command.data.name, command);
  }
}

console.log(`Loaded ${commands.size} commands: ${[...commands.keys()].join(', ')}`);

// MP Regeneration
setInterval(() => {
  const db = require('./database').getDatabase();
  const wizards = db.prepare('SELECT * FROM players WHERE is_wizard = 1').all() as any[];
  for (const player of wizards) {
    const maxMp = PlayerManager.getEffectiveMaxMP(player);
    if (player.mp < maxMp) {
      const newMp = Math.min(maxMp, player.mp + CONFIG.MP_REGEN_AMOUNT);
      db.prepare('UPDATE players SET mp = ? WHERE user_id = ?').run(newMp, player.user_id);
    }
  }
}, CONFIG.MP_REGEN_INTERVAL_MS);

// Ready event
client.once(Events.ClientReady, (readyClient) => {
  console.log(`✨ Vaultix is online! Logged in as ${readyClient.user.tag}`);
  console.log(`Serving ${readyClient.guilds.cache.size} guilds`);
});

// Interaction handler
client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  // Slash commands
  if (interaction.isChatInputCommand()) {
    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing /${interaction.commandName}:`, error);
      const reply = { content: '❌ An error occurred while executing this command.', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
    return;
  }

  // Autocomplete
  if (interaction.isAutocomplete()) {
    const command = commands.get(interaction.commandName);
    if (!command?.autocomplete) return;
    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error('Autocomplete error:', error);
    }
    return;
  }

  // Button interactions
  if (interaction.isButton()) {
    await handleButton(interaction as ButtonInteraction);
    return;
  }
});

async function handleButton(interaction: ButtonInteraction) {
  const customId = interaction.customId;

  // Wizard choice buttons
  if (customId === 'become_wizard') {
    const player = PlayerDB.getOrCreate(interaction.user.id, interaction.user.username);

    if (player.level < CONFIG.WIZARD_UNLOCK_LEVEL) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('❌ Not Ready')
          .setDescription(`You need to be at least Level ${CONFIG.WIZARD_UNLOCK_LEVEL} to become a Wizard.`)
          .setColor(0xe74c3c)],
        ephemeral: true,
      });
    }

    // Assign family and wand
    const family = PlayerManager.assignFamily();
    const wand = PlayerManager.assignWand();

    PlayerDB.setWizard(interaction.user.id, true);
    PlayerDB.setFamily(interaction.user.id, family.name);
    PlayerDB.setWand(interaction.user.id, wand.name);

    // Update MP/HP
    const updatedPlayer = PlayerDB.get(interaction.user.id);
    const maxHp = PlayerManager.getEffectiveMaxHP(updatedPlayer);
    const maxMp = PlayerManager.getEffectiveMaxMP(updatedPlayer);
    PlayerDB.update(interaction.user.id, { max_hp: maxHp, hp: maxHp, max_mp: maxMp, mp: maxMp });

    const familyBonusText = Object.entries(family.bonuses)
      .map(([key, value]) => `+${value}% ${key}`)
      .join(', ');

    const embed = new EmbedBuilder()
      .setTitle('🧙 You Are Now a Wizard!')
      .setDescription(`The magical world welcomes you, **${interaction.user.username}**!`)
      .setColor(0x9b59b6)
      .addFields(
        {
          name: '🏠 Your Family',
          value: `**${family.name}** (${family.rarity.replace('_', ' ')})\n${familyBonusText}`,
          inline: true,
        },
        {
          name: '🪄 Your Wand',
          value: `**${wand.name}**\n${wand.description}`,
          inline: true,
        },
        {
          name: '✨ What\'s Next?',
          value: '• Visit `/magicshop` to buy spells\n• Enter `/dungeon` to fight monsters\n• Use `/reroll` for a new family\n• Cast spells in combat!',
          inline: false,
        },
      );

    await interaction.update({ embeds: [embed], components: [] });
    return;
  }

  if (customId === 'stay_worker') {
    await interaction.update({
      embeds: [new EmbedBuilder()
        .setTitle('💼 Staying a Worker')
        .setDescription('You chose to continue as a worker. You can always become a wizard later when you feel ready!\n\nUse `/work` to keep earning.')
        .setColor(0x2ecc71)],
      components: [],
    });
    return;
  }

  // Combat buttons
  if (customId.startsWith('combat_')) {
    await handleCombatButton(interaction);
    return;
  }

  // Shop category buttons
  if (customId.startsWith('shop_')) {
    await handleShopButton(interaction);
    return;
  }
}

async function handleCombatButton(interaction: ButtonInteraction) {
  const player = PlayerDB.get(interaction.user.id);
  if (!player) return;

  const { getActiveCombat, processAttack, enemyTurn, tickCooldowns, calculateRewards, endCombat, createCombatEmbed, createCombatButtons, processSpellCast } = require('./systems/combat');
  const combat = getActiveCombat(player.user_id);

  if (!combat) {
    return interaction.reply({
      embeds: [new EmbedBuilder().setTitle('❌ No Active Combat').setColor(0xe74c3c)],
      ephemeral: true,
    });
  }

  const action = interaction.customId.replace('combat_', '');

  if (action === 'attack') {
    const result = await processAttack(combat, player);

    // Check if all enemies dead
    const allDead = combat.enemies.every((e: any) => e.hp <= 0);

    if (allDead) {
      const rewards = calculateRewards(combat);
      PlayerDB.addXP(player.user_id, rewards.xp);
      PlayerDB.addCoins(player.user_id, rewards.coins);

      const { InventoryDB } = require('./database');
      for (const loot of rewards.loot) {
        InventoryDB.addItem(player.user_id, loot, 1);
      }

      PlayerDB.setDungeonFloor(player.user_id, combat.floor);
      PlayerDB.update(player.user_id, { hp: combat.playerHp, mp: combat.playerMp });
      await PlayerManager.checkLevelUp(player.user_id);
      endCombat(player.user_id, true);

      const lootText = rewards.loot.length > 0 ? rewards.loot.join(', ') : 'None';
      const embed = new EmbedBuilder()
        .setTitle('🏆 Floor Cleared!')
        .setDescription(`You defeated all enemies on Floor ${combat.floor}!`)
        .setColor(0xf1c40f)
        .addFields(
          { name: '⚔️ Damage Dealt', value: `${result.damage} to ${result.killed[0] || 'enemy'}`, inline: true },
          { name: '📈 XP', value: `+${rewards.xp}`, inline: true },
          { name: '💰 Coins', value: `+${rewards.coins}`, inline: true },
          { name: '🎁 Loot', value: lootText, inline: false },
        );

      return interaction.update({ embeds: [embed], components: [] });
    }

    // Enemy turn
    const enemyResult = enemyTurn(combat, player);
    combat.playerHp -= enemyResult.damage;
    combat.turn++;
    tickCooldowns(combat);

    if (combat.playerHp <= 0) {
      endCombat(player.user_id, false);
      const updatedPlayer = PlayerDB.get(player.user_id);
      const maxHp = PlayerManager.getEffectiveMaxHP(updatedPlayer);
      PlayerDB.update(player.user_id, { hp: Math.floor(maxHp * 0.5), mp: combat.playerMp });

      return interaction.update({
        embeds: [new EmbedBuilder()
          .setTitle('💀 Defeated!')
          .setDescription('You were defeated. You retreat to recover half your health.')
          .setColor(0xe74c3c)],
        components: [],
      });
    }

    PlayerDB.update(player.user_id, { hp: combat.playerHp, mp: combat.playerMp });
    const embed = createCombatEmbed(combat, player, `⚔️ You attack for ${result.damage} damage!${result.killed.length > 0 ? ` **${result.killed[0]}** defeated!` : ''}\n💥 Enemies deal ${enemyResult.damage} damage!${enemyResult.special ? `\n⚡ ${enemyResult.special}` : ''}`);
    const buttons = createCombatButtons(combat, player);
    return interaction.update({ embeds: [embed], components: buttons });
  }

  if (action === 'defend') {
    // Reduce incoming damage this turn
    const enemyResult = enemyTurn(combat, player);
    const reducedDamage = Math.floor(enemyResult.damage * CONFIG.DEFEND_REDUCTION);
    combat.playerHp -= reducedDamage;
    combat.turn++;
    tickCooldowns(combat);

    if (combat.playerHp <= 0) {
      endCombat(player.user_id, false);
      const updatedPlayer = PlayerDB.get(player.user_id);
      const maxHp = PlayerManager.getEffectiveMaxHP(updatedPlayer);
      PlayerDB.update(player.user_id, { hp: Math.floor(maxHp * 0.5), mp: combat.playerMp });

      return interaction.update({
        embeds: [new EmbedBuilder()
          .setTitle('💀 Defeated!')
          .setDescription('Even your defense wasn\'t enough...')
          .setColor(0xe74c3c)],
        components: [],
      });
    }

    PlayerDB.update(player.user_id, { hp: combat.playerHp, mp: combat.playerMp });
    const embed = createCombatEmbed(combat, player, `🛡️ You defend! Damage reduced to ${reducedDamage} (from ${enemyResult.damage}).`);
    const buttons = createCombatButtons(combat, player);
    return interaction.update({ embeds: [embed], components: buttons });
  }

  if (action === 'flee') {
    if (Math.random() < CONFIG.FLEE_CHANCE) {
      endCombat(player.user_id, false);
      PlayerDB.update(player.user_id, { hp: combat.playerHp, mp: combat.playerMp });
      return interaction.update({
        embeds: [new EmbedBuilder()
          .setTitle('🏃 Escaped!')
          .setDescription('You successfully fled from combat!')
          .setColor(0xf39c12)],
        components: [],
      });
    } else {
      // Failed to flee, enemy attacks
      const enemyResult = enemyTurn(combat, player);
      combat.playerHp -= enemyResult.damage;
      combat.turn++;
      tickCooldowns(combat);

      if (combat.playerHp <= 0) {
        endCombat(player.user_id, false);
        const updatedPlayer = PlayerDB.get(player.user_id);
        const maxHp = PlayerManager.getEffectiveMaxHP(updatedPlayer);
        PlayerDB.update(player.user_id, { hp: Math.floor(maxHp * 0.5), mp: combat.playerMp });

        return interaction.update({
          embeds: [new EmbedBuilder()
            .setTitle('💀 Defeated!')
            .setDescription('You couldn\'t escape and were defeated.')
            .setColor(0xe74c3c)],
          components: [],
        });
      }

      PlayerDB.update(player.user_id, { hp: combat.playerHp, mp: combat.playerMp });
      const embed = createCombatEmbed(combat, player, `🏃 Failed to flee! Enemies deal ${enemyResult.damage} damage!`);
      const buttons = createCombatButtons(combat, player);
      return interaction.update({ embeds: [embed], components: buttons });
    }
  }

  if (action === 'spell') {
    // Show spell selection
    const learnedSpells = SpellDB.getLearned(player.user_id);
    const { SPELLS } = require('./config/spells');

    if (learnedSpells.length === 0) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setTitle('❌ No Spells').setDescription('Learn spells from the Magic Shop!').setColor(0xe74c3c)],
        ephemeral: true,
      });
    }

    const { StringSelectMenuBuilder } = require('discord.js');
    const options = learnedSpells.map((ls: any) => {
      const spell = SPELLS.find((s: any) => s.id === ls.spell_id);
      if (!spell) return null;
      const onCooldown = combat.cooldowns[spell.id] > 0;
      return {
        label: `${spell.name}${onCooldown ? ' (Cooldown)' : ''}`,
        description: `${spell.type === 'heal' ? `Heal ${spell.damage} HP` : `${spell.damage} DMG`} | ${spell.mpCost} MP`,
        value: spell.id,
        disabled: onCooldown,
      };
    }).filter(Boolean);

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('combat_cast_spell')
        .setPlaceholder('Choose a spell to cast')
        .addOptions(options.slice(0, 25))
    );

    return interaction.reply({
      embeds: [new EmbedBuilder()
        .setTitle('✨ Select a Spell')
        .setDescription(`Your MP: ${combat.playerMp}/${combat.playerMaxMp}`)
        .setColor(0x9b59b6)],
      components: [row as any],
      ephemeral: true,
    });
  }

  if (action === 'item') {
    // Show usable items
    const items = InventoryDB.getAll(player.user_id);
    const usableItems = items.filter((i: any) => {
      const shopItem = getShopItemById(i.item_id);
      return shopItem && shopItem.category === 'potion';
    });

    if (usableItems.length === 0) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setTitle('❌ No Items').setDescription('You have no usable items. Buy potions from the Magic Shop!').setColor(0xe74c3c)],
        ephemeral: true,
      });
    }

    const { StringSelectMenuBuilder } = require('discord.js');
    const options = usableItems.map((i: any) => {
      const shopItem = getShopItemById(i.item_id);
      return {
        label: `${shopItem!.name} (x${i.quantity})`,
        description: shopItem!.description,
        value: i.item_id,
      };
    });

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('combat_use_item')
        .setPlaceholder('Choose an item to use')
        .addOptions(options.slice(0, 25))
    );

    return interaction.reply({
      embeds: [new EmbedBuilder()
        .setTitle('🧪 Select an Item')
        .setColor(0x2ecc71)],
      components: [row as any],
      ephemeral: true,
    });
  }
}

async function handleShopButton(interaction: ButtonInteraction) {
  const category = interaction.customId.replace('shop_', '');
  const items = SHOP_ITEMS.filter(i => i.category === category);

  const categoryNames: Record<string, string> = {
    spell: '📖 Spells',
    potion: '🧪 Potions',
    reroll: '🔄 Rerolls',
    material: '💎 Materials',
  };

  const itemList = items.map(item => {
    return `**${item.name}** - 💰 ${item.price} coins\n└ ${item.description}`;
  }).join('\n\n');

  const embed = new EmbedBuilder()
    .setTitle(`🏪 ${categoryNames[category] || category}`)
    .setDescription(itemList || 'No items in this category.')
    .setColor(RARITY_COLORS[category === 'spell' ? 'rare' : 'common'] || 0xf39c12)
    .setFooter({ text: 'Use /buy <item_name> to purchase' });

  await interaction.update({ embeds: [embed] });
}

// String select menu handler for combat spells/items
client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === 'combat_cast_spell') {
    const spellId = interaction.values[0];
    const player = PlayerDB.get(interaction.user.id);
    if (!player) return;

    const { getActiveCombat, processSpellCast, enemyTurn, tickCooldowns, calculateRewards, endCombat, createCombatEmbed, createCombatButtons } = require('./systems/combat');
    const combat = getActiveCombat(player.user_id);
    if (!combat) return;

    const result = await processSpellCast(combat, player, spellId);
    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.message}`, ephemeral: true });
    }

    const allDead = combat.enemies.every((e: any) => e.hp <= 0);
    if (allDead) {
      const rewards = calculateRewards(combat);
      PlayerDB.addXP(player.user_id, rewards.xp);
      PlayerDB.addCoins(player.user_id, rewards.coins);
      const { InventoryDB } = require('./database');
      for (const loot of rewards.loot) InventoryDB.addItem(player.user_id, loot, 1);
      PlayerDB.setDungeonFloor(player.user_id, combat.floor);
      PlayerDB.update(player.user_id, { hp: combat.playerHp, mp: combat.playerMp });
      await PlayerManager.checkLevelUp(player.user_id);
      endCombat(player.user_id, true);

      const lootText = rewards.loot.length > 0 ? rewards.loot.join(', ') : 'None';
      const embed = new EmbedBuilder()
        .setTitle('🏆 Floor Cleared!')
        .setDescription(`✨ ${result.message}\n\nAll enemies defeated on Floor ${combat.floor}!`)
        .setColor(0xf1c40f)
        .addFields(
          { name: '📈 XP', value: `+${rewards.xp}`, inline: true },
          { name: '💰 Coins', value: `+${rewards.coins}`, inline: true },
          { name: '🎁 Loot', value: lootText, inline: false },
        );
      return interaction.update({ embeds: [embed], components: [] });
    }

    // Enemy turn
    const enemyResult = enemyTurn(combat, player);
    combat.playerHp -= enemyResult.damage;
    combat.turn++;
    tickCooldowns(combat);

    if (combat.playerHp <= 0) {
      endCombat(player.user_id, false);
      const updatedPlayer = PlayerDB.get(player.user_id);
      const maxHp = PlayerManager.getEffectiveMaxHP(updatedPlayer);
      PlayerDB.update(player.user_id, { hp: Math.floor(maxHp * 0.5), mp: combat.playerMp });
      return interaction.update({
        embeds: [new EmbedBuilder().setTitle('💀 Defeated!').setDescription(result.message + '\n\nYou were defeated...').setColor(0xe74c3c)],
        components: [],
      });
    }

    PlayerDB.update(player.user_id, { hp: combat.playerHp, mp: combat.playerMp });
    const embed = createCombatEmbed(combat, player, `✨ ${result.message}\n💥 Enemies deal ${enemyResult.damage} damage!`);
    const buttons = createCombatButtons(combat, player);
    await interaction.update({ embeds: [embed], components: buttons });
  }

  if (interaction.customId === 'combat_use_item') {
    const itemId = interaction.values[0];
    const player = PlayerDB.get(interaction.user.id);
    if (!player) return;

    const { getActiveCombat, enemyTurn, tickCooldowns, endCombat, createCombatEmbed, createCombatButtons } = require('./systems/combat');
    const combat = getActiveCombat(player.user_id);
    if (!combat) return;

    const shopItem = getShopItemById(itemId);
    if (!shopItem) return;

    // Use item
    if (!InventoryDB.removeItem(player.user_id, itemId, 1)) {
      return interaction.reply({ content: '❌ You don\'t have that item!', ephemeral: true });
    }

    let message = '';
    switch (shopItem.effect) {
      case 'heal_50':
        combat.playerHp = Math.min(combat.playerMaxHp, combat.playerHp + 50);
        message = '🧪 Used Health Potion! +50 HP';
        break;
      case 'heal_150':
        combat.playerHp = Math.min(combat.playerMaxHp, combat.playerHp + 150);
        message = '🧪 Used Greater Health Potion! +150 HP';
        break;
      case 'mana_30':
        combat.playerMp = Math.min(combat.playerMaxMp, combat.playerMp + 30);
        message = '🧪 Used Mana Potion! +30 MP';
        break;
      case 'mana_80':
        combat.playerMp = Math.min(combat.playerMaxMp, combat.playerMp + 80);
        message = '🧪 Used Greater Mana Potion! +80 MP';
        break;
      case 'damage_boost':
        combat.buffs['damage_up'] = 99; // entire fight
        message = '🧪 Used Elixir of Power! +50% damage this fight!';
        break;
      default:
        message = `Used ${shopItem.name}`;
    }

    // Enemy turn after using item
    const enemyResult = enemyTurn(combat, player);
    combat.playerHp -= enemyResult.damage;
    combat.turn++;
    tickCooldowns(combat);

    if (combat.playerHp <= 0) {
      endCombat(player.user_id, false);
      const updatedPlayer = PlayerDB.get(player.user_id);
      const maxHp = PlayerManager.getEffectiveMaxHP(updatedPlayer);
      PlayerDB.update(player.user_id, { hp: Math.floor(maxHp * 0.5), mp: combat.playerMp });
      return interaction.update({
        embeds: [new EmbedBuilder().setTitle('💀 Defeated!').setDescription(`${message}\n\nYou were defeated...`).setColor(0xe74c3c)],
        components: [],
      });
    }

    PlayerDB.update(player.user_id, { hp: combat.playerHp, mp: combat.playerMp });
    const embed = createCombatEmbed(combat, player, `${message}\n💥 Enemies deal ${enemyResult.damage} damage!`);
    const buttons = createCombatButtons(combat, player);
    await interaction.update({ embeds: [embed], components: buttons });
  }
});

// Login
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('❌ DISCORD_TOKEN not found in .env file!');
  process.exit(1);
}

client.login(token);
