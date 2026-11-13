import {
  Contract,
  GameState,
  NarrativeEvent,
  NarrativeChoice,
} from '../../types/game.types';

export const INITIAL_CONTRACTS: Record<string, Contract> = {
  ct_iron_rations: {
    id: 'ct_iron_rations',
    title: 'Foundry Provision Supply',
    description: 'Deliver 10x Synthetic Grain Rations to feed night-shift smelter crews.',
    type: 'delivery',
    status: 'available',
    issuer: 'Iron Smelter Guild',
    issuerFaction: 'collective',
    districtId: 'iron_district',
    targetDistrictId: 'iron_district',
    targetItemId: 'synthetic_grain',
    targetQuantity: 10,
    rewardCash: 450,
    rewardRep: 8,
    penaltyRep: 5,
    deadlineDay: 4,
    deadlineHour: 18,
    riskLevel: 'low',
    isContraband: false,
  },
  ct_filtration_urgent: {
    id: 'ct_filtration_urgent',
    title: 'Emergency Water Filter Replacements',
    description: 'Supply 6x Aqueous Filter Cartridges to resolve pipeline sediment alarm.',
    type: 'procurement',
    status: 'available',
    issuer: 'Municipal Utility Directorate',
    issuerFaction: 'authority',
    districtId: 'old_quarter',
    targetDistrictId: 'old_quarter',
    targetItemId: 'filter_cartridge',
    targetQuantity: 6,
    rewardCash: 650,
    rewardRep: 12,
    penaltyRep: 6,
    deadlineDay: 3,
    deadlineHour: 22,
    riskLevel: 'low',
    isContraband: false,
  },
  ct_servo_salvage: {
    id: 'ct_servo_salvage',
    title: 'Precision Actuator Requisition',
    description: 'Acquire 4x Precision Servo Motors for automated sorting gantry overhaul.',
    type: 'procurement',
    status: 'available',
    issuer: 'Merek Sterling',
    issuerFaction: 'brokers',
    districtId: 'harborline',
    targetDistrictId: 'harborline',
    targetItemId: 'servo_motor',
    targetQuantity: 4,
    rewardCash: 1200,
    rewardRep: 15,
    penaltyRep: 8,
    deadlineDay: 5,
    deadlineHour: 12,
    riskLevel: 'moderate',
    isContraband: false,
  },
  ct_stim_smuggle: {
    id: 'ct_stim_smuggle',
    title: 'Covert Stimulant Run',
    description: 'Smuggle 5x Combat Stim Injections past Harborline security checkpoints.',
    type: 'smuggling',
    status: 'available',
    issuer: 'Darius Thorne',
    issuerFaction: 'syndicate',
    districtId: 'ashmarket',
    targetDistrictId: 'harborline',
    targetItemId: 'combat_stims',
    targetQuantity: 5,
    rewardCash: 2400,
    rewardRep: 25,
    penaltyRep: 20,
    deadlineDay: 4,
    deadlineHour: 23,
    riskLevel: 'high',
    isContraband: true,
  },
  ct_neuro_chips: {
    id: 'ct_neuro_chips',
    title: 'Black-Market Neural Processor Delivery',
    description: 'Bypass Crown Heights corporate gate scanners to deliver unindexed neural chips.',
    type: 'smuggling',
    status: 'available',
    issuer: 'Ghost Network',
    issuerFaction: 'syndicate',
    districtId: 'neon_row',
    targetDistrictId: 'crown_heights',
    targetItemId: 'neural_chip',
    targetQuantity: 3,
    rewardCash: 3800,
    rewardRep: 35,
    penaltyRep: 25,
    deadlineDay: 6,
    deadlineHour: 20,
    riskLevel: 'extreme',
    isContraband: true,
  },
};

