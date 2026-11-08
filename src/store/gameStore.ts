import { create } from 'zustand';
import { GameState, ItemQuality } from '../types/game.types';
import { INITIAL_GAME_STATE } from '../data/initialData';
import {
  calculateDynamicPrice,
  simulateMarketTick,
} from '../game/economy/EconomicEngine';
import { awardTradingReputation } from '../game/factions/FactionEngine';

interface GameStore {
  state: GameState;

  initializeGame: () => void;
  loadGame: (state: GameState) => void;
  advanceTime: (hours?: number) => void;
  travelToDistrict: (districtId: GameState['player']['currentDistrict']) => boolean;
  buyItem: (params: {
    itemId: string;
    quantity: number;
    unitPrice: number;
    counterpartyId: string;
    counterpartyName: string;
    quality: ItemQuality;
  }) => { success: boolean; reason?: string };
  sellItem: (params: {
    itemId: string;
    quantity: number;
    unitPrice: number;
    counterpartyId: string;
    counterpartyName: string;
  }) => { success: boolean; reason?: string };
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: INITIAL_GAME_STATE,

  initializeGame: () => set({ state: INITIAL_GAME_STATE }),
  loadGame: (state) => set({ state }),

  advanceTime: (hours = 1) => {
    set((current) => ({
      state: simulateMarketTick(current.state, hours),
    }));
  },

  travelToDistrict: (districtId) => {
    const s = get().state;
    const dest = s.districts[districtId];
    if (!dest || !dest.unlocked) return false;
    if (s.player.balance < dest.transportCost) return false;

    // Travelling consumes 1 hour and recalculates prices for the new district
    const stateWithNewDistrict: GameState = {
      ...s,
      player: {
        ...s.player,
        balance: s.player.balance - dest.transportCost,
        currentDistrict: districtId,
      },
    };

    const advanced = simulateMarketTick(stateWithNewDistrict, 1);
    set({ state: advanced });
    return true;
  },

  buyItem: ({ itemId, quantity, unitPrice, counterpartyId, counterpartyName, quality }) => {
    const s = get().state;
    const item = s.items[itemId];
    if (!item) return { success: false, reason: 'Commodity not found' };

    const totalCost = unitPrice * quantity;
    if (s.player.balance < totalCost) {
      return { success: false, reason: 'Insufficient funds' };
    }

    const addedWeight = item.weight * quantity;
    if (s.player.currentWeight + addedWeight > s.player.storageCapacity) {
      return { success: false, reason: 'Storage capacity exceeded' };
    }

    // Check if supplier has stock
    const counterparty = s.npcs[counterpartyId];
    if (counterparty) {
      const npcSlot = counterparty.inventory.find((sl) => sl.itemId === itemId);
      if (npcSlot && npcSlot.quantity < quantity) {
        return { success: false, reason: `Supplier only has ${npcSlot.quantity} units available` };
      }
    }

    set((current) => {
      const inv = [...current.state.player.inventory];
      const existingIdx = inv.findIndex((slot) => slot.itemId === itemId && slot.quality === quality);

      if (existingIdx >= 0) {
        const existing = inv[existingIdx]!;
        const totalQty = existing.quantity + quantity;
        const totalVal = existing.averageBuyPrice * existing.quantity + totalCost;
        inv[existingIdx] = {
          ...existing,
          quantity: totalQty,
          averageBuyPrice: totalVal / totalQty,
        };
      } else {
        inv.push({
          itemId,
          quantity,
          averageBuyPrice: unitPrice,
          quality,
        });
      }

      // Deduct from supplier inventory if NPC
      const updatedNpcs = { ...current.state.npcs };
      if (counterparty && updatedNpcs[counterpartyId]) {
        const targetNpc = updatedNpcs[counterpartyId]!;
        const newNpcInv = targetNpc.inventory
          .map((sl) => (sl.itemId === itemId ? { ...sl, quantity: sl.quantity - quantity } : sl))
          .filter((sl) => sl.quantity > 0);

        updatedNpcs[counterpartyId] = {
          ...targetNpc,
          wealth: targetNpc.wealth + totalCost,
          trust: Math.min(100, targetNpc.trust + 1),
          inventory: newNpcInv,
        };
      }

      // Market impact: Buying lowers supply, slightly increases demand & price
      const updatedItems = { ...current.state.items };
      const currentItem = updatedItems[itemId];
      if (currentItem) {
        const newSupply = Math.max(1, currentItem.supply - Math.ceil(quantity * 0.5));
        const newDemand = currentItem.demand + Math.ceil(quantity * 0.2);
        const tempItem: typeof currentItem = {
          ...currentItem,
          supply: newSupply,
          demand: newDemand,
        };
        const district = current.state.districts[current.state.player.currentDistrict];
        const newPrice = calculateDynamicPrice(tempItem, district, current.state.activeEvents);
        updatedItems[itemId] = {
          ...tempItem,
          currentPrice: newPrice,
          priceHistory: [...currentItem.priceHistory, newPrice].slice(-15),
        };
      }

      const tx = {
        id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        itemId,
        itemName: item.name,
        quantity,
        unitPrice,
        totalPrice: totalCost,
        type: 'buy' as const,
        counterpartyId,
        counterpartyName,
        districtId: current.state.player.currentDistrict,
        tick: current.state.time.tick,
        day: current.state.time.day,
        hour: current.state.time.hour,
      };

      // Award faction reputation for trading in district
      let stateWithRep = {
        ...current.state,
        player: {
          ...current.state.player,
          balance: current.state.player.balance - totalCost,
          currentWeight: current.state.player.currentWeight + addedWeight,
          inventory: inv,
        },
        items: updatedItems,
        npcs: updatedNpcs,
        transactions: [tx, ...current.state.transactions].slice(0, 50),
      };

      stateWithRep = awardTradingReputation(
        stateWithRep,
        current.state.player.currentDistrict,
        totalCost
      );

      return { state: stateWithRep };
    });

    return { success: true };
  },

