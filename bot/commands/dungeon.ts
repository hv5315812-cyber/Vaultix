import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { PlayerDB } from '../database';
import { PlayerManager } from '../systems/player';
import { CONFIG } from '../config';

export const data = new SlashCommandBuilder()
  .setName('dungeon')
  .setDescription('Enter or check the dungeon')
  .addSubcommand(sub =>
    sub.setName('enter').setDescription('Enter the next dungeon floor')
  )
  .addSubcommand(sub =>
    sub.setName('status').setDescription('Check your dungeon progress')
  );

export async function execute(interaction: any) {
  await interaction.deferReply();

  const sub = interaction.options.getSubcommand();
  const player = PlayerDB.getOrCreate(interaction.user.id, interaction.user.username);

  if (sub === 'status') {
    const embed = new EmbedBuilder()
      .setTitle('🏰 Dungeon Status')
      .setColor(0x8e44ad)
      .addFields(
        { name: '📊 Current Floor', value: `${player.dungeon_floor}/50`, inline: true },
        { name: '🎯 Next Floor', value: player.dungeon_floor >= 50 ? 'Completed!' : `${player.dungeon_floor + 1}`, inline: true },
        { name: '🧙 Wizard Status', value: player.is_wizard ? 'Yes' : 'No', inline: true },
      );

    if (player.dungeon_floor >= 50) {
      embed.setDescription('🎉 You have completed all 50 floors!');
    } else if (!player.is_wizard) {
      embed.setDescription('Become a Wizard/Witch to enter the dungeon!');
    } else {
      embed.setDescription(`You are ready to enter Floor ${player.dungeon_floor + 1}.\nUse \`/dungeon enter\` to begin!`);
    }

    return interaction.editReply({ embeds: [embed] });
  }

  // Enter dungeon
  if (!player.is_wizard) {
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('❌ Not a Wizard')
        .setDescription('You must become a Wizard/Witch to enter the dungeon!')
        .setColor(0xe74c3c)],
    });
  }

  if (player.dungeon_floor >= 50) {
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('🏆 Dungeon Complete!')
        .setDescription('You have conquered all 50 floors! You are a true master.')
        .setColor(0xf1c40f)],
    });
  }

  // Import combat system dynamically to avoid circular deps
  const { startCombat, createCombatEmbed, createCombatButtons } = require('../systems/combat');
  const combat = startCombat(player.user_id, interaction.channelId, player);
  const embed = createCombatEmbed(combat, player, `You enter Floor ${combat.floor}. Prepare for battle!`);
  const buttons = createCombatButtons(combat, player);

  return interaction.editReply({ embeds: [embed], components: buttons });
}
