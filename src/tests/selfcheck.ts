import assert from 'node:assert/strict';
import { useGameStore } from '../store/gameStore';
import { checkFactionPrivileges } from '../game/factions/FactionEngine';
import {
  calculatePlayerNetWorth,
  calculatePassiveIncome,
  getActivePerks,
} from '../game/progression/PlayerProgression';
import { NARRATIVE_EVENT_POOL } from '../game/narrative/NarrativeEngine';

console.log('Running Greymark Contracts & Narrative self-check...');

// 1. Initial State & Contracts Scale
const store = useGameStore.getState();
assert.equal(store.state.player.balance, 1500, 'Initial balance must be $1,500');
assert.ok(Object.keys(store.state.contracts).length >= 5, 'Must have at least 5 contracts defined');
assert.ok(store.state.player.properties.length >= 6, 'Must have at least 6 real estate properties');

// 2. Net Worth & Asset Checks
const initialNetWorth = calculatePlayerNetWorth(store.state);
assert.ok(initialNetWorth > 1000, `Net worth should reflect balance + inventory - debt: ${initialNetWorth}`);

// 3. Property Acquisition & Passive Income
const firstProp = store.state.player.properties[0]!;
const buyPropRes = store.purchaseProperty(firstProp.id);
assert.equal(buyPropRes.success, true, 'Purchasing property should succeed');

const postBuyState = useGameStore.getState().state;
const passiveYield = calculatePassiveIncome(postBuyState.player.properties, 2);
assert.equal(
  passiveYield,
  firstProp.incomePerHour * 2,
  'Passive yield should equal incomePerHour * hours'
);

// 4. Contract Acceptance & Commitment
const contractId = 'ct_filtration_urgent';
const initialContract = store.state.contracts[contractId]!;
assert.equal(initialContract.status, 'available', 'Contract must initially be available');

const acceptRes = useGameStore.getState().acceptContract(contractId);
assert.equal(acceptRes.success, true, 'Accepting contract should succeed');
assert.equal(
  useGameStore.getState().state.contracts[contractId]?.status,
  'active',
  'Contract status should transition to active'
);

// 5. Contract Fulfillment & Payout
// Ensure player has adequate stock for fulfillment
useGameStore.setState((s) => ({
  state: {
    ...s.state,
    player: {
      ...s.state.player,
      currentDistrict: initialContract.targetDistrictId || 'old_quarter',
      inventory: [
        ...s.state.player.inventory,
        {
          itemId: initialContract.targetItemId,
          quantity: initialContract.targetQuantity,
          averageBuyPrice: 50,
          quality: 'standard',
        },
      ],
    },
  },
}));

const balancePreFulfill = useGameStore.getState().state.player.balance;
const repPreFulfill = useGameStore.getState().state.player.reputation;

const fulfillRes = useGameStore.getState().fulfillContract(contractId);
assert.equal(fulfillRes.success, true, 'Fulfilling contract with required goods must succeed');

const statePostFulfill = useGameStore.getState().state;
assert.equal(
  statePostFulfill.contracts[contractId]?.status,
  'completed',
  'Contract status must be completed'
);
assert.equal(
  statePostFulfill.player.balance,
  balancePreFulfill + initialContract.rewardCash,
  'Player balance must increase by contract reward cash'
);
assert.ok(
  statePostFulfill.player.reputation > repPreFulfill,
  'Player reputation must increase from contract payout'
);

// 6. Narrative Encounter Resolution
const testEvent = NARRATIVE_EVENT_POOL[0]!;
useGameStore.setState((s) => ({
  state: {
    ...s.state,
    activeNarrativeEvent: testEvent,
  },
}));

const preChoiceBalance = useGameStore.getState().state.player.balance;
const choiceRes = useGameStore.getState().resolveNarrativeChoice(0); // Bribe option (-$250)
assert.equal(choiceRes.success, true, 'Resolving narrative choice should succeed');

const statePostChoice = useGameStore.getState().state;
assert.equal(statePostChoice.activeNarrativeEvent, null, 'Active narrative event must be cleared');
assert.equal(
  statePostChoice.player.balance,
  preChoiceBalance - 250,
  'Bribe choice must debit $250 from balance'
);

// 7. Contract Deadline Failure on Simulation Tick
const expireContractId = 'ct_iron_rations';
useGameStore.getState().acceptContract(expireContractId);
const preExpireRep = useGameStore.getState().state.player.reputation;

// Advance time past deadline (Day 4 -> simulate 100 hours)
useGameStore.getState().advanceTime(100);

const statePostExpire = useGameStore.getState().state;
assert.equal(
  statePostExpire.contracts[expireContractId]?.status,
  'failed',
  'Contract must be marked failed after deadline passes'
);
assert.ok(
  statePostExpire.player.reputation <= preExpireRep,
  'Failed contract must dock player reputation'
);

// 8. Skill & Tier Perks
const perks = getActivePerks(statePostExpire.player.unlockedSkills);
assert.ok(typeof perks.negotiationBonus === 'number', 'Perks calculation must return valid numbers');
const privileges = checkFactionPrivileges('syndicate', 55);
assert.equal(privileges.canAccessExclusiveContracts, true, '55 REP should unlock contracts');

console.log('Greymark Contracts & Narrative self-check PASSED: all checks verified.');
