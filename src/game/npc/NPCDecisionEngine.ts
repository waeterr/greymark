import { NPC, Item, GameState } from '../../types/game.types';

/**
 * NPC Decision Engine: Evaluates utility scores for autonomous trading decisions
 * Based on personality, market conditions, wealth, and trust relationships
 */

export interface TradeDecision {
  action: 'buy' | 'sell' | 'hold';
  itemId: string;
  quantity: number;
  targetPrice: number;
  confidence: number;
}

export function evaluateNPCTradeOpportunity(
  npc: NPC,
  item: Item,
  _state: GameState
): TradeDecision | null {
  const { personality, wealth } = npc;

  // Base utility scoring factors
  const priceRatio = item.currentPrice / item.basePrice;
  const demandSupplyRatio = item.demand / Math.max(1, item.supply);

  // Personality-based decision modifiers
  let buyThreshold = 1.0;
  let sellThreshold = 1.0;
  let riskTolerance = 0.5;

  switch (personality) {
    case 'aggressive':
      buyThreshold = 1.15; // Buy when price is high (momentum)
      sellThreshold = 0.95; // Sell quickly for profit
      riskTolerance = 0.8;
      break;
    case 'cautious':
      buyThreshold = 0.85; // Only buy when discount is clear
      sellThreshold = 1.2; // Hold for higher margins
      riskTolerance = 0.3;
      break;
    case 'opportunistic':
      buyThreshold = 0.9;
      sellThreshold = 1.15;
      riskTolerance = 0.6;
      break;
    case 'greedy':
      buyThreshold = 0.8;
      sellThreshold = 1.3; // Hold for extreme markup
      riskTolerance = 0.7;
      break;
    case 'generous':
      buyThreshold = 1.05;
      sellThreshold = 1.05; // Fair pricing
      riskTolerance = 0.4;
      break;
    case 'loyal':
      buyThreshold = 0.95;
      sellThreshold = 1.1;
      riskTolerance = 0.5;
      break;
    case 'competitive':
      buyThreshold = 1.0;
      sellThreshold = 1.0;
      riskTolerance = 0.65;
      break;
  }

  // Wealth constraint: can't buy if broke
  const canAfford = wealth >= item.currentPrice * 2;

  // NPC role-based behavior
  if (npc.role === 'supplier') {
    // Suppliers prefer buying raw materials when prices are low, selling finished goods
    if (
      (item.category === 'raw_materials' || item.category === 'consumer_goods') &&
      priceRatio < buyThreshold &&
      canAfford &&
      demandSupplyRatio > 0.8
    ) {
      const qty = Math.max(1, Math.floor(wealth / item.currentPrice / 10));
      return {
        action: 'buy',
        itemId: item.id,
        quantity: Math.min(qty, 15),
        targetPrice: item.currentPrice * 0.95,
        confidence: 0.7 + riskTolerance * 0.2,
      };
    }

    // Check existing inventory for selling
    const inventorySlot = npc.inventory.find((slot) => slot.itemId === item.id);
    if (inventorySlot && inventorySlot.quantity > 5 && priceRatio > sellThreshold) {
      const sellQty = Math.floor(inventorySlot.quantity * 0.3);
      return {
        action: 'sell',
        itemId: item.id,
        quantity: sellQty,
        targetPrice: item.currentPrice * 1.05,
        confidence: 0.6 + riskTolerance * 0.15,
      };
    }
  }

  if (npc.role === 'dealer') {
    // Dealers buy commodities to resell at markup
    if (
      priceRatio < buyThreshold * 0.95 &&
      canAfford &&
      item.trend !== 'falling' &&
      item.trend !== 'oversupply'
    ) {
      const qty = Math.max(1, Math.floor(wealth / item.currentPrice / 8));
      return {
        action: 'buy',
        itemId: item.id,
        quantity: Math.min(qty, 10),
        targetPrice: item.currentPrice,
        confidence: 0.65 + riskTolerance * 0.15,
      };
    }

    const inventorySlot = npc.inventory.find((slot) => slot.itemId === item.id);
    if (inventorySlot && priceRatio > sellThreshold * 1.05) {
      return {
        action: 'sell',
        itemId: item.id,
        quantity: Math.min(inventorySlot.quantity, 8),
        targetPrice: item.currentPrice * 1.08,
        confidence: 0.7,
      };
    }
  }

  if (npc.role === 'collector') {
    // Collectors hoard rare and exotic items when prices dip
    if (
      (item.rarity === 'rare' || item.rarity === 'exotic' || item.category === 'collectibles') &&
      priceRatio < 1.1 &&
      canAfford
    ) {
      return {
        action: 'buy',
        itemId: item.id,
        quantity: Math.max(1, Math.floor(wealth / item.currentPrice / 20)),
        targetPrice: item.currentPrice * 1.1,
        confidence: 0.75 + riskTolerance * 0.1,
      };
    }
  }

  if (npc.role === 'broker') {
    // Brokers exploit arbitrage and volatility
    if (item.trend === 'volatile' && canAfford) {
      const inventorySlot = npc.inventory.find((slot) => slot.itemId === item.id);
      if (inventorySlot && priceRatio > 1.15) {
        return {
          action: 'sell',
          itemId: item.id,
          quantity: inventorySlot.quantity,
          targetPrice: item.currentPrice * 1.12,
          confidence: 0.8,
        };
      } else if (!inventorySlot && priceRatio < 0.9) {
        return {
          action: 'buy',
          itemId: item.id,
          quantity: Math.max(1, Math.floor(wealth / item.currentPrice / 12)),
          targetPrice: item.currentPrice * 0.92,
          confidence: 0.75,
        };
      }
    }
  }

  // Default: hold
  return null;
}

