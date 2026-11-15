import { create } from 'zustand';
import { DistrictId, NavView } from '../types/game.types';
import { sound } from '../game/audio/SoundEngine';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface UIStore {
  activeView: NavView;
  selectedItemId: string | null;
  selectedNpcId: string | null;
  selectedDistrictId: DistrictId;
  isSidebarOpen: boolean;
  toasts: ToastMessage[];
  soundEnabled: boolean;
  crtGlow: boolean;

  setActiveView: (view: NavView) => void;
  selectItem: (itemId: string | null) => void;
  selectNpc: (npcId: string | null) => void;
  selectDistrict: (districtId: DistrictId) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleSound: () => void;
  toggleCrtGlow: () => void;
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeView: 'dashboard',
  selectedItemId: null,
  selectedNpcId: null,
  selectedDistrictId: 'old_quarter',
  isSidebarOpen: false,
  toasts: [],
  soundEnabled: true,
  crtGlow: false,

  setActiveView: (view) => {
    sound.playClick();
    set({ activeView: view });
  },
  selectItem: (itemId) => {
    sound.playClick();
    set({ selectedItemId: itemId });
  },
  selectNpc: (npcId) => {
    sound.playClick();
    set({ selectedNpcId: npcId });
  },
  selectDistrict: (districtId) => {
    sound.playClick();
    set({ selectedDistrictId: districtId });
  },
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleSound: () =>
    set((state) => {
      const next = !state.soundEnabled;
      sound.setMuted(!next);
      return { soundEnabled: next };
    }),
  toggleCrtGlow: () => set((state) => ({ crtGlow: !state.crtGlow })),
  addToast: (message, type = 'info') => {
    if (type === 'success') sound.playTradeSuccess();
    else if (type === 'error') sound.playError();
    else if (type === 'warning') sound.playAlert();
    else sound.playTick();

    const id = Math.random().toString(36).slice(2, 9);
    set((state) => ({
      toasts: [...state.toasts.slice(-4), { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
