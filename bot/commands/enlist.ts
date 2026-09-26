import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { PlayerDB } from '../database';
import { PlayerManager } from '../systems/player';
import { CONFIG } from '../config';
import { getFamilyByName } from '../config/families';
import { WANDS } from '../config/wands';

export const data = new SlashCommandBuilder()
  .setName('enlist')
  .setDescription('Begin your journey in Vaultix (creates your profile)');

export async function execute(interaction: any) {
  await interaction.deferReply();

  const existing = PlayerDB.get(interaction.user.id);
  if (existing) {
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('❌ Already Enlisted')
        .setDescription('You already have a profile! Use `/profile` to view it.')
        .setColor(0xe74c3c)],
    });
  }

  // Create player
  const player = PlayerDB.create(interaction.user.id, interaction.user.username);

  const embed = new EmbedBuilder()
    .setTitle('✨ Welcome to Vaultix!')
    .setDescription(`Welcome, **${interaction.user.username}**! Your journey begins now.\n\nYou are a humble worker, earning your way through the magical world.\n\nUse \`/work\` to earn XP and coins.\nReach **Level ${CONFIG.WIZARD_UNLOCK_LEVEL}** to unlock the path of the Wizard!`)
    .setColor(0x9b59b6)
    .addFields(
      { name: '⭐ Level', value: '1', inline: true },
      { name: '💼 Status', value: 'Worker', inline: true },
      { name: '🎯 Goal', value: `Reach Level ${CONFIG.WIZARD_UNLOCK_LEVEL}`, inline: true },
    );

  return interaction.editReply({ embeds: [embed] });
}