export function executeNPCAutonomousTrading(state: GameState): GameState {
  const updatedNpcs = { ...state.npcs };
  const updatedItems = { ...state.items };

  // Iterate through NPCs and execute decisions
  for (const [npcId, npc] of Object.entries(updatedNpcs)) {
    // Skip if NPC is in same district as player (avoid conflict with manual trades)
    if (npc.districtId === state.player.currentDistrict) continue;

    // Randomly activate NPC trading (25% chance per tick per NPC)
    if (Math.random() > 0.25) continue;

    // Pick a random item from market
    const itemIds = Object.keys(updatedItems);
    if (itemIds.length === 0) continue;
    const randomItemId = itemIds[Math.floor(Math.random() * itemIds.length)]!;
    const item = updatedItems[randomItemId];
    if (!item) continue;

    const decision = evaluateNPCTradeOpportunity(npc, item, state);
    if (!decision) continue;

    // Execute trade based on decision
    if (decision.action === 'buy' && npc.wealth >= decision.targetPrice * decision.quantity) {
      // NPC buys from market
      const cost = decision.targetPrice * decision.quantity;
      const existingSlot = npc.inventory.find((s) => s.itemId === item.id);

      if (existingSlot) {
        existingSlot.quantity += decision.quantity;
        existingSlot.price = (existingSlot.price + decision.targetPrice) / 2; // Average
      } else {
        npc.inventory.push({
          itemId: item.id,
          quantity: decision.quantity,
          price: decision.targetPrice,
        });
      }

      npc.wealth -= cost;

      // Market impact: decrease supply, slight demand increase
      const currentItem = updatedItems[item.id]!;
      updatedItems[item.id] = {
        ...currentItem,
        supply: Math.max(5, currentItem.supply - Math.ceil(decision.quantity * 0.3)),
        demand: currentItem.demand + Math.ceil(decision.quantity * 0.1),
      };
    } else if (decision.action === 'sell') {
      // NPC sells to market
      const inventorySlot = npc.inventory.find((s) => s.itemId === item.id);
      if (!inventorySlot || inventorySlot.quantity < decision.quantity) continue;

      const revenue = decision.targetPrice * decision.quantity;
      npc.wealth += revenue;

      inventorySlot.quantity -= decision.quantity;
      if (inventorySlot.quantity === 0) {
        npc.inventory = npc.inventory.filter((s) => s.itemId !== item.id);
      }

      // Market impact: increase supply, slight demand decrease
      const currentItem = updatedItems[item.id]!;
      updatedItems[item.id] = {
        ...currentItem,
        supply: currentItem.supply + Math.ceil(decision.quantity * 0.3),
        demand: Math.max(5, currentItem.demand - Math.ceil(decision.quantity * 0.1)),
      };
    }

    updatedNpcs[npcId] = npc;
  }

  return {
    ...state,
    npcs: updatedNpcs,
    items: updatedItems,
  };
}
