import { NPC, Item } from '../../types/game.types';

/**
 * Negotiation Engine: Handles dynamic counter-offers, success rates,
 * and relationship impacts based on NPC personality, player reputation, and market conditions
 */

export interface NegotiationRequest {
  type: 'buy' | 'sell';
  item: Item;
  quantity?: number;
  offeredPrice: number;
  npc: NPC;
  playerReputation: number;
}

export interface NegotiationResult {
  outcome: 'accepted' | 'counter_offer' | 'rejected';
  finalPrice: number;
  counterOfferPrice?: number;
  trustDelta: number;
  reason: string;
}

export function calculateNegotiationOutcome(
  request: NegotiationRequest
): NegotiationResult {
  const { type, item, offeredPrice, npc, playerReputation } = request;
  const spotPrice = item.currentPrice;

  // Compute price deviation ratio
  // If player is buying: lower price offered is aggressive
  // If player is selling: higher price offered is aggressive
  let priceRatio = 1.0;
  if (type === 'buy') {
    priceRatio = offeredPrice / spotPrice; // e.g. 0.85 = asking 15% discount
  } else {
    priceRatio = spotPrice / offeredPrice; // e.g. 1.25 = asking 25% markup
  }

  // Determine NPC flexibility based on personality & trust
  let flexFactor = 0.1; // Default ±10% margin
  let angerThreshold = 0.75; // How greedy the player can get before getting rejected
  let trustBonus = Math.min(0.15, npc.trust / 500); // Up to +15% flexibility from trust
  let repBonus = Math.min(0.1, playerReputation / 1000); // Up to +10% from reputation

  switch (npc.personality) {
    case 'generous':
      flexFactor = 0.2;
      angerThreshold = 0.65;
      break;
    case 'loyal':
      flexFactor = 0.15;
      angerThreshold = 0.7;
      break;
    case 'cautious':
      flexFactor = 0.08;
      angerThreshold = 0.82;
      break;
    case 'greedy':
      flexFactor = 0.05;
      angerThreshold = 0.9;
      break;
    case 'aggressive':
      flexFactor = 0.06;
      angerThreshold = 0.88;
      break;
    case 'opportunistic':
      flexFactor = 0.12;
      angerThreshold = 0.8;
      break;
    case 'competitive':
      flexFactor = 0.07;
      angerThreshold = 0.85;
      break;
  }

  const effectiveFlex = flexFactor + trustBonus + repBonus;

  // Immediate Accept: Offer is within normal spot price or player offered generous terms
  if (type === 'buy' && priceRatio >= 1.0 - effectiveFlex * 0.4) {
    return {
      outcome: 'accepted',
      finalPrice: offeredPrice,
      trustDelta: offeredPrice >= spotPrice ? 2 : 1,
      reason: `${npc.name} readily agrees to the terms without hesitation.`,
    };
  }

  if (type === 'sell' && priceRatio >= 1.0 - effectiveFlex * 0.4) {
    return {
      outcome: 'accepted',
      finalPrice: offeredPrice,
      trustDelta: offeredPrice <= spotPrice ? 2 : 1,
      reason: `${npc.name} considers the price fair and completes the deal.`,
    };
  }

  // Counter Offer: Price is somewhat aggressive but within acceptable negotiation band
  if (priceRatio >= angerThreshold) {
    // Generate compromise price halfway between spot and player offer
    let counterPrice = spotPrice;
    if (type === 'buy') {
      const discount = Math.min(effectiveFlex, (1.0 - priceRatio) * 0.55);
      counterPrice = Math.round(spotPrice * (1.0 - discount) * 100) / 100;
    } else {
      const markup = Math.min(effectiveFlex, (1.0 - priceRatio) * 0.55);
      counterPrice = Math.round(spotPrice * (1.0 + markup) * 100) / 100;
    }

    return {
      outcome: 'counter_offer',
      finalPrice: counterPrice,
      counterOfferPrice: counterPrice,
      trustDelta: 0,
      reason: `${npc.name} counters the offer. Spot rate remains protected, but a discount is possible.`,
    };
  }

  // Outright Rejected: Offer was insulting or exceeded anger threshold
  return {
    outcome: 'rejected',
    finalPrice: spotPrice,
    trustDelta: -2,
    reason: `${npc.name} refuses the proposed terms. The margin is unacceptable to their operations.`,
  };
}
