import { PlayerDB, CombatDB, InventoryDB } from '../database';
import { PlayerManager, type PlayerData } from './player';
import { CONFIG, RARITY_COLORS } from '../config';
import { MONSTERS, getRandomMonsterForFloor, type Monster } from '../config/monsters';
import { getSpellById, type Spell } from '../config/spells';
import { SpellDB } from '../database';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';

interface CombatEnemy {
  monsterId: string;
  name: string;
  hp: number;
  maxHp: number;
  damage: number;
  defense: number;
  specialAbility?: string;
}

interface CombatState {
  sessionId: string;
  userId: string;
  channelId: string;
  floor: number;
  enemies: CombatEnemy[];
  playerHp: number;
  playerMaxHp: number;
  playerMp: number;
  playerMaxMp: number;
  turn: number;
  buffs: Record<string, number>;
  debuffs: Record<string, number>;
  cooldowns: Record<string, number>;
}

const activeCombats = new Map<string, CombatState>();

function scaleMonster(monster: Monster, floor: number): CombatEnemy {
  const scaling = Math.pow(CONFIG.DUNGEON_MONSTER_SCALING, floor - 1);
  return {
    monsterId: monster.id,
    name: monster.name,
    hp: Math.floor(monster.baseHP * scaling),
    maxHp: Math.floor(monster.baseHP * scaling),
    damage: Math.floor(monster.baseDamage * scaling),
    defense: Math.floor(monster.baseDefense * scaling),
    specialAbility: monster.specialAbility,
  };
}

function getMonsterCount(floor: number): number {
  if (floor <= 6) return floor;
  // After floor 6, groups of 2-4 with occasional larger groups
  const base = Math.min(6, 2 + Math.floor(floor / 10));
  const extra = Math.floor(Math.random() * 3);
  return Math.min(base + extra, 8);
}

export function generateFloorEnemies(floor: number): CombatEnemy[] {
  const count = getMonsterCount(floor);
  const enemies: CombatEnemy[] = [];
  for (let i = 0; i < count; i++) {
    const monster = getRandomMonsterForFloor(floor);
    enemies.push(scaleMonster(monster, floor));
  }
  return enemies;
}

export function startCombat(userId: string, channelId: string, player: PlayerData): CombatState {
  const floor = player.dungeon_floor + 1;
  const enemies = generateFloorEnemies(floor);
  const sessionId = uuidv4();

  const maxHp = PlayerManager.getEffectiveMaxHP(player);
  const maxMp = PlayerManager.getEffectiveMaxMP(player);

  const state: CombatState = {
    sessionId,
    userId,
    channelId,
    floor,
    enemies,
    playerHp: player.hp || maxHp,
    playerMaxHp: maxHp,
    playerMp: player.mp || maxMp,
    playerMaxMp: maxMp,
    turn: 1,
    buffs: {},
    debuffs: {},
    cooldowns: {},
  };

  activeCombats.set(userId, state);
  CombatDB.create(sessionId, userId, channelId, floor, JSON.stringify(enemies), state.playerHp, state.playerMp);

  return state;
}

export function getActiveCombat(userId: string): CombatState | undefined {
  return activeCombats.get(userId);
}

export function endCombat(userId: string, victory: boolean) {
  const combat = activeCombats.get(userId);
  if (combat) {
    CombatDB.end(combat.sessionId);
    activeCombats.delete(userId);
  }
}

export function calculateDamage(
  player: PlayerData,
  spell: Spell | null,
  wandMultiplier: number,
  enemyDefense: number
): number {
  let baseDamage: number;

  if (spell) {
    baseDamage = spell.damage;
  } else {
    baseDamage = PlayerManager.getEffectiveDamage(player);
  }

  // Apply wand multiplier
  baseDamage = Math.floor(baseDamage * wandMultiplier);

  // Apply family bonuses
  const family = player.family ? (await_getFamily(player.family)) : null;
  if (family?.bonuses.damage) {
    baseDamage = Math.floor(baseDamage * (1 + family.bonuses.damage / 100));
  }

  // Apply intelligence
  const intBonus = 1 + (PlayerManager.getEffectiveIntelligence(player) / 200);
  baseDamage = Math.floor(baseDamage * intBonus);

  // Apply defense reduction
  const defenseReduction = Math.max(0.3, 1 - (enemyDefense / (enemyDefense + 50)));
  baseDamage = Math.floor(baseDamage * defenseReduction);

  // Apply variance
  const variance = 1 + (Math.random() * CONFIG.DAMAGE_VARIANCE * 2 - CONFIG.DAMAGE_VARIANCE);
  baseDamage = Math.floor(baseDamage * variance);

  return Math.max(1, baseDamage);
}

