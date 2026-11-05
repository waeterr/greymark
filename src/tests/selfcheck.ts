import assert from 'node:assert/strict';
import { useGameStore } from '../store/gameStore';

console.log('Running Greymark Phase 1 foundation self-check...');

// 1. Initial State Integrity
const store = useGameStore.getState();
assert.equal(store.state.player.balance, 1500, 'Initial balance must be $1,500');
assert.equal(store.state.player.currentDistrict, 'old_quarter', 'Initial district must be old_quarter');
assert.ok(Object.keys(store.state.items).length >= 7, 'Must have at least 7 starter commodities');
assert.ok(Object.keys(store.state.districts).length === 6, 'Must have 6 districts configured');
assert.ok(Object.keys(store.state.factions).length === 4, 'Must have 4 factions configured');

// 2. Buy Validation & Execution
const initialWeight = store.state.player.currentWeight;
const buyRes = store.buyItem({
  itemId: 'scrap_copper',
  quantity: 2,
  unitPrice: 40,
  counterpartyId: 'npc_karl',
  counterpartyName: 'Karl Vance',
  quality: 'standard',
});
assert.ok(buyRes.success, 'Buy transaction should succeed with sufficient balance');

const afterBuy = useGameStore.getState().state.player;
assert.equal(afterBuy.balance, 1500 - 80, 'Balance must decrease by $80');
assert.ok(afterBuy.currentWeight > initialWeight, 'Weight must increase after buying scrap copper');

// 3. Sell Validation & Execution
const sellRes = useGameStore.getState().sellItem({
  itemId: 'scrap_copper',
  quantity: 2,
  unitPrice: 45,
  counterpartyId: 'npc_lyra',
  counterpartyName: 'Lyra Thorne',
});
assert.ok(sellRes.success, 'Sell transaction should succeed with owned inventory');
const afterSell = useGameStore.getState().state.player;
assert.equal(afterSell.balance, 1420 + 90, 'Balance must increase by $90 after sale');

// 4. District Travel
const travelOk = useGameStore.getState().travelToDistrict('iron_district');
assert.ok(travelOk, 'Should travel to iron_district');
const afterTravel = useGameStore.getState().state.player;
assert.equal(afterTravel.currentDistrict, 'iron_district', 'Player must now be in iron_district');

console.log('Greymark Phase 1 self-check PASSED: all asserts verified.');
