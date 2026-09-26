import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { PlayerDB } from '../database';
import { PlayerManager } from '../systems/player';
import { canWork, performWork, createWorkEmbed } from '../systems/work';
import { CONFIG } from '../config';

export const data = new SlashCommandBuilder()
  .setName('work')
  .setDescription('Work to earn XP and coins');

export async function execute(interaction: any) {
  await interaction.deferReply();

  const player = PlayerDB.getOrCreate(interaction.user.id, interaction.user.username);

  // Check cooldown
  const { canWork: able, remainingMs } = canWork(player);
  if (!able) {
    const seconds = Math.ceil(remainingMs / 1000);
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('⏰ On Cooldown')
        .setDescription(`You need to rest! Try again in **${seconds}** seconds.`)
        .setColor(0xe74c3c)],
    });
  }

  // Perform work
  const result = performWork(player);

  // Check level up
  const levelsGained = await PlayerManager.checkLevelUp(interaction.user.id);

  // Refresh player data
  const updatedPlayer = PlayerDB.get(interaction.user.id);
  const embed = createWorkEmbed(result, updatedPlayer);

  if (levelsGained.length > 0) {
    embed.addFields({
      name: '🎉 LEVEL UP!',
      value: `You reached level **${updatedPlayer.level}**!`,
      inline: false,
    });
    embed.setColor(0xf1c40f);

    // Check wizard unlock
    if (updatedPlayer.level >= CONFIG.WIZARD_UNLOCK_LEVEL && !updatedPlayer.is_wizard) {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('become_wizard')
          .setLabel('🧙 Become a Wizard!')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('stay_worker')
          .setLabel('💼 Stay a Worker')
          .setStyle(ButtonStyle.Secondary),
      );

      return interaction.editReply({ embeds: [embed], components: [row] });
    }
  }

  return interaction.editReply({ embeds: [embed] });
}
