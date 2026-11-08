import {
  District,
  EconomicEvent,
  GameState,
  Item,
  MarketTrend,
} from '../../types/game.types';
import { executeNPCAutonomousTrading } from '../npc/NPCDecisionEngine';
import {
  simulateFactionConflict,
  applyFactionDistrictModifiers,
} from '../factions/FactionEngine';

export const EVENT_POOL: Omit<EconomicEvent, 'id' | 'remainingDays'>[] = [
  {
    title: 'Foundry Smelter Breakdown',
    description: 'Critical machinery failure in Iron District halts alloy casting.',
    category: 'crisis',
    severity: 'major',
    durationDays: 4,
    affectedDistricts: ['iron_district'],
    affectedCategories: ['industrial_components', 'raw_materials'],
    priceMultiplier: 1.35,
    supplyMultiplier: 0.6,
    demandMultiplier: 1.25,
  },
  {
    title: 'Harbor Dockworkers Strike',
    description: 'Offloading terminals shut down due to disputed customs tariffs.',
    category: 'crisis',
    severity: 'moderate',
    durationDays: 3,
    affectedDistricts: ['harborline'],
    affectedCategories: ['consumer_goods', 'raw_materials'],
    priceMultiplier: 1.25,
    supplyMultiplier: 0.7,
    demandMultiplier: 1.15,
  },
  {
    title: 'Neon Row Tech Boom',
    description: 'High-end consumer euphoria causes surge in micro-chip demand.',
    category: 'boom',
    severity: 'moderate',
    durationDays: 5,
    affectedDistricts: ['neon_row', 'crown_heights'],
    affectedCategories: ['electronics', 'luxury_goods'],
    priceMultiplier: 1.3,
    supplyMultiplier: 0.9,
    demandMultiplier: 1.45,
  },
  {
    title: 'Municipal Contraband Sweep',
    description: 'Authority patrols intensify checkpoint searches in Ashmarket.',
    category: 'regulation',
    severity: 'major',
    durationDays: 3,
    affectedDistricts: ['ashmarket'],
    affectedCategories: ['luxury_goods', 'collectibles'],
    priceMultiplier: 1.5,
    supplyMultiplier: 0.5,
    demandMultiplier: 1.1,
  },
  {
    title: 'Bumper Crop of Synthetic Grain',
    description: 'Hydroponic biovats yield unexpected surplus across Old Quarter.',
    category: 'boom',
    severity: 'minor',
    durationDays: 4,
    affectedDistricts: ['old_quarter'],
    affectedCategories: ['consumer_goods'],
    priceMultiplier: 0.8,
    supplyMultiplier: 1.5,
    demandMultiplier: 0.9,
  },
];

export function calculateDynamicPrice(
  item: Item,
  district?: District,
  activeEvents: EconomicEvent[] = []
): number {
  // 1. Supply / Demand damping curve
  const ratio = item.demand / Math.max(1, item.supply);
  const dampedCurve = Math.pow(ratio, 0.45);

  // 2. District modifier
  let districtMod = 1.0;
  if (district) {
    districtMod = district.demandModifier / Math.max(0.1, district.supplyModifier);
  }

  // 3. Trend modifier
  let trendMod = 1.0;
  switch (item.trend) {
    case 'scarcity':
      trendMod = 1.28;
      break;
    case 'rising':
      trendMod = 1.12;
      break;
    case 'falling':
      trendMod = 0.88;
      break;
    case 'oversupply':
      trendMod = 0.72;
      break;
    case 'volatile': {
      const step = item.priceHistory.length % 6;
      trendMod = 1.0 + Math.sin(step) * 0.18;
      break;
    }
    case 'stable':
    default:
      trendMod = 1.0;
      break;
  }

  // 4. Active economic events modifier
  let eventMod = 1.0;
  for (const evt of activeEvents) {
    const districtMatches =
      evt.affectedDistricts === 'all' ||
      (district && evt.affectedDistricts.includes(district.id));
    const categoryMatches =
      evt.affectedCategories === 'all' ||
      evt.affectedCategories.includes(item.category);

    if (districtMatches && categoryMatches) {
      eventMod *= evt.priceMultiplier;
    }
  }

  // 5. Total compound price
  const rawPrice = item.basePrice * dampedCurve * districtMod * trendMod * eventMod;

  // 6. Hard safety clamping: 25% base to 400% base
  const minPrice = Math.max(1, Math.round(item.basePrice * 0.25));
  const maxPrice = Math.round(item.basePrice * 4.0);
  const clamped = Math.min(maxPrice, Math.max(minPrice, rawPrice));

  return Math.round(clamped * 100) / 100;
}

