import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { PlayerDB } from '../database';
import { PlayerManager } from '../systems/player';

export const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('View your Vaultix profile')
  .addUserOption(option =>
    option.setName('user').setDescription('View another user\'s profile').setRequired(false)
  );

export async function execute(interaction: any) {
  await interaction.deferReply();

  const targetUser = interaction.options.getUser('user') || interaction.user;
  const player = PlayerDB.get(targetUser.id);

  if (!player) {
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('❌ Not Found')
        .setDescription(`${targetUser.username} hasn't started their journey yet!`)
        .setColor(0xe74c3c)],
    });
  }

  const embed = PlayerManager.createProfileEmbed(player);
  return interaction.editReply({ embeds: [embed] });
}