  sellItem: ({ itemId, quantity, unitPrice, counterpartyId, counterpartyName }) => {
    const s = get().state;
    const item = s.items[itemId];
    if (!item) return { success: false, reason: 'Commodity not found' };

    const existingIdx = s.player.inventory.findIndex((slot) => slot.itemId === itemId);
    if (existingIdx === -1 || (s.player.inventory[existingIdx]?.quantity ?? 0) < quantity) {
      return { success: false, reason: 'Not enough stock in inventory' };
    }

    const slot = s.player.inventory[existingIdx]!;
    const totalRevenue = unitPrice * quantity;
    const freedWeight = item.weight * quantity;
    const profit = totalRevenue - slot.averageBuyPrice * quantity;

    set((current) => {
      const inv = [...current.state.player.inventory];
      const currentSlot = inv[existingIdx]!;
      if (currentSlot.quantity === quantity) {
        inv.splice(existingIdx, 1);
      } else {
        inv[existingIdx] = {
          ...currentSlot,
          quantity: currentSlot.quantity - quantity,
        };
      }

      // Add to buyer inventory if NPC
      const updatedNpcs = { ...current.state.npcs };
      const counterparty = updatedNpcs[counterpartyId];
      if (counterparty) {
        const existingNpcSlot = counterparty.inventory.find((sl) => sl.itemId === itemId);
        let newNpcInv = [...counterparty.inventory];
        if (existingNpcSlot) {
          newNpcInv = newNpcInv.map((sl) =>
            sl.itemId === itemId ? { ...sl, quantity: sl.quantity + quantity } : sl
          );
        } else {
          newNpcInv.push({ itemId, quantity, price: unitPrice });
        }
        updatedNpcs[counterpartyId] = {
          ...counterparty,
          wealth: Math.max(0, counterparty.wealth - totalRevenue),
          trust: Math.min(100, counterparty.trust + 1),
          inventory: newNpcInv,
        };
      }

      // Market impact: Selling increases supply, slightly dampens demand & price
      const updatedItems = { ...current.state.items };
      const currentItem = updatedItems[itemId];
      if (currentItem) {
        const newSupply = currentItem.supply + Math.ceil(quantity * 0.5);
        const newDemand = Math.max(1, currentItem.demand - Math.ceil(quantity * 0.2));
        const tempItem: typeof currentItem = {
          ...currentItem,
          supply: newSupply,
          demand: newDemand,
        };
        const district = current.state.districts[current.state.player.currentDistrict];
        const newPrice = calculateDynamicPrice(tempItem, district, current.state.activeEvents);
        updatedItems[itemId] = {
          ...tempItem,
          currentPrice: newPrice,
          priceHistory: [...currentItem.priceHistory, newPrice].slice(-15),
        };
      }

      const tx = {
        id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        itemId,
        itemName: item.name,
        quantity,
        unitPrice,
        totalPrice: totalRevenue,
        type: 'sell' as const,
        counterpartyId,
        counterpartyName,
        districtId: current.state.player.currentDistrict,
        tick: current.state.time.tick,
        day: current.state.time.day,
        hour: current.state.time.hour,
        profit,
      };

      // Award faction reputation for trading in district
      let stateWithRep = {
        ...current.state,
        player: {
          ...current.state.player,
          balance: current.state.player.balance + totalRevenue,
          currentWeight: Math.max(0, current.state.player.currentWeight - freedWeight),
          inventory: inv,
        },
        items: updatedItems,
        npcs: updatedNpcs,
        transactions: [tx, ...current.state.transactions].slice(0, 50),
      };

      stateWithRep = awardTradingReputation(
        stateWithRep,
        current.state.player.currentDistrict,
        totalRevenue
      );

      return { state: stateWithRep };
    });

    return { success: true };
  },
}));
