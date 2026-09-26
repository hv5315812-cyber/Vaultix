import { PlayerDB, SpellDB, InventoryDB } from '../database';
import { CONFIG, RARITY_COLORS } from '../config';
import { FAMILIES, getFamilyByName, type Family } from '../config/families';
import { WANDS, type Wand } from '../config/wands';
import { getSpellById, type Spell } from '../config/spells';
import { EmbedBuilder } from 'discord.js';

export interface PlayerData {
  user_id: string;
  username: string;
  level: number;
  xp: number;
  work_xp: number;
  coins: number;
  hp: number;
  max_hp: number;
  mp: number;
  max_mp: number;
  family: string | null;
  wand: string | null;
  is_wizard: number;
  dungeon_floor: number;
  damage: number;
  defense: number;
  luck: number;
  intelligence: number;
  rerolls_used_today: number;
  reroll_reset_date: string | null;
  work_cooldown: string | null;
}

export class PlayerManager {
  static getEffectiveMaxMP(player: PlayerData): number {
    const familyBonus = player.family ? (getFamilyByName(player.family)?.bonuses.mp || 0) : 0;
    const wandBonus = player.wand ? (WANDS.find(w => w.name === player.wand)?.mpBonus || 0) : 0;
    return CONFIG.BASE_MP + (player.level * CONFIG.MP_PER_LEVEL) + familyBonus + wandBonus;
  }

  static getEffectiveMaxHP(player: PlayerData): number {
    const familyBonus = player.family ? (getFamilyByName(player.family)?.bonuses.hp || 0) : 0;
    return CONFIG.BASE_PLAYER_HP + (player.level * CONFIG.HP_PER_LEVEL) + familyBonus;
  }

  static getEffectiveDamage(player: PlayerData): number {
    const familyBonus = player.family ? (getFamilyByName(player.family)?.bonuses.damage || 0) : 0;
    const wandMultiplier = player.wand ? (WANDS.find(w => w.name === player.wand)?.damageMultiplier || 1) : 1;
    const intBonus = player.intelligence * 0.5;
    return Math.floor((CONFIG.BASE_DAMAGE + (player.level * CONFIG.DAMAGE_PER_LEVEL) + familyBonus + intBonus) * wandMultiplier);
  }

  static getEffectiveDefense(player: PlayerData): number {
    const familyBonus = player.family ? (getFamilyByName(player.family)?.bonuses.defense || 0) : 0;
    return player.defense + familyBonus;
  }

  static getEffectiveLuck(player: PlayerData): number {
    const familyBonus = player.family ? (getFamilyByName(player.family)?.bonuses.luck || 0) : 0;
    return player.luck + familyBonus;
  }

  static getEffectiveIntelligence(player: PlayerData): number {
    const familyBonus = player.family ? (getFamilyByName(player.family)?.bonuses.intelligence || 0) : 0;
    return player.intelligence + familyBonus;
  }

  static getXpForNextLevel(level: number): number {
    return CONFIG.XP_PER_LEVEL(level);
  }

  static async checkLevelUp(userId: string): Promise<number[]> {
    const player = PlayerDB.get(userId) as PlayerData;
    const levelsGained: number[] = [];
    let xp = player.xp;
    let level = player.level;

    while (xp >= CONFIG.XP_PER_LEVEL(level) && level < CONFIG.MAX_LEVEL) {
      xp -= CONFIG.XP_PER_LEVEL(level);
      level++;
      levelsGained.push(level);
    }

    if (levelsGained.length > 0) {
      const newMaxHP = PlayerManager.getEffectiveMaxHP({ ...player, level });
      const newMaxMP = PlayerManager.getEffectiveMaxMP({ ...player, level });
      PlayerDB.levelUp(userId, level);
      PlayerDB.update(userId, { xp, max_hp: newMaxHP, hp: newMaxHP, max_mp: newMaxMP, mp: newMaxMP });
    }

    return levelsGained;
  }

  static canBecomeWizard(player: PlayerData): boolean {
    return player.level >= CONFIG.WIZARD_UNLOCK_LEVEL && !player.is_wizard;
  }

