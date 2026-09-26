import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { PlayerDB, SpellDB } from '../database';
import { getSpellById } from '../config/spells';

export const data = new SlashCommandBuilder()
  .setName('cast')
  .setDescription('Cast a spell (only usable in combat)')
  .addStringOption(option =>
    option.setName('spell')
      .setDescription('The spell to cast')
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function execute(interaction: any) {
  await interaction.deferReply();

  const spellName = interaction.options.getString('spell');
  const player = PlayerDB.getOrCreate(interaction.user.id, interaction.user.username);

  if (!player.is_wizard) {
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('❌ Not a Wizard')
        .setDescription('You must be a Wizard/Witch to cast spells.')
        .setColor(0xe74c3c)],
    });
  }

  // Find spell
  const spell = getSpellById(spellName.toLowerCase());
  if (!spell) {
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('❌ Unknown Spell')
        .setDescription(`"${spellName}" is not a known spell.`)
        .setColor(0xe74c3c)],
    });
  }

  // Check if learned
  if (!SpellDB.hasSpell(player.user_id, spell.id)) {
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('❌ Spell Not Learned')
        .setDescription(`You haven't learned **${spell.name}** yet. Buy it from the Magic Shop!`)
        .setColor(0xe74c3c)],
    });
  }

  // Check if in combat
  const { getActiveCombat } = require('../systems/combat');
  const combat = getActiveCombat(player.user_id);

  if (!combat) {
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('❌ Not in Combat')
        .setDescription('You can only cast spells during dungeon combat.\nUse `/dungeon enter` to start!')
        .setColor(0xe74c3c)],
    });
  }

  // Cast spell in combat
  const { processSpellCast, createCombatEmbed, createCombatButtons, enemyTurn, tickCooldowns, calculateRewards, endCombat } = require('../systems/combat');
  const result = await processSpellCast(combat, player, spell.id);

  if (!result.success) {
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('❌ Cast Failed')
        .setDescription(result.message)
        .setColor(0xe74c3c)],
    });
  }

  // Check if all enemies dead
  const allDead = combat.enemies.every((e: any) => e.hp <= 0);

  if (allDead) {
    // Victory!
    const rewards = calculateRewards(combat);
    PlayerDB.addXP(player.user_id, rewards.xp);
    PlayerDB.addCoins(player.user_id, rewards.coins);

    // Add loot
    const { InventoryDB } = require('../database');
    for (const loot of rewards.loot) {
      InventoryDB.addItem(player.user_id, loot, 1);
    }

    // Advance dungeon
    PlayerDB.setDungeonFloor(player.user_id, combat.floor);
    PlayerDB.update(player.user_id, { hp: combat.playerHp, mp: combat.playerMp });

    // Check level up
    const levelsGained = await PlayerManager_checkLevelUp(player.user_id);

    endCombat(player.user_id, true);

    const lootText = rewards.loot.length > 0 ? rewards.loot.join(', ') : 'None';

    const victoryEmbed = new EmbedBuilder()
      .setTitle('🏆 Floor Cleared!')
      .setDescription(`You defeated all enemies on Floor ${combat.floor}!`)
      .setColor(0xf1c40f)
      .addFields(
        { name: '✨ Spell', value: result.message, inline: false },
        { name: '📈 XP Earned', value: `+${rewards.xp}`, inline: true },
        { name: '💰 Coins Earned', value: `+${rewards.coins}`, inline: true },
        { name: '🎁 Loot', value: lootText, inline: true },
      );

    if (levelsGained.length > 0) {
      victoryEmbed.addFields({ name: '🎉 Level Up!', value: `You reached level **${levelsGained[levelsGained.length - 1]}**!`, inline: false });
    }

    return interaction.editReply({ embeds: [victoryEmbed] });
  }

  // Enemy turn
  const enemyResult = enemyTurn(combat, player);
  combat.playerHp -= enemyResult.damage;
  combat.turn++;
  tickCooldowns(combat);

  // Check player death
  if (combat.playerHp <= 0) {
    endCombat(player.user_id, false);
    PlayerDB.update(player.user_id, { hp: Math.floor(PlayerManager_getEffectiveMaxHP(player) * 0.5) });

    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('💀 Defeated!')
        .setDescription('You were defeated in the dungeon. You retreat to recover.')
        .setColor(0xe74c3c)
        .addFields(
          { name: '✨ Your Spell', value: result.message, inline: false },
          { name: '💥 Enemy Damage', value: `${enemyResult.damage}`, inline: true },
        )],
    });
  }

  // Update player HP/MP
  PlayerDB.update(player.user_id, { hp: combat.playerHp, mp: combat.playerMp });

  const combatEmbed = createCombatEmbed(combat, player, `${result.message}\n\n💥 Enemies deal ${enemyResult.damage} damage!${enemyResult.special ? `\n⚡ ${enemyResult.special}` : ''}`);
  const buttons = createCombatButtons(combat, player);

  return interaction.editReply({ embeds: [combatEmbed], components: buttons });
}

function PlayerManager_checkLevelUp(userId: string): Promise<number[]> {
  const { PlayerManager } = require('../systems/player');
  return PlayerManager.checkLevelUp(userId);
}

function PlayerManager_getEffectiveMaxHP(player: any): number {
  const { PlayerManager } = require('../systems/player');
  return PlayerManager.getEffectiveMaxHP(player);
}

export async function autocomplete(interaction: any) {
  const focused = interaction.options.getFocused().toLowerCase();
  const player = PlayerDB.getOrCreate(interaction.user.id, interaction.user.username);
  const learned = SpellDB.getLearned(player.user_id);
  const { SPELLS } = require('../config/spells');

  const choices = learned
    .map((ls: any) => SPELLS.find((s: any) => s.id === ls.spell_id))
    .filter((s: any) => s && s.name.toLowerCase().includes(focused))
    .slice(0, 25)
    .map((s: any) => ({ name: `${s.name} (${s.mpCost} MP)`, value: s.id }));

  await interaction.respond(choices);
}
