import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { PlayerDB, SpellDB, InventoryDB, CombatDB } from '../database';
import { PlayerManager } from '../systems/player';
import { FAMILIES, getFamilyByName } from '../config/families';
import { WANDS } from '../config/wands';

export const data = new SlashCommandBuilder()
  .setName('admin')
  .setDescription('Admin commands (requires Administrator permission)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand(sub =>
    sub.setName('givecoins')
      .setDescription('Give coins to a user')
      .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
      .addIntegerOption(o => o.setName('amount').setDescription('Amount of coins').setRequired(true).setMinValue(1))
  )
  .addSubcommand(sub =>
    sub.setName('givexp')
      .setDescription('Give XP to a user')
      .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
      .addIntegerOption(o => o.setName('amount').setDescription('Amount of XP').setRequired(true).setMinValue(1))
  )
  .addSubcommand(sub =>
    sub.setName('setlevel')
      .setDescription('Set a user\'s level')
      .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
      .addIntegerOption(o => o.setName('level').setDescription('New level').setRequired(true).setMinValue(1).setMaxValue(100))
  )
  .addSubcommand(sub =>
    sub.setName('setfamily')
      .setDescription('Set a user\'s family')
      .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
      .addStringOption(o => o.setName('family').setDescription('Family name').setRequired(true).setAutocomplete(true))
  )
  .addSubcommand(sub =>
    sub.setName('setwand')
      .setDescription('Set a user\'s wand')
      .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
      .addStringOption(o => o.setName('wand').setDescription('Wand name').setRequired(true).setAutocomplete(true))
  )
  .addSubcommand(sub =>
    sub.setName('giveitem')
      .setDescription('Give an item to a user')
      .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
      .addStringOption(o => o.setName('item').setDescription('Item ID').setRequired(true))
      .addIntegerOption(o => o.setName('quantity').setDescription('Quantity').setRequired(false).setMinValue(1))
  )
  .addSubcommand(sub =>
    sub.setName('resetplayer')
      .setDescription('Reset a user\'s data')
      .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('setdungeon')
      .setDescription('Set a user\'s dungeon floor')
      .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
      .addIntegerOption(o => o.setName('floor').setDescription('Floor number').setRequired(true).setMinValue(0).setMaxValue(50))
  )
  .addSubcommand(sub =>
    sub.setName('setwizard')
      .setDescription('Set a user\'s wizard status')
      .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
      .addBooleanOption(o => o.setName('status').setDescription('Is wizard').setRequired(true))
  );