  static assignFamily(): Family {
    const roll = Math.random();
    let cumulative = 0;
    const chances = CONFIG.FAMILY_RARITY_CHANCES;

    for (const [rarity, chance] of Object.entries(chances)) {
      cumulative += chance;
      if (roll <= cumulative) {
        const familiesOfRarity = FAMILIES.filter(f => f.rarity === rarity);
        return familiesOfRarity[Math.floor(Math.random() * familiesOfRarity.length)];
      }
    }

    // Fallback to common
    const commons = FAMILIES.filter(f => f.rarity === 'common');
    return commons[Math.floor(Math.random() * commons.length)];
  }

  static assignWand(): Wand {
    // Wands choose their owner - weighted random based on player luck
    const roll = Math.random();
    let rarity: string;

    if (roll < 0.005) rarity = 'extremely_rare';
    else if (roll < 0.02) rarity = 'mythic';
    else if (roll < 0.07) rarity = 'legendary';
    else if (roll < 0.17) rarity = 'epic';
    else if (roll < 0.35) rarity = 'rare';
    else if (roll < 0.60) rarity = 'uncommon';
    else rarity = 'common';

    const wandsOfRarity = WANDS.filter(w => w.rarity === rarity);
    return wandsOfRarity[Math.floor(Math.random() * wandsOfRarity.length)];
  }

  static createProfileEmbed(player: PlayerData): EmbedBuilder {
    const family = player.family ? getFamilyByName(player.family) : null;
    const wand = player.wand ? WANDS.find(w => w.name === player.wand) : null;
    const xpNeeded = CONFIG.XP_PER_LEVEL(player.level);
    const xpProgress = `${player.xp}/${xpNeeded}`;

    const embed = new EmbedBuilder()
      .setTitle('━━━━━━━━━━━━━━━━━━')
      .setDescription(`✨ **VAULTIX PROFILE**\n━━━━━━━━━━━━━━━━━━`)
      .setColor(family ? (RARITY_COLORS[family.rarity] || 0x3498db) : 0x3498db)
      .addFields(
        { name: '👤 Player', value: player.username, inline: true },
        { name: '⭐ Level', value: `${player.level}`, inline: true },
        { name: '📊 XP', value: xpProgress, inline: true },
        { name: '💰 Coins', value: `${player.coins}`, inline: true },
        { name: '🏠 Family', value: family ? `${family.name} (${family.rarity})` : 'None', inline: true },
        { name: '🪄 Wand', value: wand ? `${wand.name}` : 'None', inline: true },
        { name: '🔮 Status', value: player.is_wizard ? '🧙 Wizard' : '👷 Worker', inline: true },
        { name: '💫 MP', value: `${player.mp}/${PlayerManager.getEffectiveMaxMP(player)}`, inline: true },
        { name: '❤️ HP', value: `${player.hp}/${PlayerManager.getEffectiveMaxHP(player)}`, inline: true },
        { name: '🏰 Dungeon Floor', value: `${player.dungeon_floor}/50`, inline: true },
      )
      .setTimestamp();

    return embed;
  }

  static createStatsEmbed(player: PlayerData): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle('📊 Detailed Statistics')
      .setColor(0x9b59b6)
      .addFields(
        { name: '⚔️ Damage', value: `${PlayerManager.getEffectiveDamage(player)}`, inline: true },
        { name: '🛡️ Defense', value: `${PlayerManager.getEffectiveDefense(player)}`, inline: true },
        { name: '🍀 Luck', value: `${PlayerManager.getEffectiveLuck(player)}`, inline: true },
        { name: '🧠 Intelligence', value: `${PlayerManager.getEffectiveIntelligence(player)}`, inline: true },
        { name: '❤️ Max HP', value: `${PlayerManager.getEffectiveMaxHP(player)}`, inline: true },
        { name: '💫 Max MP', value: `${PlayerManager.getEffectiveMaxMP(player)}`, inline: true },
        { name: '📈 Work XP Earned', value: `${player.work_xp}`, inline: true },
        { name: '🏰 Dungeon Progress', value: `Floor ${player.dungeon_floor}/50`, inline: true },
      );
  }
}
