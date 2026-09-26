import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { SHOP_ITEMS } from '../config/shop';
import { RARITY_COLORS } from '../config';

export const data = new SlashCommandBuilder()
  .setName('magicshop')
  .setDescription('Browse the Magic Shop');

export async function execute(interaction: any) {
  await interaction.deferReply();

  const categories = ['spell', 'potion', 'reroll', 'material'];
  const categoryEmojis: Record<string, string> = {
    spell: '📖',
    potion: '🧪',
    reroll: '🔄',
    material: '💎',
  };

  const rows: ActionRowBuilder<ButtonBuilder>[] = [];

  const row = new ActionRowBuilder<ButtonBuilder>();
  for (const cat of categories) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`shop_${cat}`)
        .setLabel(`${categoryEmojis[cat]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}s`)
        .setStyle(ButtonStyle.Primary)
    );
  }
  rows.push(row);

  const embed = new EmbedBuilder()
    .setTitle('🏪 Magic Shop')
    .setDescription('Welcome to the Magic Shop! Browse items by category.\n\nUse `/buy <item_name>` to purchase items.')
    .setColor(0xf39c12)
    .addFields(
      { name: '📖 Spells', value: `${SHOP_ITEMS.filter(i => i.category === 'spell').length} available`, inline: true },
      { name: '🧪 Potions', value: `${SHOP_ITEMS.filter(i => i.category === 'potion').length} available`, inline: true },
      { name: '🔄 Rerolls', value: `${SHOP_ITEMS.filter(i => i.category === 'reroll').length} available`, inline: true },
      { name: '💎 Materials', value: `${SHOP_ITEMS.filter(i => i.category === 'material').length} available`, inline: true },
    );

  return interaction.editReply({ embeds: [embed], components: rows });
}
