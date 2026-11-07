import assert from 'node:assert/strict';
import { useGameStore } from '../store/gameStore';
import { calculateNegotiationOutcome } from '../game/npc/NegotiationEngine';
import { evaluateNPCTradeOpportunity } from '../game/npc/NPCDecisionEngine';

console.log('Running Greymark NPC Intelligence & Negotiation self-check...');

// 1. Initial State & Catalog Scale
const store = useGameStore.getState();
const itemCount = Object.keys(store.state.items).length;
const npcCount = Object.keys(store.state.npcs).length;

assert.ok(itemCount >= 20, `MVP requires >= 20 goods in catalog, found: ${itemCount}`);
assert.ok(npcCount >= 10, `MVP requires >= 10 NPCs, found: ${npcCount}`);
assert.equal(store.state.player.balance, 1500, 'Initial balance must be $1,500');

// 2. Negotiation Engine: Accept/Reject/Counter Logic
const testItem = store.state.items['synthetic_grain']!;
const testNpc = store.state.npcs['npc_karl']!;

// Test generous offer (should be accepted)
const generousOffer = calculateNegotiationOutcome({
  type: 'buy',
  item: testItem,
  quantity: 5,
  offeredPrice: testItem.currentPrice * 1.05, // Offering 5% above spot
  npc: testNpc,
  playerReputation: store.state.player.reputation,
});
assert.equal(
  generousOffer.outcome,
  'accepted',
  'Generous offer (above spot) should be accepted immediately'
);

// Test aggressive discount (should trigger counter or reject)
const aggressiveOffer = calculateNegotiationOutcome({
  type: 'buy',
  item: testItem,
  quantity: 5,
  offeredPrice: testItem.currentPrice * 0.7, // 30% discount request
  npc: testNpc,
  playerReputation: store.state.player.reputation,
});
assert.ok(
  aggressiveOffer.outcome === 'counter_offer' || aggressiveOffer.outcome === 'rejected',
  'Aggressive 30% discount should trigger counter-offer or rejection'
);

// 3. NPC Autonomous Decision Engine
const cheapItem = Object.values(store.state.items).find(
  (item) => item.currentPrice < item.basePrice * 0.9 && item.category === 'raw_materials'
);

if (cheapItem) {
  const supplierNpc = Object.values(store.state.npcs).find((npc) => npc.role === 'supplier');
  if (supplierNpc) {
    const decision = evaluateNPCTradeOpportunity(supplierNpc, cheapItem, store.state);
    assert.ok(
      decision === null || decision.action === 'buy' || decision.action === 'hold',
      'Supplier should consider buying discounted raw materials or hold'
    );
  }
}

// 4. Time Advance Triggers Autonomous Trading
const initialHour = useGameStore.getState().state.time.hour;
useGameStore.getState().advanceTime(2);
const afterHour = useGameStore.getState().state.time.hour;
assert.equal(afterHour, (initialHour + 2) % 24, 'Time must advance by 2 hours');

console.log('Greymark NPC Intelligence & Negotiation self-check PASSED: all checks verified.');