export const NARRATIVE_EVENT_POOL: NarrativeEvent[] = [
  {
    id: 'ev_harbor_inspection',
    title: 'Customs Interdiction Checkpoint',
    description:
      'Port Authority sentries have sealed the transit gate. An officer scans your freight manifests with suspicious intensity.',
    districtId: 'harborline',
    choices: [
      {
        text: 'Pay a discreet grease bribe (Cost: $250)',
        effect: { cashDelta: -250, repDelta: 1 },
        outcomeDescription: 'The inspector slips your credits into their coat and waves your haul through without inspection.',
      },
      {
        text: 'Present Merchant Credentials & Bluff',
        effect: { repDelta: 4, factionId: 'authority', factionRepDelta: 3 },
        outcomeDescription: 'Your official demeanor and merchant standing disarm their suspicions. Gate cleared.',
      },
      {
        text: 'Surrender Contraband Goods',
        effect: { confiscateContraband: true, repDelta: -3 },
        outcomeDescription: 'Inspectors seize illicit cargo from your crates, but permit you to proceed without arrest.',
      },
    ],
  },
  {
    id: 'ev_syndicate_crossroads',
    title: 'Shadow Broker Encounters',
    description:
      'A hooded syndicate operative intercepts you in a service alley with an unindexed encrypted memory core.',
    districtId: 'ashmarket',
    choices: [
      {
        text: 'Broker the core to Syndicate fences (+ $500, +8 Syndicate REP, -5 Authority REP)',
        effect: { cashDelta: 500, factionId: 'syndicate', factionRepDelta: 8, repDelta: 2 },
        outcomeDescription: 'The fence pays hard currency and praises your discretion.',
      },
      {
        text: 'Turn the core over to District Marshals (+12 Authority REP, -8 Syndicate REP)',
        effect: { factionId: 'authority', factionRepDelta: 12, repDelta: 5 },
        outcomeDescription: 'Authority officers log your civic assistance and award security clearance credits.',
      },
      {
        text: 'Decline and keep moving',
        effect: {},
        outcomeDescription: 'You step past the shadow operative, refusing entanglements with either faction.',
      },
    ],
  },
];

/**
 * Check deadlines on active contracts. Fail expired ones.
 */
export function processContractDeadlines(state: GameState): GameState {
  const currentDay = state.time.day;
  const currentHour = state.time.hour;
  const updatedContracts = { ...state.contracts };
  let repPenalty = 0;

  for (const [id, contract] of Object.entries(updatedContracts)) {
    if (contract.status === 'active') {
      const isPastDay = currentDay > contract.deadlineDay;
      const isPastHour = currentDay === contract.deadlineDay && currentHour >= contract.deadlineHour;

      if (isPastDay || isPastHour) {
        updatedContracts[id] = {
          ...contract,
          status: 'failed',
        };
        repPenalty += contract.penaltyRep;
      }
    }
  }

  // Trigger occasional narrative events on travel or ticks if none active (10% chance)
  let nextNarrative = state.activeNarrativeEvent;
  if (!nextNarrative && Math.random() < 0.08) {
    const randomEvent = NARRATIVE_EVENT_POOL[Math.floor(Math.random() * NARRATIVE_EVENT_POOL.length)];
    if (randomEvent) {
      nextNarrative = randomEvent;
    }
  }

  return {
    ...state,
    contracts: updatedContracts,
    player: {
      ...state.player,
      reputation: Math.max(0, state.player.reputation - repPenalty),
    },
    activeNarrativeEvent: nextNarrative ?? null,
  };
}

/**
 * Handle narrative choice resolution
 */
export function applyNarrativeChoice(
  state: GameState,
  choice: NarrativeChoice
): GameState {
  let updatedPlayer = { ...state.player };
  let updatedFactions = { ...state.factions };

  if (choice.effect.cashDelta) {
    updatedPlayer.balance = Math.max(0, updatedPlayer.balance + choice.effect.cashDelta);
  }

  if (choice.effect.repDelta) {
    updatedPlayer.reputation = Math.max(0, updatedPlayer.reputation + choice.effect.repDelta);
  }

  if (choice.effect.factionId && choice.effect.factionRepDelta) {
    const faction = updatedFactions[choice.effect.factionId];
    if (faction) {
      updatedFactions[choice.effect.factionId] = {
        ...faction,
        reputation: Math.max(-100, Math.min(100, faction.reputation + choice.effect.factionRepDelta)),
      };
    }
  }

  if (choice.effect.confiscateContraband) {
    // Remove illegal items
    const legalItems = updatedPlayer.inventory.filter((slot) => {
      const item = state.items[slot.itemId];
      return item ? item.legal : true;
    });
    updatedPlayer.inventory = legalItems;
    // Recalculate weight
    updatedPlayer.currentWeight = legalItems.reduce((sum, slot) => {
      const item = state.items[slot.itemId];
      return sum + (item ? item.weight * slot.quantity : 0);
    }, 0);
  }

  return {
    ...state,
    player: updatedPlayer,
    factions: updatedFactions,
    activeNarrativeEvent: null,
  };
}