function await_getFamily(familyName: string) {
  const { getFamilyByName } = require('../config/families');
  return getFamilyByName(familyName);
}

export function enemyTurn(state: CombatState, player: PlayerData): { damage: number; special?: string } {
  let totalDamage = 0;
  let special: string | undefined;

  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;

    let damage = enemy.damage;
    // Apply variance
    damage = Math.floor(damage * (1 + (Math.random() * 0.3 - 0.15)));

    // Apply player defense
    const playerDefense = PlayerManager.getEffectiveDefense(player);
    const reduction = Math.max(0.2, 1 - (playerDefense / (playerDefense + 50)));
    damage = Math.floor(damage * reduction);

    // Check for debuffs on enemies
    if (state.debuffs['enemy_weaken']) {
      damage = Math.floor(damage * 0.7);
    }

    // Check for defense buff
    if (state.buffs['defense_up']) {
      damage = Math.floor(damage * 0.6);
    }

    totalDamage += Math.max(1, damage);

    // Special abilities
    if (enemy.specialAbility && Math.random() < 0.3) {
      special = enemy.specialAbility;
      switch (enemy.specialAbility) {
        case 'mana_drain':
          const drain = Math.floor(Math.random() * 10) + 5;
          state.playerMp = Math.max(0, state.playerMp - drain);
          special = `${enemy.name} drains ${drain} MP!`;
          break;
        case 'shadow_strike':
          totalDamage += Math.floor(damage * 0.5);
          special = `${enemy.name} uses Shadow Strike for extra damage!`;
          break;
      }
    }
  }

  return { damage: totalDamage, special };
}

export function createCombatEmbed(state: CombatState, player: PlayerData, message?: string): EmbedBuilder {
  const aliveEnemies = state.enemies.filter(e => e.hp > 0);
  const enemyList = aliveEnemies.map(e => `**${e.name}** - ❤️ ${e.hp}/${e.maxHp}`).join('\n');

  const embed = new EmbedBuilder()
    .setTitle(`⚔️ Dungeon Floor ${state.floor}`)
    .setDescription(`**Turn ${state.turn}**\n\n${message || 'Choose your action!'}`)
    .setColor(0xe74c3c)
    .addFields(
      {
        name: `👤 You (HP: ${state.playerHp}/${state.playerMaxHp} | MP: ${state.playerMp}/${state.playerMaxMp})`,
        value: `Wand: ${player.wand || 'None'}\nFamily: ${player.family || 'None'}`,
        inline: false,
      },
      {
        name: `👹 Enemies (${aliveEnemies.length})`,
        value: enemyList || 'All enemies defeated!',
        inline: false,
      },
    )
    .setTimestamp();

  return embed;
}

export function createCombatButtons(state: CombatState, player: PlayerData): ActionRowBuilder<ButtonBuilder>[] {
  const learnedSpells = SpellDB.getLearned(player.user_id);
  const hasSpells = learnedSpells.length > 0;

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('combat_attack').setLabel('⚔️ Attack').setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('combat_spell')
      .setLabel('✨ Spells')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(!hasSpells),
    new ButtonBuilder().setCustomId('combat_item').setLabel('🧪 Items').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('combat_defend').setLabel('🛡️ Defend').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('combat_flee').setLabel('🏃 Flee').setStyle(ButtonStyle.Secondary),
  );

  return [row1];
}

export async function processAttack(state: CombatState, player: PlayerData): Promise<{ damage: number; killed: string[] }> {
  const wand = player.wand ? (require('../config/wands').WANDS.find((w: any) => w.name === player.wand)) : null;
  const wandMultiplier = wand?.damageMultiplier || 1;

  // Target first alive enemy
  const target = state.enemies.find(e => e.hp > 0);
  if (!target) return { damage: 0, killed: [] };

  const damage = calculateDamage(player, null, wandMultiplier, target.defense);
  target.hp = Math.max(0, target.hp - damage);

  const killed: string[] = [];
  if (target.hp <= 0) {
    killed.push(target.name);
  }

  return { damage, killed };
}

