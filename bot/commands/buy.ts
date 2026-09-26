import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { PlayerDB, SpellDB, InventoryDB } from '../database';
import { SHOP_ITEMS, getShopItemById } from '../config/shop';
import { SPELLS, getSpellById } from '../config/spells';
import { RARITY_COLORS } from '../config';

export const data = new SlashCommandBuilder()
  .setName('buy')
  .setDescription('Buy an item from the Magic Shop')
  .addStringOption(option =>
    option.setName('item')
      .setDescription('The item to buy')
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addIntegerOption(option =>
    option.setName('quantity')
      .setDescription('Quantity to buy (default: 1)')
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(99)
  );

export async function execute(interaction: any) {
  await interaction.deferReply();

  const itemName = interaction.options.getString('item');
  const quantity = interaction.options.getInteger('quantity') || 1;

  // Anti-exploit: validate quantity
  if (quantity < 1 || quantity > 99) {
    return interaction.editReply({ embeds: [new EmbedBuilder().setTitle('❌ Invalid quantity').setColor(0xe74c3c)] });
  }

  // Find item
  const shopItem = SHOP_ITEMS.find(i => i.name.toLowerCase() === itemName.toLowerCase() || i.id === itemName.toLowerCase());
  if (!shopItem) {
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('❌ Item Not Found')
        .setDescription(`"${itemName}" is not available in the shop.`)
        .setColor(0xe74c3c)],
    });
  }

  const player = PlayerDB.getOrCreate(interaction.user.id, interaction.user.username);
  const totalPrice = shopItem.price * quantity;

  // Check coins
  if (player.coins < totalPrice) {
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('❌ Not Enough Coins')
        .setDescription(`You need **${totalPrice}** coins but only have **${player.coins}**.`)
        .setColor(0xe74c3c)],
    });
  }

  // Check if spell already learned
  if (shopItem.category === 'spell' && shopItem.spellId) {
    if (SpellDB.hasSpell(player.user_id, shopItem.spellId)) {
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setTitle('❌ Already Learned')
          .setDescription(`You already know **${shopItem.name}**.`)
          .setColor(0xe74c3c)],
      });
    }

    // Check level requirement
    const spell = getSpellById(shopItem.spellId);
    if (spell && player.level < spell.requiredLevel) {
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setTitle('❌ Level Too Low')
          .setDescription(`You need to be level **${spell.requiredLevel}** to learn ${shopItem.name}.`)
          .setColor(0xe74c3c)],
      });
    }

    // Check wizard status
    if (!player.is_wizard) {
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setTitle('❌ Not a Wizard')
          .setDescription('You must become a Wizard/Witch to purchase spells.')
          .setColor(0xe74c3c)],
      });
    }

    // Purchase spell
    PlayerDB.update(player.user_id, { coins: player.coins - totalPrice });
    SpellDB.learnSpell(player.user_id, shopItem.spellId);

    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('✨ Spell Learned!')
        .setDescription(`You learned **${shopItem.name}**!\nUse it in combat with the spell button.`)
        .setColor(0x9b59b6)
        .addFields(
          { name: '💰 Cost', value: `${totalPrice} coins`, inline: true },
          { name: '💫 Remaining', value: `${player.coins - totalPrice} coins`, inline: true },
        )],
    });
  }

  // Check stack limit for stackable items
  if (shopItem.stackable && shopItem.maxStack) {
    const currentQty = InventoryDB.getQuantity(player.user_id, shopItem.id);
    if (currentQty + quantity > shopItem.maxStack) {
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setTitle('❌ Inventory Full')
          .setDescription(`You can only hold ${shopItem.maxStack} of this item. You have ${currentQty}.`)
          .setColor(0xe74c3c)],
      });
    }
  }

  // Purchase item
  PlayerDB.update(player.user_id, { coins: player.coins - totalPrice });
  InventoryDB.addItem(player.user_id, shopItem.id, quantity);

  return interaction.editReply({
    embeds: [new EmbedBuilder()
      .setTitle('🛒 Purchase Complete!')
      .setDescription(`You bought **${shopItem.name}** x${quantity}`)
      .setColor(0x2ecc71)
      .addFields(
        { name: '💰 Total Cost', value: `${totalPrice} coins`, inline: true },
        { name: '💫 Remaining', value: `${player.coins - totalPrice} coins`, inline: true },
      )],
  });
}

export async function autocomplete(interaction: any) {
  const focused = interaction.options.getFocused().toLowerCase();
  const choices = SHOP_ITEMS
    .filter(i => i.name.toLowerCase().includes(focused))
    .slice(0, 25)
    .map(i => ({ name: `${i.name} (${i.price} coins)`, value: i.name }));
  await interaction.respond(choices);
}
