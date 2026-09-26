import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { PlayerDB } from '../database';
import { WANDS, STAFFS } from '../config/wands';
import { RARITY_COLORS } from '../config';

export const data = new SlashCommandBuilder()
  .setName('wand')
  .setDescription('View your wand information');

export async function execute(interaction: any) {
  await interaction.deferReply();

  const player = PlayerDB.getOrCreate(interaction.user.id, interaction.user.username);

  if (!player.wand) {
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('🪄 No Wand')
        .setDescription('You don\'t have a wand yet.\nBecome a Wizard/Witch and a wand will choose you!')
        .setColor(0x95a5a6)],
    });
  }

  const wand = WANDS.find(w => w.name === player.wand) || STAFFS.find((s: any) => s.name === player.wand);
  if (!wand) {
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('❌ Error')
        .setDescription('Wand data not found.')
        .setColor(0xe74c3c)],
    });
  }

  const embed = new EmbedBuilder()
    .setTitle(`🪄 ${wand.name}`)
    .setDescription(wand.description)
    .setColor(RARITY_COLORS[wand.rarity] || 0x3498db)
    .addFields(
      { name: '⭐ Rarity', value: wand.rarity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), inline: true },
      { name: '🌳 Wood', value: wand.wood, inline: true },
      { name: '💎 Core', value: wand.core, inline: true },
      { name: '📏 Length', value: wand.length, inline: true },
      { name: '⚔️ Damage Multiplier', value: `x${wand.damageMultiplier}`, inline: true },
      { name: '💫 MP Bonus', value: `+${wand.mpBonus}`, inline: true },
      { name: '✨ Spell Efficiency', value: `${Math.floor(wand.spellEfficiency * 100)}% MP saved`, inline: true },
    );

  if (wand.passive) {
    embed.addFields({ name: '🔮 Passive Ability', value: wand.passive, inline: false });
  }

  if ((wand as any).staffPassive) {
    embed.addFields({ name: '🌟 Staff Power', value: (wand as any).staffPassive, inline: false });
  }

  return interaction.editReply({ embeds: [embed] });
}