export async function processSpellCast(
  state: CombatState,
  player: PlayerData,
  spellId: string
): Promise<{ success: boolean; message: string; damage?: number; healed?: number; killed?: string[] }> {
  const spell = getSpellById(spellId);
  if (!spell) return { success: false, message: 'Unknown spell.' };

  // Check MP
  if (state.playerMp < spell.mpCost) {
    return { success: false, message: `Not enough MP! Need ${spell.mpCost}, have ${state.playerMp}.` };
  }

  // Check cooldown
  if (state.cooldowns[spellId] && state.cooldowns[spellId] > 0) {
    return { success: false, message: `${spell.name} is on cooldown for ${state.cooldowns[spellId]} more turns.` };
  }

  // Consume MP
  state.playerMp -= spell.mpCost;

  // Set cooldown
  if (spell.cooldown > 0) {
    state.cooldowns[spellId] = spell.cooldown;
  }

  const wand = player.wand ? (require('../config/wands').WANDS.find((w: any) => w.name === player.wand)) : null;
  const wandMultiplier = wand?.damageMultiplier || 1;
  const efficiency = wand?.spellEfficiency || 0;

  // Apply spell efficiency (refund some MP)
  if (efficiency > 0) {
    const refund = Math.floor(spell.mpCost * efficiency);
    state.playerMp = Math.min(state.playerMaxMp, state.playerMp + refund);
  }

  if (spell.type === 'attack') {
    const target = state.enemies.find(e => e.hp > 0);
    if (!target) return { success: true, message: 'No enemies to target!' };

    const damage = calculateDamage(player, spell, wandMultiplier, target.defense);
    target.hp = Math.max(0, target.hp - damage);

    const killed: string[] = [];
    if (target.hp <= 0) killed.push(target.name);

    // Lifesteal effect
    if (spell.effect === 'lifesteal') {
      const heal = Math.floor(damage * 0.2);
      state.playerHp = Math.min(state.playerMaxHp, state.playerHp + heal);
    }

    return { success: true, message: `Cast ${spell.name} for ${damage} damage!`, damage, killed };
  }

  if (spell.type === 'heal') {
    const healAmount = spell.damage; // damage field stores heal amount for heal spells
    state.playerHp = Math.min(state.playerMaxHp, state.playerHp + healAmount);
    return { success: true, message: `Cast ${spell.name}, healed ${healAmount} HP!`, healed: healAmount };
  }

  if (spell.type === 'buff') {
    if (spell.effect) {
      state.buffs[spell.effect] = 3; // 3 turns
    }
    return { success: true, message: `Cast ${spell.name}! Buff active for 3 turns.` };
  }

  if (spell.type === 'debuff') {
    if (spell.effect) {
      state.debuffs[spell.effect] = 3;
    }
    return { success: true, message: `Cast ${spell.name}! Enemy debuffed for 3 turns.` };
  }

  return { success: false, message: 'Spell had no effect.' };
}

export function tickCooldowns(state: CombatState) {
  for (const key of Object.keys(state.cooldowns)) {
    if (state.cooldowns[key] > 0) {
      state.cooldowns[key]--;
    }
  }
  // Tick buffs/debuffs
  for (const key of Object.keys(state.buffs)) {
    if (state.buffs[key] > 0) {
      state.buffs[key]--;
      if (state.buffs[key] <= 0) delete state.buffs[key];
    }
  }
  for (const key of Object.keys(state.debuffs)) {
    if (state.debuffs[key] > 0) {
      state.debuffs[key]--;
      if (state.debuffs[key] <= 0) delete state.debuffs[key];
    }
  }
}

export function calculateRewards(state: CombatState): { xp: number; coins: number; loot: string[] } {
  let xp = 0;
  let coins = 0;
  const loot: string[] = [];

  for (const enemy of state.enemies) {
    const monster = MONSTERS.find(m => m.id === enemy.monsterId);
    if (monster) {
      xp += Math.floor(monster.xpReward * (1 + state.floor * 0.1));
      coins += Math.floor(monster.coinReward * (1 + state.floor * 0.08));

      // Loot drops
      for (const drop of monster.lootTable) {
        if (Math.random() < drop.chance) {
          loot.push(drop.itemId);
        }
      }
    }
  }

  return { xp, coins, loot };
}
