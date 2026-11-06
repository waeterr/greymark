import { NPC } from '../types/game.types';

export const EXTENDED_NPCS: Record<string, NPC> = {
  // Old Quarter
  npc_karl: {
    id: 'npc_karl',
    name: 'Karl Vance',
    districtId: 'old_quarter',
    role: 'supplier',
    personality: 'cautious',
    wealth: 4200,
    trust: 20,
    reputation: 35,
    inventory: [
      { itemId: 'synthetic_grain', quantity: 25, price: 23 },
      { itemId: 'filter_cartridge', quantity: 15, price: 56 },
      { itemId: 'medical_inhaler', quantity: 10, price: 80 },
    ],
  },
  npc_lyra: {
    id: 'npc_lyra',
    name: 'Lyra Thorne',
    districtId: 'old_quarter',
    role: 'dealer',
    personality: 'opportunistic',
    wealth: 5600,
    trust: 15,
    reputation: 40,
    inventory: [
      { itemId: 'basic_toolkit', quantity: 12, price: 60 },
      { itemId: 'energy_cell', quantity: 30, price: 42 },
    ],
  },

  // Iron District
  npc_merek: {
    id: 'npc_merek',
    name: 'Merek Sterling',
    districtId: 'iron_district',
    role: 'supplier',
    personality: 'aggressive',
    wealth: 12400,
    trust: 10,
    reputation: 60,
    inventory: [
      { itemId: 'scrap_copper', quantity: 80, price: 38 },
      { itemId: 'steel_ingot', quantity: 45, price: 89 },
      { itemId: 'servo_motor', quantity: 20, price: 168 },
    ],
  },
  npc_greaves: {
    id: 'npc_greaves',
    name: 'Chief Foreman Greaves',
    districtId: 'iron_district',
    role: 'dealer',
    personality: 'cautious',
    wealth: 9800,
    trust: 12,
    reputation: 50,
    inventory: [
      { itemId: 'hydraulic_piston', quantity: 15, price: 200 },
      { itemId: 'cooling_radiator', quantity: 22, price: 132 },
    ],
  },

  // Neon Row
  npc_valeria: {
    id: 'npc_valeria',
    name: 'Valeria Cruz',
    districtId: 'neon_row',
    role: 'dealer',
    personality: 'greedy',
    wealth: 18500,
    trust: 8,
    reputation: 65,
    inventory: [
      { itemId: 'display_panel', quantity: 14, price: 310 },
      { itemId: 'designer_fabric', quantity: 8, price: 545 },
    ],
  },
  npc_soren: {
    id: 'npc_soren',
    name: 'Soren Ward',
    districtId: 'neon_row',
    role: 'broker',
    personality: 'opportunistic',
    wealth: 14000,
    trust: 18,
    reputation: 55,
    inventory: [
      { itemId: 'logic_board', quantity: 16, price: 370 },
      { itemId: 'memory_chip', quantity: 25, price: 210 },
    ],
  },

  // Harborline
  npc_vance_dock: {
    id: 'npc_vance_dock',
    name: 'Dockmaster Ren',
    districtId: 'harborline',
    role: 'supplier',
    personality: 'aggressive',
    wealth: 22000,
    trust: 5,
    reputation: 70,
    inventory: [
      { itemId: 'recycled_glass', quantity: 120, price: 16 },
      { itemId: 'polymer_resin', quantity: 60, price: 52 },
      { itemId: 'bearing_assembly', quantity: 35, price: 95 },
    ],
  },

  // Ashmarket
  npc_sal: {
    id: 'npc_sal',
    name: 'Sal the Rat',
    districtId: 'ashmarket',
    role: 'broker',
    personality: 'opportunistic',
    wealth: 7500,
    trust: 15,
    reputation: 30,
    inventory: [
      { itemId: 'refined_narcotic', quantity: 6, price: 630 },
      { itemId: 'signal_jammer', quantity: 4, price: 790 },
      { itemId: 'rare_earth_powder', quantity: 12, price: 330 },
    ],
  },
  npc_whisper: {
    id: 'npc_whisper',
    name: 'Whisper',
    districtId: 'ashmarket',
    role: 'informant',
    personality: 'cautious',
    wealth: 3800,
    trust: 25,
    reputation: 45,
    inventory: [
      { itemId: 'encrypted_datacore', quantity: 2, price: 1280 },
    ],
  },

  // Crown Heights
  npc_tiberius: {
    id: 'npc_tiberius',
    name: 'Archon Tiberius',
    districtId: 'crown_heights',
    role: 'collector',
    personality: 'greedy',
    wealth: 85000,
    trust: 5,
    reputation: 90,
    inventory: [
      { itemId: 'antique_chronometer', quantity: 3, price: 920 },
      { itemId: 'aged_whiskey', quantity: 5, price: 1050 },
      { itemId: 'titanium_frame', quantity: 6, price: 520 },
    ],
  },
  npc_clara: {
    id: 'npc_clara',
    name: 'Lady Clara',
    districtId: 'crown_heights',
    role: 'collector',
    personality: 'generous',
    wealth: 62000,
    trust: 20,
    reputation: 85,
    inventory: [
      { itemId: 'vintage_vinyl', quantity: 4, price: 460 },
    ],
  },
};
