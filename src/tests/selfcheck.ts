import assert from 'node:assert/strict';
import { useGameStore } from '../store/gameStore';
import { calculateNegotiationOutcome } from '../game/npc/NegotiationEngine';
import { checkFactionPrivileges, awardTradingReputation } from '../game/factions/FactionEngine';

console.log('Running Greymark World & Factions self-check...');

// 1. Initial State
const store = useGameStore.getState();
assert.equal(store.state.player.balance, 1500, 'Initial balance must be $1,500');
assert.ok(Object.keys(store.state.factions).length === 4, 'Must have 4 factions');

// 2. Faction Privileges Tier Checks
const noPrivileges = checkFactionPrivileges('syndicate', 10);
assert.equal(noPrivileges.canAccessExclusiveContracts, false, '10 REP should not unlock contracts');
assert.equal(noPrivileges.priceDiscountModifier, 1.0, '10 REP should have no discount');

const highRepPrivileges = checkFactionPrivileges('syndicate', 55);
assert.equal(highRepPrivileges.canAccessExclusiveContracts, true, '55 REP should unlock contracts');
assert.equal(highRepPrivileges.priceDiscountModifier, 0.95, '55 REP should unlock 5% discount');

// 3. Trading Reputation Award Check
const initialCollectiveRep = store.state.factions['collective']!.reputation;
const stateAfterOldQuarterTrade = awardTradingReputation(
  store.state,
  'old_quarter',
  1200 // $1,200 trade volume
);
assert.ok(
  stateAfterOldQuarterTrade.factions['collective']!.reputation > initialCollectiveRep,
  'Trading in Old Quarter should increase Collective reputation'
);

// 4. Autonomous Negotiation & Decision Unit Checks
const testItem = store.state.items['synthetic_grain']!;
const testNpc = store.state.npcs['npc_karl']!;
const generousOffer = calculateNegotiationOutcome({
  type: 'buy',
  item: testItem,
  offeredPrice: testItem.currentPrice * 1.05,
  npc: testNpc,
  playerReputation: store.state.player.reputation,
});
assert.equal(generousOffer.outcome, 'accepted', 'Generous offer should be accepted');

// 5. Time Advance Triggers Conflict & Simulation
const initialTick = useGameStore.getState().state.time.tick;
useGameStore.getState().advanceTime(3);
assert.equal(useGameStore.getState().state.time.tick, initialTick + 3, 'Tick must advance');

console.log('Greymark World & Factions self-check PASSED: all checks verified.');
