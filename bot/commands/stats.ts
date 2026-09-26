import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { PlayerDB } from '../database';
import { PlayerManager } from '../systems/player';

export const data = new SlashCommandBuilder()
  .setName('stats')
  .setDescription('View your detailed combat statistics');

export async function execute(interaction: any) {
  await interaction.deferReply();

  const player = PlayerDB.getOrCreate(interaction.user.id, interaction.user.username);
  const embed = PlayerManager.createStatsEmbed(player);

  return interaction.editReply({ embeds: [embed] });
}
