import { create } from 'zustand';
import { Background, Theme } from '@Features/settings/enums';
import { Language } from '@Features/i18n/types/language';
import i18n from 'i18next';

interface SettingsState {
  theme: Theme;
  language: Language;
  background: Background;
}

interface SettingsActions {
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setBackground: (background: Background) => void;

  resetToDefaults: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

const defaultSettings: SettingsState = {
  theme: Theme.Dark,
  language: Language.English,
  background: Background.Planet,
};

export const useSettingsStore = create<SettingsStore>()(
  (set, get) => ({
    ...defaultSettings,

    setTheme: (theme) =>
      set((state) => ({
        ...state,
        theme,
      })),

    setLanguage: (language) => {
      i18n.changeLanguage(language);
      return set((state) => ({
        ...state,
        language,
      }))
    },

    setBackground: (background) =>
      set((state) => ({
        ...state,
        background,
      })),

    resetToDefaults: () =>
      set(() => ({
        ...defaultSettings,
      })),
  }),
);

export const useTheme = () => useSettingsStore((state) => state.theme);
export const useLanguage = () => useSettingsStore((state) => state.language);
export const useBackground = () => useSettingsStore((state) => state.background);
