import { GameState, FactionId, DistrictId } from '../../types/game.types';

/**
 * Faction Engine: Manages reputation gain/loss, influence shifts,
 * faction conflicts, and unlockable privileges
 */

export interface FactionAction {
  type: 'trade' | 'contract' | 'rival' | 'betrayal';
  factionId: FactionId;
  repChange: number;
  reason: string;
}

export function applyFactionReputationChange(
  state: GameState,
  factionId: FactionId,
  repChange: number
): GameState {
  const updatedFactions = { ...state.factions };
  const faction = updatedFactions[factionId];
  if (!faction) return state;

  updatedFactions[factionId] = {
    ...faction,
    reputation: Math.max(-100, Math.min(100, faction.reputation + repChange)),
  };

  return {
    ...state,
    factions: updatedFactions,
  };
}

export function checkFactionPrivileges(
  _factionId: FactionId,
  reputation: number
): {
  canAccessExclusiveContracts: boolean;
  canAccessExclusiveSuppliers: boolean;
  priceDiscountModifier: number;
  transportCostReduction: number;
} {
  // Reputation tiers unlock privileges
  const canAccessExclusiveContracts = reputation >= 40;
  const canAccessExclusiveSuppliers = reputation >= 60;
  const priceDiscountModifier = reputation >= 50 ? 0.95 : 1.0; // 5% discount at 50+ rep
  const transportCostReduction = reputation >= 70 ? 0.8 : 1.0; // 20% reduction at 70+ rep

  return {
    canAccessExclusiveContracts,
    canAccessExclusiveSuppliers,
    priceDiscountModifier,
    transportCostReduction,
  };
}

export function simulateFactionConflict(state: GameState): GameState {
  // Random faction conflict: one faction gains influence, another loses
  const factionIds = Object.keys(state.factions) as FactionId[];
  if (factionIds.length < 2) return state;

  // 15% chance per simulation tick of conflict event
  if (Math.random() > 0.15) return state;

  const shuffled = [...factionIds].sort(() => Math.random() - 0.5);
  const winner = shuffled[0]!;
  const loser = shuffled[1]!;

  const influenceShift = Math.floor(Math.random() * 5) + 3; // 3-7 influence

  const updatedFactions = { ...state.factions };
  updatedFactions[winner] = {
    ...updatedFactions[winner]!,
    influence: Math.min(100, updatedFactions[winner]!.influence + influenceShift),
  };
  updatedFactions[loser] = {
    ...updatedFactions[loser]!,
    influence: Math.max(0, updatedFactions[loser]!.influence - influenceShift),
  };

  return {
    ...state,
    factions: updatedFactions,
  };
}

/**
 * Faction-driven district modifiers:
 * Dominant factions can alter supply/demand multipliers in their controlled districts
 */
export function applyFactionDistrictModifiers(state: GameState): GameState {
  const updatedDistricts = { ...state.districts };

  // Syndicate dominates Harborline (high influence = better import supply)
  const syndicate = state.factions['syndicate'];
  if (syndicate && syndicate.influence > 50) {
    const harborline = updatedDistricts['harborline'];
    if (harborline) {
      updatedDistricts['harborline'] = {
        ...harborline,
        supplyModifier: Math.min(1.6, harborline.supplyModifier * 1.05),
      };
    }
  }

  // Collective stabilizes Old Quarter (high rep = stable local prices)
  const collective = state.factions['collective'];
  if (collective && collective.influence > 40) {
    const oldQuarter = updatedDistricts['old_quarter'];
    if (oldQuarter) {
      updatedDistricts['old_quarter'] = {
        ...oldQuarter,
        supplyModifier: 1.0,
        demandModifier: 1.0,
      };
    }
  }

  // Authority controls Crown Heights (high influence = stricter access)
  const authority = state.factions['authority'];
  if (authority && authority.influence > 60) {
    const crown = updatedDistricts['crown_heights'];
    if (crown) {
      updatedDistricts['crown_heights'] = {
        ...crown,
        unlocked: state.player.reputation >= 50, // Lock requires high rep
      };
    }
  }

  return {
    ...state,
    districts: updatedDistricts,
  };
}

/**
 * Award faction reputation based on player trading activity
 */
export function awardTradingReputation(
  state: GameState,
  districtId: DistrictId,
  tradeValue: number
): GameState {
  let targetFaction: FactionId | null = null;

  // District-faction affinity mapping
  if (districtId === 'harborline') targetFaction = 'syndicate';
  if (districtId === 'old_quarter') targetFaction = 'collective';
  if (districtId === 'crown_heights') targetFaction = 'authority';
  if (districtId === 'ashmarket') targetFaction = 'brokers';

  if (!targetFaction) return state;

  // Small rep gain proportional to trade value
  const repGain = Math.max(1, Math.floor(tradeValue / 500));

  return applyFactionReputationChange(state, targetFaction, repGain);
}
