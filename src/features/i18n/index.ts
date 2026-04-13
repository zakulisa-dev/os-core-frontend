import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English
import translationEN from '@Features/i18n/translations/en/translation.json';
import calculatorTranslationEn from '@Calculator/translations/en/calculatorTranslation.json';
import settingsTranslationEn from '@Settings/translations/settings.translation.en.json';
import simonTranslationEn from '@Simon/translations/en/simonTranslation.json';
import toDoTranslationEn from '@ToDo/translations/en/toDoTranslation.json';
import terminalTranslationEn from '@Apps/terminal/translations/en/terminalTranslation.json';
import authRedirectTranslationEn from '@Components/AuthAppRedirect/translations/en/authAppRedirectTranslation.json';
import welcomeTranslationEn from '@Components/Welcome/translations/en/welcomeTranslation.json';
import achievementsTranslationEn from '@Apps/achievements/translations/achievement.translation.en.json';

// Russian
import translationRU from '@Features/i18n/translations/ru/translation.json';
import calculatorTranslationRu from '@Calculator/translations/ru/calculatorTranslation.json';
import settingsTranslationRu from '@Settings/translations/settings.translation.ru.json';
import simonTranslationRu from '@Simon/translations/ru/simonTranslation.json';
import toDoTranslationRu from '@ToDo/translations/ru/toDoTranslation.json';
import terminalTranslationRu from '@Apps/terminal/translations/ru/terminalTranslation.json';
import authRedirectTranslationRu from '@Components/AuthAppRedirect/translations/ru/authAppRedirectTranslation.json';
import welcomeTranslationRu from '@Components/Welcome/translations/ru/welcomeTranslation.json';
import achievementsTranslationRu from '@Apps/achievements/translations/achievement.translation.ru.json';

// Korean
import settingsTranslationKo from '@Settings/translations/settings.translation.ko.json';
import achievementsTranslationKo from '@Apps/achievements/translations/achievement.translation.ko.json';

// Japanese
import settingsTranslationJa from '@Settings/translations/settings.translation.ja.json';
import achievementsTranslationJa from '@Apps/achievements/translations/achievement.translation.ja.json';

// Spanish
import settingsTranslationEs from '@Settings/translations/settings.translation.es.json';
import achievementsTranslationEs from '@Apps/achievements/translations/achievement.translation.es.json';

// Thai
import settingsTranslationTh from '@Settings/translations/settings.translation.th.json';
import achievementsTranslationTh from '@Apps/achievements/translations/achievement.translation.th.json';

// Vietnamese
import settingsTranslationVi from '@Settings/translations/settings.translation.vi.json';
import achievementsTranslationVi from '@Apps/achievements/translations/achievement.translation.vi.json';

import { Language } from '@Features/i18n/types/language';

i18n.use(initReactI18next).init({
  fallbackLng: Language.English,
  debug: false,
  detection: {
    order: ['localStorage', 'cookie'],
    cache: ['localStorage', 'cookie'],
  },
  interpolation: {
    escapeValue: false,
  },
  resources: {
    [Language.English]: {
      translation: translationEN,
      calculator: calculatorTranslationEn,
      settings: settingsTranslationEn,
      simon: simonTranslationEn,
      toDo: toDoTranslationEn,
      terminal: terminalTranslationEn,
      authRedirect: authRedirectTranslationEn,
      welcome: welcomeTranslationEn,
      achievements: achievementsTranslationEn,
    },
    [Language.Russian]: {
      translation: translationRU,
      calculator: calculatorTranslationRu,
      settings: settingsTranslationRu,
      simon: simonTranslationRu,
      toDo: toDoTranslationRu,
      terminal: terminalTranslationRu,
      authRedirect: authRedirectTranslationRu,
      welcome: welcomeTranslationRu,
      achievements: achievementsTranslationRu,
    },
    [Language.Korean]: {
      settings: settingsTranslationKo,
      achievements: achievementsTranslationKo,
    },
    [Language.Japanese]: {
      settings: settingsTranslationJa,
      achievements: achievementsTranslationJa,
    },
    [Language.Spanish]: {
      settings: settingsTranslationEs,
      achievements: achievementsTranslationEs,
    },
    [Language.Thai]: {
      settings: settingsTranslationTh,
      achievements: achievementsTranslationTh,
    },
    [Language.Vietnamese]: {
      settings: settingsTranslationVi,
      achievements: achievementsTranslationVi,
    },
  },
});

export default i18n;
