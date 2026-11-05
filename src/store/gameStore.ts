import { create } from 'zustand';
import { GameState, ItemQuality } from '../types/game.types';
import { INITIAL_GAME_STATE } from '../data/initialData';

interface GameStore {
  state: GameState;
  
  initializeGame: () => void;
  loadGame: (state: GameState) => void;
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

  travelToDistrict: (districtId) => {
    const s = get().state;
    const dest = s.districts[districtId];
    if (!dest || !dest.unlocked) return false;
    if (s.player.balance < dest.transportCost) return false;

    set((current) => ({
      state: {
        ...current.state,
        player: {
          ...current.state.player,
          balance: current.state.player.balance - dest.transportCost,
          currentDistrict: districtId,
        },
        time: {
          ...current.state.time,
          hour: (current.state.time.hour + 1) % 24,
          day: current.state.time.hour + 1 >= 24 ? current.state.time.day + 1 : current.state.time.day,
        },
      },
    }));
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

      return {
        state: {
          ...current.state,
          player: {
            ...current.state.player,
            balance: current.state.player.balance - totalCost,
            currentWeight: current.state.player.currentWeight + addedWeight,
            inventory: inv,
          },
          transactions: [tx, ...current.state.transactions].slice(0, 50),
        },
      };
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

      return {
        state: {
          ...current.state,
          player: {
            ...current.state.player,
            balance: current.state.player.balance + totalRevenue,
            currentWeight: Math.max(0, current.state.player.currentWeight - freedWeight),
            inventory: inv,
          },
          transactions: [tx, ...current.state.transactions].slice(0, 50),
        },
      };
    });

    return { success: true };
  },
}));
