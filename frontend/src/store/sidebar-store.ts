import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  toggle: () => void;
  toggleCollapse: () => void;
  setOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  isCollapsed: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setOpen: (isOpen) => set({ isOpen }),
}));