export async function execute(interaction: any) {
  await interaction.deferReply({ ephemeral: true });

  const sub = interaction.options.getSubcommand();
  const targetUser = interaction.options.getUser('user');

  switch (sub) {
    case 'givecoins': {
      const amount = interaction.options.getInteger('amount');
      const player = PlayerDB.getOrCreate(targetUser.id, targetUser.username);
      const newCoins = Math.min(player.coins + amount, 999999999);
      PlayerDB.update(targetUser.id, { coins: newCoins });
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setTitle('✅ Coins Given')
          .setDescription(`Gave **${amount}** coins to ${targetUser.username}.\nNew balance: **${newCoins}**`)
          .setColor(0x2ecc71)],
      });
    }

    case 'givexp': {
      const amount = interaction.options.getInteger('amount');
      const player = PlayerDB.getOrCreate(targetUser.id, targetUser.username);
      PlayerDB.addXP(targetUser.id, amount);
      const levelsGained = await PlayerManager.checkLevelUp(targetUser.id);
      const updated = PlayerDB.get(targetUser.id);
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setTitle('✅ XP Given')
          .setDescription(`Gave **${amount}** XP to ${targetUser.username}.\nLevel: **${updated.level}** | XP: **${updated.xp}**${levelsGained.length > 0 ? `\n🎉 Leveled up to ${updated.level}!` : ''}`)
          .setColor(0x2ecc71)],
      });
    }

    case 'setlevel': {
      const level = interaction.options.getInteger('level');
      const player = PlayerDB.getOrCreate(targetUser.id, targetUser.username);
      PlayerDB.levelUp(targetUser.id, level);
      PlayerDB.update(targetUser.id, { xp: 0 });
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setTitle('✅ Level Set')
          .setDescription(`${targetUser.username} is now level **${level}**.`)
          .setColor(0x2ecc71)],
      });
    }

    case 'setfamily': {
      const familyName = interaction.options.getString('family');
      const family = getFamilyByName(familyName);
      if (!family) {
        return interaction.editReply({
          embeds: [new EmbedBuilder()
            .setTitle('❌ Family Not Found')
            .setDescription(`"${familyName}" is not a valid family.`)
            .setColor(0xe74c3c)],
        });
      }
      PlayerDB.getOrCreate(targetUser.id, targetUser.username);
      PlayerDB.setFamily(targetUser.id, family.name);
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setTitle('✅ Family Set')
          .setDescription(`${targetUser.username}'s family is now **${family.name}** (${family.rarity}).`)
          .setColor(0x2ecc71)],
      });
    }

    case 'setwand': {
      const wandName = interaction.options.getString('wand');
      const wand = WANDS.find(w => w.name.toLowerCase() === wandName.toLowerCase());
      if (!wand) {
        return interaction.editReply({
          embeds: [new EmbedBuilder()
            .setTitle('❌ Wand Not Found')
            .setDescription(`"${wandName}" is not a valid wand.`)
            .setColor(0xe74c3c)],
        });
      }
      PlayerDB.getOrCreate(targetUser.id, targetUser.username);
      PlayerDB.setWand(targetUser.id, wand.name);
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setTitle('✅ Wand Set')
          .setDescription(`${targetUser.username}'s wand is now **${wand.name}**.`)
          .setColor(0x2ecc71)],
      });
    }

    case 'giveitem': {
      const itemId = interaction.options.getString('item');
      const quantity = interaction.options.getInteger('quantity') || 1;
      PlayerDB.getOrCreate(targetUser.id, targetUser.username);
      InventoryDB.addItem(targetUser.id, itemId, quantity);
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setTitle('✅ Item Given')
          .setDescription(`Gave **${itemId}** x${quantity} to ${targetUser.username}.`)
          .setColor(0x2ecc71)],
      });
    }

    case 'resetplayer': {
      const player = PlayerDB.get(targetUser.id);
      if (!player) {
        return interaction.editReply({
          embeds: [new EmbedBuilder()
            .setTitle('❌ Not Found')
            .setDescription('This user has no data to reset.')
            .setColor(0xe74c3c)],
        });
      }
      // Reset all data
      const db = require('../database').getDatabase();
      db.prepare('DELETE FROM player_spells WHERE user_id = ?').run(targetUser.id);
      db.prepare('DELETE FROM player_inventory WHERE user_id = ?').run(targetUser.id);
      db.prepare('DELETE FROM combat_sessions WHERE user_id = ?').run(targetUser.id);
      db.prepare('DELETE FROM players WHERE user_id = ?').run(targetUser.id);
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setTitle('✅ Player Reset')
          .setDescription(`${targetUser.username}'s data has been completely reset.`)
          .setColor(0x2ecc71)],
      });
    }

    case 'setdungeon': {
      const floor = interaction.options.getInteger('floor');
      PlayerDB.getOrCreate(targetUser.id, targetUser.username);
      PlayerDB.setDungeonFloor(targetUser.id, floor);
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setTitle('✅ Dungeon Floor Set')
          .setDescription(`${targetUser.username} is now on floor **${floor}**.`)
          .setColor(0x2ecc71)],
      });
    }

    case 'setwizard': {
      const status = interaction.options.getBoolean('status');
      PlayerDB.getOrCreate(targetUser.id, targetUser.username);
      PlayerDB.setWizard(targetUser.id, status);
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setTitle('✅ Wizard Status Set')
          .setDescription(`${targetUser.username} is ${status ? 'now a Wizard' : 'no longer a Wizard'}.`)
          .setColor(0x2ecc71)],
      });
    }

    default:
      return interaction.editReply({ content: 'Unknown subcommand.' });
  }
}

export async function autocomplete(interaction: any) {
  const focused = interaction.options.getFocused(true);
  const sub = interaction.options.getSubcommand();

  if (sub === 'setfamily') {
    const choices = FAMILIES
      .filter(f => f.name.toLowerCase().includes(focused.value.toLowerCase()))
      .slice(0, 25)
      .map(f => ({ name: `${f.name} (${f.rarity})`, value: f.name }));
    await interaction.respond(choices);
  } else if (sub === 'setwand') {
    const choices = WANDS
      .filter(w => w.name.toLowerCase().includes(focused.value.toLowerCase()))
      .slice(0, 25)
      .map(w => ({ name: `${w.name} (${w.rarity})`, value: w.name }));
    await interaction.respond(choices);
  }
}
