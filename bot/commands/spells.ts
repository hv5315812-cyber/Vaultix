import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { PlayerDB, SpellDB } from '../database';
import { SPELLS } from '../config/spells';
import { RARITY_COLORS } from '../config';

export const data = new SlashCommandBuilder()
  .setName('spells')
  .setDescription('View your learned spells');

export async function execute(interaction: any) {
  await interaction.deferReply();

  const player = PlayerDB.getOrCreate(interaction.user.id, interaction.user.username);

  if (!player.is_wizard) {
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('❌ Not a Wizard')
        .setDescription('You need to become a Wizard/Witch to learn spells!')
        .setColor(0xe74c3c)],
    });
  }

  const learnedSpells = SpellDB.getLearned(player.user_id);

  if (learnedSpells.length === 0) {
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('📖 No Spells Learned')
        .setDescription('Visit the Magic Shop to purchase spells!\nUse `/magicshop` to browse available spells.')
        .setColor(0x95a5a6)],
    });
  }

  const spellList = learnedSpells.map(ls => {
    const spell = SPELLS.find(s => s.id === ls.spell_id);
    if (!spell) return null;
    const upgradeText = ls.upgrade_level > 0 ? ` [+${ls.upgrade_level}]` : '';
    return `**${spell.name}**${upgradeText} - ${spell.type === 'heal' ? `❤️ +${spell.damage} HP` : `⚔️ ${spell.damage} DMG`} | 💫 ${spell.mpCost} MP`;
  }).filter(Boolean).join('\n');

  const embed = new EmbedBuilder()
    .setTitle('📖 Your Spells')
    .setDescription(spellList || 'No spells found.')
    .setColor(0x9b59b6)
    .setFooter({ text: `Use /cast <spell> in combat to cast spells` });

  return interaction.editReply({ embeds: [embed] });
}
