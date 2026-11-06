import assert from 'node:assert/strict';
import { useGameStore } from '../store/gameStore';
import { calculateDynamicPrice } from '../game/economy/EconomicEngine';

console.log('Running Greymark Economic Analytics & Charts self-check...');

// 1. Initial State & Catalog Scale
const store = useGameStore.getState();
const itemCount = Object.keys(store.state.items).length;
const npcCount = Object.keys(store.state.npcs).length;

assert.ok(itemCount >= 20, `MVP requires >= 20 goods in catalog, found: ${itemCount}`);
assert.ok(npcCount >= 10, `MVP requires >= 10 NPCs, found: ${npcCount}`);
assert.equal(store.state.player.balance, 1500, 'Initial balance must be $1,500');
assert.equal(store.state.player.currentDistrict, 'old_quarter', 'Initial district must be old_quarter');

// 2. Dynamic Pricing Engine Unit Checks
const testItem = store.state.items['synthetic_grain']!;
const highSupplyPrice = calculateDynamicPrice({
  ...testItem,
  supply: 200,
  demand: 50,
  trend: 'oversupply',
});
const highDemandPrice = calculateDynamicPrice({
  ...testItem,
  supply: 30,
  demand: 180,
  trend: 'scarcity',
});
assert.ok(
  highDemandPrice > highSupplyPrice,
  `Scarcity/High demand price ($${highDemandPrice}) must be greater than Oversupply price ($${highSupplyPrice})`
);

// 3. Price History Telemetry & Statistics
const history = testItem.priceHistory;
assert.ok(history.length >= 3, 'Items must track price history buffer');
const ath = Math.max(...history);
const atl = Math.min(...history);
const avg = history.reduce((a, b) => a + b, 0) / history.length;
assert.ok(ath >= atl, 'ATH must be greater than or equal to ATL');
assert.ok(avg >= atl && avg <= ath, 'Average price must sit between ATL and ATH');

// 4. District Arbitrage Spread
const oldQuarterPrice = calculateDynamicPrice(
  testItem,
  store.state.districts['old_quarter']
);
const crownHeightsPrice = calculateDynamicPrice(
  testItem,
  store.state.districts['crown_heights']
);
assert.ok(
  crownHeightsPrice !== oldQuarterPrice,
  'District economic profiles must produce differential spot prices'
);

// 5. Time Advance & Simulation Tick
const initialHour = useGameStore.getState().state.time.hour;
useGameStore.getState().advanceTime(2);
const afterHour = useGameStore.getState().state.time.hour;
assert.equal(afterHour, (initialHour + 2) % 24, 'Advancing 2 hours must advance game clock by 2 hours');

console.log('Greymark Economic Analytics & Charts self-check PASSED: all checks verified.');
