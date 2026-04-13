import { create } from 'zustand';
import { Nullable } from '@nameless-os/sdk';

export type TerminalEntry = {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string;
  directory?: string;
  timestamp: number;
  groupId?: string;
};

interface TerminalPager {
  lines: string[];
  currentPage: number;
  pageSize: number;
}

type TerminalData = {
  entries: TerminalEntry[];
  inputHistory: string[];
  isInputInterceptorEnabled: boolean;
  autocompleteStep: number;
  pager: Nullable<TerminalPager>;
  currentDirectory: string;
};

type TerminalStore = {
  terminals: Record<string, TerminalData>;

  get: (appId: string) => TerminalData | undefined;
  init: (appId: string) => void;

  addCommand: (appId: string, command: string) => void;
  addOutput: (appId: string, content: string, type?: 'output' | 'error', groupId?: string) => void;

  updateGroup: (appId: string, groupId: string, newContent: string) => void;
  deleteGroup: (appId: string, groupId: string) => void;

  pushInputHistory: (appId: string, input: string) => void;

  resetAutocomplete: (appId: string) => void;
  incrementAutocomplete: (appId: string) => void;

  setInputInterceptor: (appId: string, value: boolean) => void;

  setPager: (appId: string, pager: Nullable<TerminalPager>) => void;

  getCurrentDirectory: (appId: string) => string;
  setCurrentDirectory: (appId: string, path: string) => void;

  clearHistory: (appId: string) => void;
};

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  terminals: {},

  get: (appId) => get().terminals[appId],

  init: (appId) =>
    set((state) => {
      if (state.terminals[appId]) return state;
      return {
        terminals: {
          ...state.terminals,
          [appId]: {
            entries: [],
            inputHistory: [],
            isInputInterceptorEnabled: false,
            autocompleteStep: 0,
            currentDirectory: '/home',
            pager: null,
          },
        },
      };
    }),

  addCommand: (appId, command) =>
    set((state) => {
      const terminal = state.terminals[appId];
      if (!terminal) return state;

      const entry: TerminalEntry = {
        id: crypto.randomUUID(),
        type: 'command',
        content: command,
        directory: terminal.currentDirectory,
        timestamp: Date.now(),
      };

      return {
        terminals: {
          ...state.terminals,
          [appId]: {
            ...terminal,
            entries: [...terminal.entries, entry],
          },
        },
      };
    }),

  addOutput: (appId, content, type = 'output', groupId) =>
    set((state) => {
      const terminal = state.terminals[appId];
      if (!terminal) return state;

      const entry: TerminalEntry = {
        id: crypto.randomUUID(),
        type,
        content,
        timestamp: Date.now(),
        groupId,
      };

      return {
        terminals: {
          ...state.terminals,
          [appId]: {
            ...terminal,
            entries: [...terminal.entries, entry],
          },
        },
      };
    }),

  updateGroup: (appId, groupId, newContent) =>
    set((state) => {
      const terminal = state.terminals[appId];
      if (!terminal) return state;

      const groupEntries = terminal.entries.filter(entry => entry.groupId === groupId);
      if (groupEntries.length === 0) return state;

      const entriesWithoutGroup = terminal.entries.filter(entry => entry.groupId !== groupId);

      const lines = newContent.split('\n');
      const newEntries = lines.map(line => ({
        id: crypto.randomUUID(),
        type: groupEntries[0].type,
        content: line,
        timestamp: Date.now(),
        groupId,
      }));

      return {
        terminals: {
          ...state.terminals,
          [appId]: {
            ...terminal,
            entries: [...entriesWithoutGroup, ...newEntries],
          },
        },
      };
    }),

  deleteGroup: (appId, groupId) =>
    set((state) => {
      const terminal = state.terminals[appId];
      if (!terminal) return state;

      return {
        terminals: {
          ...state.terminals,
          [appId]: {
            ...terminal,
            entries: terminal.entries.filter(entry => entry.groupId !== groupId),
          },
        },
      };
    }),

  pushInputHistory: (appId, input) =>
    set((state) => {
      const terminal = state.terminals[appId];
      if (!terminal) return state;
      return {
        terminals: {
          ...state.terminals,
          [appId]: {
            ...terminal,
            inputHistory: [...terminal.inputHistory, input],
          },
        },
      };
    }),

  resetAutocomplete: (appId) =>
    set((state) => {
      const terminal = state.terminals[appId];
      if (!terminal) return state;
      return {
        terminals: {
          ...state.terminals,
          [appId]: {
            ...terminal,
            autocompleteStep: 0,
          },
        },
      };
    }),

  incrementAutocomplete: (appId) =>
    set((state) => {
      const terminal = state.terminals[appId];
      if (!terminal) return state;
      return {
        terminals: {
          ...state.terminals,
          [appId]: {
            ...terminal,
            autocompleteStep: terminal.autocompleteStep + 1,
          },
        },
      };
    }),

  setInputInterceptor: (appId, value) =>
    set((state) => {
      const terminal = state.terminals[appId];
      if (!terminal) return state;
      return {
        terminals: {
          ...state.terminals,
          [appId]: {
            ...terminal,
            isInputInterceptorEnabled: value,
          },
        },
      };
    }),

  setPager: (appId, pager) =>
    set((state) => {
      const terminal = state.terminals[appId];
      if (!terminal) return state;
      return {
        terminals: {
          ...state.terminals,
          [appId]: {
            ...terminal,
            pager,
          },
        },
      };
    }),

  getCurrentDirectory: (appId) => {
    const terminal = get().terminals[appId];
    return terminal?.currentDirectory || '/home';
  },

  setCurrentDirectory: (appId, path) =>
    set((state) => {
      const terminal = state.terminals[appId];
      if (!terminal) return state;
      return {
        terminals: {
          ...state.terminals,
          [appId]: {
            ...terminal,
            currentDirectory: path,
          },
        },
      };
    }),

  clearHistory: (appId) =>
    set((state) => {
      const terminal = state.terminals[appId];
      if (!terminal) return state;
      return {
        terminals: {
          ...state.terminals,
          [appId]: {
            ...terminal,
            entries: [],
          },
        },
      };
    }),
}));