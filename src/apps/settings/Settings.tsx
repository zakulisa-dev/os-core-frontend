import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@Components/Button/Button';
import { Background, Theme } from '@Features/settings/enums';
import { Language } from '@Features/i18n/types/language';

const backgroundImages = Object.values(Background);
const themes = Object.values(Theme);
const languages = Object.values(Language);

import styles from './settings.module.css';
import { useBackground, useLanguage, useSettingsStore, useTheme } from '@Settings/stores/settings.store';
import { AppInstanceId } from '@nameless-os/sdk';
import { backgroundImagesAssets } from '@Constants/backgroundImages';

const Settings: FC<{ appId: AppInstanceId }> = React.memo(() => {
  const backgroundImage = useBackground();
  const language = useLanguage();
  const theme = useTheme();
  const { setTheme, setBackground, setLanguage } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'appearance' | 'system'>('appearance');

  const { t } = useTranslation('settings');

  function handleChangeBackground(selectedBackground: Background) {
    setBackground(selectedBackground);
  }

  function handleChangeLanguage(selectedLanguage: Language) {
    setLanguage(selectedLanguage);
  }

  function handleChangeTheme(selectedTheme: Theme) {
    setTheme(selectedTheme);
  }

  function resetSettings() {
    localStorage.clear();
    window.location.reload();
  }

  return (
    <div className={styles.settingsContainer}>
      {/* Навигация по табам */}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tab} ${activeTab === 'appearance' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('appearance')}
        >
          🎨 {t('appearance') || 'Внешний вид'}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'system' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('system')}
        >
          ⚙️ {t('system') || 'Система'}
        </button>
      </div>
      <div className={styles.tabContent}>
        {activeTab === 'appearance' && (
          <>
            {/* Секция обоев */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>{t('wallpaper') || 'Обои'}</h3>
              <div className={styles.wallpaperGrid}>
                {backgroundImages.map((bg) => (
                  <div
                    key={bg}
                    className={`${styles.wallpaperCard} ${backgroundImage === bg ? styles.selected : ''}`}
                    onClick={() => handleChangeBackground(bg)}
                  >
                    <div className={styles.wallpaperPreview} style={{ backgroundImage: `url(${backgroundImagesAssets[bg]})` }}>
                      {backgroundImage === bg && <div className={styles.checkmark}>✓</div>}
                    </div>
                    <span className={styles.wallpaperName}>{t(`backgrounds.${bg}`) || bg}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Секция темы */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>{t('theme') || 'Тема'}</h3>
              <div className={styles.themeOptions}>
                {themes.map((themeOption) => (
                  <div
                    key={themeOption}
                    className={`${styles.themeCard} ${theme === themeOption ? styles.selected : ''}`}
                    onClick={() => handleChangeTheme(themeOption)}
                  >
                    <div className={`${styles.themePreview} ${styles[`theme${themeOption}`]}`}>
                      <div className={`${styles.themeWindow} ${styles[`theme${themeOption}`]}`}></div>
                      <div className={`${styles.themeTaskbar} ${styles[`theme${themeOption}`]}`}></div>
                    </div>
                    <span className={styles.themeName}>{t(`themes.${themeOption}`) || themeOption}</span>
                    {theme === themeOption && <div className={styles.checkmark}>✓</div>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'system' && (
          <>
            {/* Секция языка */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>{t('language') || 'Язык'}</h3>
              <div className={styles.languageOptions}>
                {languages.map((lang) => (
                  <div
                    key={lang}
                    className={`${styles.languageCard} ${language === lang ? styles.selected : ''}`}
                    onClick={() => handleChangeLanguage(lang)}
                  >
                    <span className={styles.languageFlag}>
                      {lang === Language.English ? '🇺🇸' : lang === Language.Russian ? '🇷🇺' : '🌐'}
                    </span>
                    <span className={styles.languageName}>{t(`languages.${lang}`) || lang}</span>
                    {language === lang && <div className={styles.checkmark}>✓</div>}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>{t('system') || 'Система'}</h3>
              <div className={styles.dangerZone}>
                <div className={styles.resetInfo}>
                  <h4>{t('reset') || 'Сбросить настройки'}</h4>
                  <p>Все настройки будут сброшены до значений по умолчанию</p>
                </div>
                <Button className={styles.resetBtn} onClick={resetSettings}>
                  {t('reset') || 'Сбросить'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

Settings.displayName = 'Settings';

export { Settings };