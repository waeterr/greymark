import { GameState, BusinessTier, Property, DistrictId } from '../../types/game.types';

/**
 * Player Progression Engine: Manages tier advancement, XP tracking, skill unlocks, and business assets
 */

export const TIER_REQUIREMENTS: Record<BusinessTier, { minRep: number; minNetWorth: number }> = {
  street_trader: { minRep: 0, minNetWorth: 0 },
  independent_merchant: { minRep: 25, minNetWorth: 5000 },
  established_dealer: { minRep: 75, minNetWorth: 20000 },
  market_operator: { minRep: 150, minNetWorth: 75000 },
  trade_magnate: { minRep: 300, minNetWorth: 250000 },
  market_power: { minRep: 600, minNetWorth: 1000000 },
};

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop_old_quarter_stall',
    name: 'Old Quarter Market Stall',
    districtId: 'old_quarter',
    type: 'retail_stall',
    cost: 1200,
    incomePerHour: 15,
    capacityBonus: 15,
    purchased: false,
    description: 'A modest street stall in the Bazaar generating steady pedestrian retail trade.',
  },
  {
    id: 'prop_iron_scrap_depot',
    name: 'Iron Foundry Yard',
    districtId: 'iron_district',
    type: 'warehouse',
    cost: 3200,
    incomePerHour: 35,
    capacityBonus: 50,
    purchased: false,
    description: 'Heavy industrial depot space equipped for bulky scrap metals and parts.',
  },
  {
    id: 'prop_harborline_wharf',
    name: 'Harbor Bonded Wharf',
    districtId: 'harborline',
    type: 'warehouse',
    cost: 6500,
    incomePerHour: 75,
    capacityBonus: 100,
    purchased: false,
    description: 'High-throughput maritime storage bay with direct dockside crane access.',
  },
  {
    id: 'prop_neon_kiosk',
    name: 'Neon Row Holo-Kiosk',
    districtId: 'neon_row',
    type: 'retail_stall',
    cost: 12000,
    incomePerHour: 140,
    capacityBonus: 20,
    purchased: false,
    description: 'High-foot-traffic holographic showcase catering to luxury cybernetic clientele.',
  },
  {
    id: 'prop_ashmarket_lab',
    name: 'Ashmarket Extraction Lab',
    districtId: 'ashmarket',
    type: 'processing_lab',
    cost: 22000,
    incomePerHour: 260,
    capacityBonus: 35,
    purchased: false,
    description: 'Subterranean refinery pod processing raw reagents into high-potency goods.',
  },
  {
    id: 'prop_crown_desk',
    name: 'Crown Heights Trading Desk',
    districtId: 'crown_heights',
    type: 'brokerage_desk',
    cost: 45000,
    incomePerHour: 550,
    capacityBonus: 60,
    purchased: false,
    description: 'Exclusive corporate suite executing high-margin algorithmic commodity arbitrage.',
  },
];

export const DISTRICT_TIER_REQUIREMENTS: Record<DistrictId, BusinessTier> = {
  old_quarter: 'street_trader',
  iron_district: 'street_trader',
  harborline: 'street_trader',
  neon_row: 'independent_merchant',
  ashmarket: 'established_dealer',
  crown_heights: 'market_operator',
};

const TIER_ORDER: BusinessTier[] = [
  'street_trader',
  'independent_merchant',
  'established_dealer',
  'market_operator',
  'trade_magnate',
  'market_power',
];

export function isDistrictUnlockedForTier(districtId: DistrictId, tier: BusinessTier): boolean {
  const reqTier = DISTRICT_TIER_REQUIREMENTS[districtId];
  if (!reqTier) return true;
  return TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf(reqTier);
}

export function calculatePlayerNetWorth(state: GameState): number {
  const inventoryValue = state.player.inventory.reduce((sum, slot) => {
    const item = state.items[slot.itemId];
    return sum + (item ? item.currentPrice * slot.quantity : 0);
  }, 0);

  const propertyValue = (state.player.properties || [])
    .filter((p) => p.purchased)
    .reduce((sum, p) => sum + p.cost, 0);

  return state.player.balance + inventoryValue + propertyValue - state.player.debt;
}

