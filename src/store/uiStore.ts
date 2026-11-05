import { create } from 'zustand';
import { DistrictId, NavView } from '../types/game.types';

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

  setActiveView: (view: NavView) => void;
  selectItem: (itemId: string | null) => void;
  selectNpc: (npcId: string | null) => void;
  selectDistrict: (districtId: DistrictId) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
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

  setActiveView: (view) => set({ activeView: view }),
  selectItem: (itemId) => set({ selectedItemId: itemId }),
  selectNpc: (npcId) => set({ selectedNpcId: npcId }),
  selectDistrict: (districtId) => set({ selectedDistrictId: districtId }),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  addToast: (message, type = 'info') => {
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
