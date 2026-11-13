export type DistrictId =
  | 'old_quarter'
  | 'iron_district'
  | 'neon_row'
  | 'harborline'
  | 'ashmarket'
  | 'crown_heights';

export type ItemCategory =
  | 'electronics'
  | 'industrial_components'
  | 'luxury_goods'
  | 'collectibles'
  | 'raw_materials'
  | 'consumer_goods';

export type ItemQuality = 'poor' | 'used' | 'standard' | 'good' | 'premium';

export type MarketTrend =
  | 'rising'
  | 'falling'
  | 'stable'
  | 'volatile'
  | 'scarcity'
  | 'oversupply';

export type FactionId = 'syndicate' | 'brokers' | 'collective' | 'authority';

export type NPCRole =
  | 'supplier'
  | 'dealer'
  | 'broker'
  | 'rival'
  | 'collector'
  | 'informant'
  | 'faction_rep';

export type NPCPersonality =
  | 'aggressive'
  | 'cautious'
  | 'opportunistic'
  | 'loyal'
  | 'greedy'
  | 'generous'
  | 'competitive';

export type BusinessTier =
  | 'street_trader'
  | 'independent_merchant'
  | 'established_dealer'
  | 'market_operator'
  | 'trade_magnate'
  | 'market_power';

export interface GameTime {
  day: number;
  hour: number;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  cycle: number;
  tick: number;
  isPaused: boolean;
  speed: 1 | 2 | 5;
}

export interface District {
  id: DistrictId;
  name: string;
  tagline: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  transportCost: number;
  supplyModifier: number;
  demandModifier: number;
  unlocked: boolean;
  description: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  basePrice: number;
  currentPrice: number;
  weight: number;
  volume: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'exotic';
  quality: ItemQuality;
  legal: boolean;
  supply: number;
  demand: number;
  trend: MarketTrend;
  priceHistory: number[];
}

export interface InventorySlot {
  itemId: string;
  quantity: number;
  averageBuyPrice: number;
  quality: ItemQuality;
}

export interface NPC {
  id: string;
  name: string;
  districtId: DistrictId;
  role: NPCRole;
  personality: NPCPersonality;
  wealth: number;
  trust: number;
  reputation: number;
  inventory: Array<{ itemId: string; quantity: number; price: number }>;
}

export interface Faction {
  id: FactionId;
  name: string;
  description: string;
  reputation: number;
  influence: number;
}

export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: 'buy' | 'sell';
  counterpartyId: string;
  counterpartyName: string;
  districtId: DistrictId;
  tick: number;
  day: number;
  hour: number;
  profit?: number;
}

export type PropertyType = 'warehouse' | 'retail_stall' | 'processing_lab' | 'brokerage_desk';

export interface Property {
  id: string;
  name: string;
  districtId: DistrictId;
  type: PropertyType;
  cost: number;
  incomePerHour: number;
  capacityBonus: number;
  purchased: boolean;
  description: string;
}

export interface PlayerState {
  name: string;
  balance: number;
  debt: number;
  reputation: number;
  tier: BusinessTier;
  storageCapacity: number;
  currentWeight: number;
  currentDistrict: DistrictId;
  inventory: InventorySlot[];
  properties: Property[];
  unlockedSkills: string[];
  skillPoints: number;
}

export type EventCategory = 'crisis' | 'boom' | 'regulation' | 'trend' | 'tech';

export interface EconomicEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  severity: 'minor' | 'moderate' | 'major';
  durationDays: number;
  remainingDays: number;
  affectedDistricts: DistrictId[] | 'all';
  affectedCategories: ItemCategory[] | 'all';
  priceMultiplier: number;
  supplyMultiplier: number;
  demandMultiplier: number;
}

export type ContractType = 'delivery' | 'procurement' | 'smuggling' | 'bounty';
export type ContractStatus = 'available' | 'active' | 'completed' | 'failed';

export interface Contract {
  id: string;
  title: string;
  description: string;
  type: ContractType;
  status: ContractStatus;
  issuer: string;
  issuerFaction?: FactionId;
  districtId: DistrictId;
  targetDistrictId?: DistrictId;
  targetItemId: string;
  targetQuantity: number;
  rewardCash: number;
  rewardRep: number;
  penaltyRep: number;
  deadlineDay: number;
  deadlineHour: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  isContraband?: boolean;
}

export interface NarrativeChoice {
  text: string;
  effect: {
    cashDelta?: number;
    repDelta?: number;
    factionId?: FactionId;
    factionRepDelta?: number;
    confiscateContraband?: boolean;
  };
  outcomeDescription: string;
}

export interface NarrativeEvent {
  id: string;
  title: string;
  description: string;
  districtId?: DistrictId;
  choices: NarrativeChoice[];
}

export interface GameState {
  seed: string;
  time: GameTime;
  player: PlayerState;
  districts: Record<DistrictId, District>;
  items: Record<string, Item>;
  npcs: Record<string, NPC>;
  factions: Record<FactionId, Faction>;
  transactions: Transaction[];
  activeEvents: EconomicEvent[];
  contracts: Record<string, Contract>;
  activeNarrativeEvent?: NarrativeEvent | null;
}

export type NavView =
  | 'dashboard'
  | 'market'
  | 'trading'
  | 'inventory'
  | 'suppliers'
  | 'customers'
  | 'network'
  | 'districts'
  | 'business'
  | 'contracts'
  | 'factions'
  | 'statistics';
