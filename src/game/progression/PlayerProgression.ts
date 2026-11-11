import { GameState, BusinessTier } from '../../types/game.types';

/**
 * Player Progression Engine: Manages tier advancement, XP tracking, skill unlocks
 */

export const TIER_REQUIREMENTS: Record<BusinessTier, { minRep: number; minNetWorth: number }> = {
  street_trader: { minRep: 0, minNetWorth: 0 },
  independent_merchant: { minRep: 25, minNetWorth: 5000 },
  established_dealer: { minRep: 75, minNetWorth: 20000 },
  market_operator: { minRep: 150, minNetWorth: 75000 },
  trade_magnate: { minRep: 300, minNetWorth: 250000 },
  market_power: { minRep: 600, minNetWorth: 1000000 },
};

export function calculatePlayerNetWorth(state: GameState): number {
  const inventoryValue = state.player.inventory.reduce((sum, slot) => {
    const item = state.items[slot.itemId];
    return sum + (item ? item.currentPrice * slot.quantity : 0);
  }, 0);

  return state.player.balance + inventoryValue - state.player.debt;
}

export function checkTierEligibility(
  currentTier: BusinessTier,
  reputation: number,
  netWorth: number
): BusinessTier | null {
  const tiers: BusinessTier[] = [
    'street_trader',
    'independent_merchant',
    'established_dealer',
    'market_operator',
    'trade_magnate',
    'market_power',
  ];

  const currentIdx = tiers.indexOf(currentTier);
  const nextTier = tiers[currentIdx + 1];
  if (!nextTier) return null; // Already max tier

  const req = TIER_REQUIREMENTS[nextTier];
  if (reputation >= req.minRep && netWorth >= req.minNetWorth) {
    return nextTier;
  }

  return null;
}

export function applyTierPromotion(state: GameState): GameState {
  const netWorth = calculatePlayerNetWorth(state);
  const eligible = checkTierEligibility(
    state.player.tier,
    state.player.reputation,
    netWorth
  );

  if (!eligible) return state;

  return {
    ...state,
    player: {
      ...state.player,
      tier: eligible,
    },
  };
}

/**
 * Skill Tree System: Unlock perks and bonuses
 */
export type SkillCategory = 'trading' | 'logistics' | 'influence';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  tier: number;
  cost: number;
  description: string;
  effect: {
    negotiationBonus?: number; // Multiplier or flat bonus
    capacityBonus?: number;
    transportCostReduction?: number;
    priceInsightBonus?: number;
    reputationMultiplier?: number;
  };
}

export const SKILL_TREE: Skill[] = [
  // Trading Skills
  {
    id: 'negotiation_basics',
    name: 'Persuasive Rhetoric',
    category: 'trading',
    tier: 1,
    cost: 10,
    description: 'Improve NPC acceptance threshold in negotiations by 10%.',
    effect: { negotiationBonus: 0.1 },
  },
  {
    id: 'market_insight',
    name: 'Price Trend Analysis',
    category: 'trading',
    tier: 1,
    cost: 15,
    description: 'View detailed supply/demand metrics and arbitrage opportunities.',
    effect: { priceInsightBonus: 1 },
  },
  {
    id: 'bulk_trader',
    name: 'Bulk Transaction Specialist',
    category: 'trading',
    tier: 2,
    cost: 25,
    description: 'Negotiate better margins on large-volume orders (5+ units).',
    effect: { negotiationBonus: 0.15 },
  },

  // Logistics Skills
  {
    id: 'storage_expansion',
    name: 'Warehouse Optimization',
    category: 'logistics',
    tier: 1,
    cost: 12,
    description: 'Increase storage capacity by 25 kg.',
    effect: { capacityBonus: 25 },
  },
  {
    id: 'efficient_hauling',
    name: 'Route Planning Mastery',
    category: 'logistics',
    tier: 1,
    cost: 18,
    description: 'Reduce inter-district transport costs by 20%.',
    effect: { transportCostReduction: 0.2 },
  },
  {
    id: 'logistics_network',
    name: 'Automated Distribution',
    category: 'logistics',
    tier: 2,
    cost: 30,
    description: 'Reduce transport costs by 40% and unlock passive restocking.',
    effect: { transportCostReduction: 0.4 },
  },

  // Influence Skills
  {
    id: 'local_connections',
    name: 'Community Relations',
    category: 'influence',
    tier: 1,
    cost: 10,
    description: 'Gain 20% more reputation from trades.',
    effect: { reputationMultiplier: 1.2 },
  },
  {
    id: 'faction_insider',
    name: 'Syndicate Liaison',
    category: 'influence',
    tier: 2,
    cost: 25,
    description: 'Gain 50% more reputation from trades and unlock faction missions.',
    effect: { reputationMultiplier: 1.5 },
  },
];

export interface PlayerSkills {
  unlockedSkills: string[];
  skillPoints: number;
}

export function unlockSkill(
  state: GameState,
  skillId: string,
  playerSkills: PlayerSkills
): { success: boolean; reason?: string; updatedSkills?: PlayerSkills } {
  const skill = SKILL_TREE.find((s) => s.id === skillId);
  if (!skill) return { success: false, reason: 'Skill not found' };

  if (playerSkills.unlockedSkills.includes(skillId)) {
    return { success: false, reason: 'Skill already unlocked' };
  }

  if (playerSkills.skillPoints < skill.cost) {
    return { success: false, reason: 'Not enough skill points' };
  }

  const updatedSkills: PlayerSkills = {
    unlockedSkills: [...playerSkills.unlockedSkills, skillId],
    skillPoints: playerSkills.skillPoints - skill.cost,
  };

  return { success: true, updatedSkills };
}

export function awardSkillPoints(reputation: number): number {
  // Award 1 skill point per 50 reputation
  return Math.floor(reputation / 50);
}
