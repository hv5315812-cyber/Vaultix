import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { PlayerDB, InventoryDB } from '../database';
import { SHOP_ITEMS } from '../config/shop';
import { RARITY_COLORS } from '../config';

export const data = new SlashCommandBuilder()
  .setName('inventory')
  .setDescription('View your inventory');

export async function execute(interaction: any) {
  await interaction.deferReply();

  const player = PlayerDB.getOrCreate(interaction.user.id, interaction.user.username);
  const items = InventoryDB.getAll(player.user_id);

  if (items.length === 0) {
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('🎒 Empty Inventory')
        .setDescription('Your inventory is empty.\nVisit the Magic Shop with `/magicshop` to buy items!')
        .setColor(0x95a5a6)],
    });
  }

  const itemList = items.map(item => {
    const shopItem = SHOP_ITEMS.find(s => s.id === item.item_id);
    const name = shopItem ? shopItem.name : item.item_id;
    return `**${name}** x${item.quantity}`;
  }).join('\n');

  const embed = new EmbedBuilder()
    .setTitle('🎒 Your Inventory')
    .setDescription(itemList)
    .setColor(0x3498db)
    .setFooter({ text: `${items.length} item types` });

  return interaction.editReply({ embeds: [embed] });
}
