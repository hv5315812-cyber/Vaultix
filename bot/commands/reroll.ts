import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { PlayerDB, InventoryDB } from '../database';
import { PlayerManager } from '../systems/player';
import { CONFIG, RARITY_COLORS } from '../config';
import { getFamilyByName } from '../config/families';

export const data = new SlashCommandBuilder()
  .setName('reroll')
  .setDescription('Reroll your family (requires Family Reroll item)');

export async function execute(interaction: any) {
  await interaction.deferReply();

  const player = PlayerDB.getOrCreate(interaction.user.id, interaction.user.username);

  // Check if wizard
  if (!player.is_wizard) {
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('❌ Not a Wizard')
        .setDescription('You must become a Wizard/Witch to reroll your family.')
        .setColor(0xe74c3c)],
    });
  }

  // Check anti-exploit: daily limit
  const today = new Date().toISOString().split('T')[0];
  if (player.reroll_reset_date !== today) {
    PlayerDB.resetRerollCount(player.user_id);
  }

  if (player.rerolls_used_today >= CONFIG.MAX_REROLLS_PER_DAY) {
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('❌ Daily Limit Reached')
        .setDescription(`You've used all ${CONFIG.MAX_REROLLS_PER_DAY} rerolls for today. Try again tomorrow!`)
        .setColor(0xe74c3c)],
    });
  }

  // Check for reroll item
  const rerollCount = InventoryDB.getQuantity(player.user_id, 'family_reroll');
  if (rerollCount <= 0) {
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('❌ No Rerolls')
        .setDescription('You don\'t have any Family Rerolls!\nBuy them from the Magic Shop with `/buy family_reroll`.')
        .setColor(0xe74c3c)],
    });
  }

  // Get old family
  const oldFamily = player.family ? getFamilyByName(player.family) : null;
  const oldFamilyName = oldFamily?.name || 'None';
  const oldFamilyRarity = oldFamily?.rarity || 'none';

  // Remove reroll item
  InventoryDB.removeItem(player.user_id, 'family_reroll', 1);
  PlayerDB.incrementReroll(player.user_id);

  // Assign new family
  const newFamily = PlayerManager.assignFamily();
  PlayerDB.setFamily(player.user_id, newFamily.name);

  // Update player stats with new family bonuses
  const updatedPlayer = PlayerDB.get(interaction.user.id);
  const newMaxHP = PlayerManager.getEffectiveMaxHP(updatedPlayer);
  const newMaxMP = PlayerManager.getEffectiveMaxMP(updatedPlayer);
  PlayerDB.update(player.user_id, {
    max_hp: newMaxHP,
    hp: Math.min(updatedPlayer.hp, newMaxHP),
    max_mp: newMaxMP,
    mp: Math.min(updatedPlayer.mp, newMaxMP),
  });

  const bonusText = Object.entries(newFamily.bonuses)
    .map(([key, value]) => `+${value}% ${key.charAt(0).toUpperCase() + key.slice(1)}`)
    .join('\n');

  const embed = new EmbedBuilder()
    .setTitle('🔄 Family Rerolled!')
    .setColor(RARITY_COLORS[newFamily.rarity] || 0x3498db)
    .addFields(
      { name: '❌ Old Family', value: `${oldFamilyName} (${oldFamilyRarity})`, inline: true },
      { name: '✅ New Family', value: `${newFamily.name} (${newFamily.rarity.replace('_', ' ')})`, inline: true },
      { name: '🎁 New Bonuses', value: bonusText, inline: false },
    );

  if (newFamily.passive) {
    embed.addFields({ name: '✨ Passive', value: newFamily.passive, inline: false });
  }

  embed.setFooter({ text: `Rerolls remaining today: ${CONFIG.MAX_REROLLS_PER_DAY - (player.rerolls_used_today + 1)}` });

  return interaction.editReply({ embeds: [embed] });
}
