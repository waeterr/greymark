import assert from 'node:assert/strict';
import { useGameStore } from '../store/gameStore';
import { checkFactionPrivileges } from '../game/factions/FactionEngine';
import {
  calculatePlayerNetWorth,
  checkTierEligibility,
  calculatePassiveIncome,
  getActivePerks,
} from '../game/progression/PlayerProgression';

console.log('Running Greymark Business Progression & Assets self-check...');

// 1. Initial State
const store = useGameStore.getState();
assert.equal(store.state.player.balance, 1500, 'Initial balance must be $1,500');
assert.ok(store.state.player.properties.length >= 6, 'Must have at least 6 real estate properties');
assert.equal(store.state.player.skillPoints, 10, 'Initial skill points should be 10');

// 2. Net Worth Calculation
const initialNetWorth = calculatePlayerNetWorth(store.state);
assert.ok(initialNetWorth > 1000, `Net worth should reflect balance + inventory - debt: ${initialNetWorth}`);

// 3. Property Acquisition & Passive Income
const firstProp = store.state.player.properties[0]!;
assert.equal(firstProp.purchased, false, 'Property initially not purchased');

const buyPropRes = store.purchaseProperty(firstProp.id);
assert.equal(buyPropRes.success, true, 'Purchasing property should succeed');

const postBuyState = useGameStore.getState().state;
const acquiredProp = postBuyState.player.properties.find((p) => p.id === firstProp.id);
assert.equal(acquiredProp?.purchased, true, 'Property should now be marked purchased');
assert.equal(
  postBuyState.player.balance,
  1500 - firstProp.cost,
  'Balance should be debited by property cost'
);
assert.equal(
  postBuyState.player.storageCapacity,
  50 + firstProp.capacityBonus,
  'Storage capacity should include property capacity bonus'
);

// 4. Passive Income Simulation Tick
const passiveYield = calculatePassiveIncome(postBuyState.player.properties, 2);
assert.equal(
  passiveYield,
  firstProp.incomePerHour * 2,
  'Passive yield should equal incomePerHour * hours'
);

const balanceBeforeTick = useGameStore.getState().state.player.balance;
useGameStore.getState().advanceTime(2);
const balanceAfterTick = useGameStore.getState().state.player.balance;
assert.equal(
  balanceAfterTick,
  balanceBeforeTick + passiveYield,
  'Advancing 2 hours must credit passive income from owned properties'
);

// 5. Skill Tree Unlocks & Active Perks
const skillUnlockRes = useGameStore.getState().unlockPlayerSkill('storage_expansion');
assert.equal(skillUnlockRes.success, true, 'Unlocking valid skill should succeed');
const stateAfterSkill = useGameStore.getState().state;
assert.ok(
  stateAfterSkill.player.unlockedSkills.includes('storage_expansion'),
  'Skill must be recorded in unlockedSkills'
);
const perks = getActivePerks(stateAfterSkill.player.unlockedSkills);
assert.equal(perks.capacityBonus, 25, 'Storage expansion skill must grant 25 kg capacity');

// 6. Tier Eligibility Verification
const eligible = checkTierEligibility('street_trader', 30, 6000);
assert.equal(eligible, 'independent_merchant', '30 REP and $6k NW must qualify for independent merchant');

// 7. Factions & Negotiation Integration
const privileges = checkFactionPrivileges('syndicate', 55);
assert.equal(privileges.canAccessExclusiveContracts, true, '55 REP should unlock contracts');

console.log('Greymark Business Progression & Assets self-check PASSED: all checks verified.');