export function determineTrend(history: number[]): MarketTrend {
  if (history.length < 3) return 'stable';
  const len = history.length;
  const p0 = history[len - 3]!;
  const p1 = history[len - 2]!;
  const p2 = history[len - 1]!;

  if (p2 > p1 && p1 > p0) return 'rising';
  if (p2 < p1 && p1 < p0) return 'falling';
  if (Math.abs(p2 - p0) / p0 > 0.3) return 'volatile';
  return 'stable';
}

export function simulateMarketTick(
  state: GameState,
  hoursElapsed: number = 1
): GameState {
  const currentHour = state.time.hour + hoursElapsed;
  const daysPassed = Math.floor(currentHour / 24);
  const newHour = currentHour % 24;
  const newDay = state.time.day + daysPassed;
  const newTick = state.time.tick + hoursElapsed;

  // Process and decay active economic events
  let updatedEvents: EconomicEvent[] = [];
  if (daysPassed > 0) {
    updatedEvents = state.activeEvents
      .map((evt) => ({
        ...evt,
        remainingDays: evt.remainingDays - daysPassed,
      }))
      .filter((evt) => evt.remainingDays > 0);
  } else {
    updatedEvents = [...state.activeEvents];
  }

  // Spawn new event occasionally if less than 2 active
  if (updatedEvents.length < 2 && Math.random() < 0.25 * hoursElapsed) {
    const candidate = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)]!;
    const newEvent: EconomicEvent = {
      ...candidate,
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      remainingDays: candidate.durationDays,
    };
    updatedEvents.push(newEvent);
  }

  // Simulate item supply, demand, and prices
  const updatedItems: Record<string, Item> = {};
  const currentDistrict = state.districts[state.player.currentDistrict];

  for (const [id, item] of Object.entries(state.items)) {
    // Organic supply / demand micro-fluctuation (-5% to +5%)
    const supplyDelta = Math.round((Math.random() - 0.48) * 4);
    const demandDelta = Math.round((Math.random() - 0.48) * 4);

    const newSupply = Math.max(5, item.supply + supplyDelta);
    const newDemand = Math.max(5, item.demand + demandDelta);

    const tempItem: Item = {
      ...item,
      supply: newSupply,
      demand: newDemand,
    };

    const newPrice = calculateDynamicPrice(tempItem, currentDistrict, updatedEvents);
    const history = [...item.priceHistory, newPrice].slice(-15);
    const newTrend = determineTrend(history);

    updatedItems[id] = {
      ...tempItem,
      currentPrice: newPrice,
      trend: newTrend,
      priceHistory: history,
    };
  }

  // Restock NPC inventories gradually
  const updatedNpcs = { ...state.npcs };
  for (const [npcId, npc] of Object.entries(updatedNpcs)) {
    if (npc.role === 'supplier') {
      const restockedInv = npc.inventory.map((slot) => {
        const item = updatedItems[slot.itemId];
        const targetPrice = item ? Math.round(item.currentPrice * 0.95) : slot.price;
        return {
          ...slot,
          quantity: slot.quantity < 20 ? slot.quantity + 1 : slot.quantity,
          price: targetPrice,
        };
      });
      updatedNpcs[npcId] = { ...npc, inventory: restockedInv };
    }
  }

  const intermediateState: GameState = {
    ...state,
    time: {
      ...state.time,
      hour: newHour,
      day: newDay,
      tick: newTick,
    },
    items: updatedItems,
    npcs: updatedNpcs,
    activeEvents: updatedEvents,
  };

  // Run autonomous NPC trading intelligence
  const afterNpcTrading = executeNPCAutonomousTrading(intermediateState);

  // Run faction conflicts and district modifier updates
  const afterFactionConflicts = simulateFactionConflict(afterNpcTrading);
  return applyFactionDistrictModifiers(afterFactionConflicts);
}
