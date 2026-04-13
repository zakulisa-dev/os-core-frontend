import { PersistentAppTypeId } from '@nameless-os/sdk';

export interface DesktopIcon {
  id: string;
  type: 'app' | 'file' | 'folder';
  persistentAppTypeId?: PersistentAppTypeId;
  filePath?: string;
  position: { x: number; y: number };
  gridPosition?: { row: number; col: number };
  name: string;
  icon: string;
  miniIcon?: string;
}

export interface GridSettings {
  enabled: boolean;
  cellWidth: number;
  cellHeight: number;
  padding: number;
  cols: number;
  rows: number;
}
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface DesktopState {
  icons: DesktopIcon[];
  selectedIcons: string[];
  gridSettings: GridSettings;
  draggedIcon: string | null;
}

interface DesktopActions {
  addIcon: (icon: DesktopIcon) => void;
  removeIcon: (id: string) => void;
  updateIcon: (id: string, updates: Partial<DesktopIcon>) => void;
  updateIconPosition: (id: string, position: { x: number; y: number }) => void;
  selectIcon: (id: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  selectMultiple: (ids: string[]) => void;
  toggleGridMode: () => void;
  updateGridSettings: (settings: Partial<GridSettings>) => void;
  snapIconToGrid: (id: string) => void;
  snapAllToGrid: () => void;
  setDraggedIcon: (id: string | null) => void;
  removeSelectedIcons: () => void;
  moveSelectedIcons: (deltaX: number, deltaY: number) => void;
}

type DesktopStore = DesktopState & DesktopActions;

export const useIconStore = create<DesktopStore>()(
  subscribeWithSelector((set, get) => ({
    icons: [],
    selectedIcons: [],
    gridSettings: {
      enabled: true,
      cellWidth: 70,
      cellHeight: 70,
      padding: 4,
      cols: 15,
      rows: 11
    },
    draggedIcon: null,

    addIcon: (icon) => set((state) => ({
      icons: [...state.icons, icon]
    })),

    removeIcon: (id) => set((state) => ({
      icons: state.icons.filter(icon => icon.id !== id),
      selectedIcons: state.selectedIcons.filter(selectedId => selectedId !== id)
    })),

    updateIcon: (id, updates) => set((state) => ({
      icons: state.icons.map(icon =>
        icon.id === id ? { ...icon, ...updates } : icon
      )
    })),

    updateIconPosition: (id, position) => set((state) => {
      const { gridSettings } = state;
      const gridPosition = gridSettings.enabled ? {
        row: Math.floor(position.y / (gridSettings.cellHeight + gridSettings.padding)),
        col: Math.floor(position.x / (gridSettings.cellWidth + gridSettings.padding))
      } : undefined;

      return {
        icons: state.icons.map(icon =>
          icon.id === id
            ? { ...icon, position, gridPosition }
            : icon
        )
      };
    }),

    selectIcon: (id, multiSelect = false) => set((state) => {
      if (multiSelect) {
        const isSelected = state.selectedIcons.includes(id);
        return {
          selectedIcons: isSelected
            ? state.selectedIcons.filter(selectedId => selectedId !== id)
            : [...state.selectedIcons, id]
        };
      }
      return { selectedIcons: [id] };
    }),

    clearSelection: () => set({ selectedIcons: [] }),

    selectMultiple: (ids) => set({ selectedIcons: ids }),

    toggleGridMode: () => set((state) => ({
      gridSettings: { ...state.gridSettings, enabled: !state.gridSettings.enabled }
    })),

    updateGridSettings: (settings) => set((state) => ({
      gridSettings: { ...state.gridSettings, ...settings }
    })),

    snapIconToGrid: (id) => set((state) => {
      const icon = state.icons.find(i => i.id === id);
      if (!icon || !state.gridSettings.enabled) return state;

      const { gridSettings } = state;
      const gridX = (icon.gridPosition?.col || 0) * (gridSettings.cellWidth + gridSettings.padding);
      const gridY = (icon.gridPosition?.row || 0) * (gridSettings.cellHeight + gridSettings.padding);

      return {
        icons: state.icons.map(i =>
          i.id === id
            ? { ...i, position: { x: gridX, y: gridY } }
            : i
        )
      };
    }),

    snapAllToGrid: () => set((state) => {
      if (!state.gridSettings.enabled) return state;

      const { gridSettings } = state;
      return {
        icons: state.icons.map(icon => {
          const gridX = (icon.gridPosition?.col || 0) * (gridSettings.cellWidth + gridSettings.padding);
          const gridY = (icon.gridPosition?.row || 0) * (gridSettings.cellHeight + gridSettings.padding);
          return { ...icon, position: { x: gridX, y: gridY } };
        })
      };
    }),

    setDraggedIcon: (id) => set({ draggedIcon: id }),

    removeSelectedIcons: () => set((state) => ({
      icons: state.icons.filter(icon => !state.selectedIcons.includes(icon.id)),
      selectedIcons: []
    })),

    moveSelectedIcons: (deltaX, deltaY) => set((state) => ({
      icons: state.icons.map(icon =>
        state.selectedIcons.includes(icon.id)
          ? {
            ...icon,
            position: {
              x: icon.position.x + deltaX,
              y: icon.position.y + deltaY
            }
          }
          : icon
      )
    }))
  }))
);