export function calculatePassiveIncome(properties: Property[], hours: number): number {
  return (properties || [])
    .filter((p) => p.purchased)
    .reduce((sum, p) => sum + p.incomePerHour * hours, 0);
}

export function checkTierEligibility(
  currentTier: BusinessTier,
  reputation: number,
  netWorth: number
): BusinessTier | null {
  const currentIdx = TIER_ORDER.indexOf(currentTier);
  const nextTier = TIER_ORDER[currentIdx + 1];
  if (!nextTier) return null;

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

  // Unlock newly accessible districts
  const updatedDistricts = { ...state.districts };
  for (const [id, district] of Object.entries(updatedDistricts)) {
    if (isDistrictUnlockedForTier(id as DistrictId, eligible)) {
      updatedDistricts[id as DistrictId] = {
        ...district,
        unlocked: true,
      };
    }
  }

  return {
    ...state,
    player: {
      ...state.player,
      tier: eligible,
    },
    districts: updatedDistricts,
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
    negotiationBonus?: number;
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
    cost: 5,
    description: 'Improve NPC acceptance threshold in negotiations by 10%.',
    effect: { negotiationBonus: 0.1 },
  },
  {
    id: 'market_insight',
    name: 'Price Trend Analysis',
    category: 'trading',
    tier: 1,
    cost: 8,
    description: 'View detailed supply/demand metrics and arbitrage opportunities.',
    effect: { priceInsightBonus: 1 },
  },
  {
    id: 'bulk_trader',
    name: 'Bulk Transaction Specialist',
    category: 'trading',
    tier: 2,
    cost: 15,
    description: 'Negotiate better margins on large-volume orders (5+ units).',
    effect: { negotiationBonus: 0.15 },
  },

  // Logistics Skills
  {
    id: 'storage_expansion',
    name: 'Warehouse Optimization',
    category: 'logistics',
    tier: 1,
    cost: 5,
    description: 'Increase storage capacity by 25 kg.',
    effect: { capacityBonus: 25 },
  },
  {
    id: 'efficient_hauling',
    name: 'Route Planning Mastery',
    category: 'logistics',
    tier: 1,
    cost: 8,
    description: 'Reduce inter-district transport costs by 20%.',
    effect: { transportCostReduction: 0.2 },
  },
  {
    id: 'logistics_network',
    name: 'Automated Distribution',
    category: 'logistics',
    tier: 2,
    cost: 15,
    description: 'Reduce transport costs by 40% and expand storage capacity by another 50 kg.',
    effect: { transportCostReduction: 0.4, capacityBonus: 50 },
  },

  // Influence Skills
  {
    id: 'local_connections',
    name: 'Community Relations',
    category: 'influence',
    tier: 1,
    cost: 5,
    description: 'Gain 20% more reputation from trades.',
    effect: { reputationMultiplier: 1.2 },
  },
  {
    id: 'faction_insider',
    name: 'Syndicate Liaison',
    category: 'influence',
    tier: 2,
    cost: 12,
    description: 'Gain 50% more reputation from trades and unlock faction missions.',
    effect: { reputationMultiplier: 1.5 },
  },
];

export function getActivePerks(unlockedSkillIds: string[] = []) {
  let negotiationBonus = 0;
  let capacityBonus = 0;
  let transportCostReduction = 0;
  let reputationMultiplier = 1;

  for (const id of unlockedSkillIds) {
    const skill = SKILL_TREE.find((s) => s.id === id);
    if (!skill) continue;
    if (skill.effect.negotiationBonus) negotiationBonus += skill.effect.negotiationBonus;
    if (skill.effect.capacityBonus) capacityBonus += skill.effect.capacityBonus;
    if (skill.effect.transportCostReduction) {
      transportCostReduction = Math.max(transportCostReduction, skill.effect.transportCostReduction);
    }
    if (skill.effect.reputationMultiplier) {
      reputationMultiplier = Math.max(reputationMultiplier, skill.effect.reputationMultiplier);
    }
  }

  return {
    negotiationBonus,
    capacityBonus,
    transportCostReduction,
    reputationMultiplier,
  };
}
