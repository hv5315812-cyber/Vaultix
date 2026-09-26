import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { PlayerDB } from '../database';
import { getFamilyByName } from '../config/families';
import { RARITY_COLORS } from '../config';

export const data = new SlashCommandBuilder()
  .setName('family')
  .setDescription('View your current family and bonuses');

export async function execute(interaction: any) {
  await interaction.deferReply();

  const player = PlayerDB.getOrCreate(interaction.user.id, interaction.user.username);

  if (!player.family) {
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('🏠 No Family')
        .setDescription('You haven\'t been assigned a family yet.\nBecome a Wizard/Witch to receive your family!')
        .setColor(0x95a5a6)],
    });
  }

  const family = getFamilyByName(player.family);
  if (!family) {
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('❌ Error')
        .setDescription('Your family data is corrupted. Contact an admin.')
        .setColor(0xe74c3c)],
    });
  }

  const bonusText = Object.entries(family.bonuses)
    .map(([key, value]) => `+${value}% ${key.charAt(0).toUpperCase() + key.slice(1)}`)
    .join('\n');

  const embed = new EmbedBuilder()
    .setTitle(`🏠 House ${family.name}`)
    .setDescription(family.description)
    .setColor(RARITY_COLORS[family.rarity] || 0x3498db)
    .addFields(
      { name: '⭐ Rarity', value: family.rarity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), inline: true },
      { name: '🎁 Bonuses', value: bonusText || 'None', inline: true },
    );

  if (family.passive) {
    embed.addFields({ name: '✨ Passive', value: family.passive, inline: false });
  }

  return interaction.editReply({ embeds: [embed] });
}
