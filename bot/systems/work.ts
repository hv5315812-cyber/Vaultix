import { PlayerDB } from '../database';
import { PlayerManager, type PlayerData } from './player';
import { CONFIG } from '../config';
import { EmbedBuilder } from 'discord.js';

export interface WorkResult {
  xpGained: number;
  coinsGained: number;
  canLevelUp: boolean;
  newLevel?: number;
}

export function canWork(player: PlayerData): { canWork: boolean; remainingMs: number } {
  if (!player.work_cooldown) return { canWork: true, remainingMs: 0 };

  const cooldownEnd = new Date(player.work_cooldown).getTime();
  const now = Date.now();
  const remaining = cooldownEnd - now;

  if (remaining <= 0) return { canWork: true, remainingMs: 0 };
  return { canWork: false, remainingMs: remaining };
}

export function performWork(player: PlayerData): WorkResult {
  const xpGained = Math.floor(Math.random() * (CONFIG.WORK_XP_MAX - CONFIG.WORK_XP_MIN + 1)) + CONFIG.WORK_XP_MIN;
  const coinsGained = Math.floor(Math.random() * (CONFIG.WORK_COINS_MAX - CONFIG.WORK_COINS_MIN + 1)) + CONFIG.WORK_COINS_MIN;

  // Apply family bonuses
  const { getFamilyByName } = require('../config/families');
  const family = player.family ? getFamilyByName(player.family) : null;

  let finalXP = xpGained;
  let finalCoins = coinsGained;

  if (family) {
    if (family.bonuses.xp) finalXP = Math.floor(finalXP * (1 + family.bonuses.xp / 100));
    if (family.bonuses.coins) finalCoins = Math.floor(finalCoins * (1 + family.bonuses.coins / 100));
  }

  // Apply to database
  PlayerDB.addXP(player.user_id, finalXP);
  PlayerDB.addCoins(player.user_id, finalCoins);
  PlayerDB.update(player.user_id, { work_xp: (player.work_xp || 0) + finalXP });

  // Set cooldown
  const cooldownTime = new Date(Date.now() + CONFIG.WORK_COOLDOWN_MS).toISOString();
  PlayerDB.setWorkCooldown(player.user_id, cooldownTime);

  return {
    xpGained: finalXP,
    coinsGained: finalCoins,
    canLevelUp: false,
  };
}

export function createWorkEmbed(result: WorkResult, player: PlayerData): EmbedBuilder {
  const jobs = [
    'sorting magical packages',
    'delivering enchanted scrolls',
    'brewing basic potions',
    'organizing the library',
    'tending the herb garden',
    'polishing crystal balls',
    'feeding the owls',
    'cleaning the potion stores',
    'assisting the alchemist',
    'guarding the vault entrance',
  ];

  const job = jobs[Math.floor(Math.random() * jobs.length)];

  return new EmbedBuilder()
    .setTitle('💼 Work Complete!')
    .setDescription(`You spent your time ${job}.`)
    .setColor(0x2ecc71)
    .addFields(
      { name: '📈 XP Gained', value: `+${result.xpGained}`, inline: true },
      { name: '💰 Coins Earned', value: `+${result.coinsGained}`, inline: true },
      { name: '⏰ Cooldown', value: `${CONFIG.WORK_COOLDOWN_MS / 1000}s`, inline: true },
    )
    .setFooter({ text: `Level ${player.level} | ${player.coins + result.coinsGained} coins total` })
    .setTimestamp();
}
