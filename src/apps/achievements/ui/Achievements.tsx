import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrophy, faStar, faLock, faCalendar, faBolt, faAward,
  faFilter, faSearch, faChartBar, faDownload,
  faUpload, faRotateLeft, faShield, faGamepad, faUsers, faGem,
  faChevronDown, faCube
} from '@fortawesome/free-solid-svg-icons';
import {
  AchievementAPI,
  AchievementDefinition,
  AchievementProgress,
  AchievementStats,
  AchievementCategory,
  AchievementRarity
} from '@nameless-os/sdk';
import { useTranslation } from 'react-i18next';
import styles from './achievements.module.css';

interface Props {
  achievementApi: AchievementAPI;
}

const Achievements: React.FC<Props> = ({ achievementApi }) => {
  const [achievements, setAchievements] = useState<AchievementDefinition[]>([]);
  const [progress, setProgress] = useState<AchievementProgress[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [selectedApp, setSelectedApp] = useState('all');
  const [showHidden] = useState(true);
  const [activeTab, setActiveTab] = useState<'achievements' | 'stats'>('achievements');
  const [showFilters, setShowFilters] = useState(false);

  const { t } = useTranslation('achievements');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setAchievements(achievementApi.getAllAchievements());
    setProgress(achievementApi.getAllProgress());
    setStats(achievementApi.getStats());
  };

  const progressMap = useMemo(() => {
    const map = new Map<string, AchievementProgress>();
    progress.forEach(p => map.set(p.id, p));
    return map;
  }, [progress]);

  const availableApps = useMemo(() => {
    const apps = new Set<string>();
    achievements.forEach(achievement => {
      if (achievement.appId) {
        apps.add(achievement.appId);
      }
    });
    return Array.from(apps).sort();
  }, [achievements]);

  const getRarityColor = (rarity: AchievementRarity): string => {
    switch (rarity) {
      case 'common': return '#6b7280';
      case 'uncommon': return '#10b981';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (category: AchievementCategory) => {
    switch (category) {
      case 'system': return faShield;
      case 'app': return faGamepad;
      case 'cross-app': return faUsers;
      case 'hidden': return faLock;
      default: return faAward;
    }
  };

  const getRarityIcon = (rarity: AchievementRarity) => {
    switch (rarity) {
      case 'common': return faAward;
      case 'uncommon': return faAward;
      case 'rare': return faStar;
      case 'epic': return faBolt;
      case 'legendary': return faBolt;
      default: return faAward;
    }
  };

  const getCategoryLabel = (category: AchievementCategory): string => {
    switch (category) {
      case 'cross-app': return t('Cross-Applications');
      case 'system': return t('System');
      case 'app': return t('Applications');
      case 'hidden': return t('Hidden');
      default: return t('Unknown');
    }
  };

  const getRarityLabel = (rarity: AchievementRarity): string => {
    switch (rarity) {
      case 'common': return t('Common');
      case 'uncommon': return t('Uncommon');
      case 'rare': return t('Rare');
      case 'epic': return t('Epic');
      case 'legendary': return t('Legendary');
      default: return t('Unknown');
    }
  };

  const filteredAchievements = useMemo(() => {
    return achievements.filter(achievement => {
      const achievementProgress = progressMap.get(achievement.id);

      if (achievement.hidden && !showHidden && !achievementProgress?.completed) {
        return false;
      }

      if (selectedCategory !== 'all' && achievement.category !== selectedCategory) {
        return false;
      }

      if (selectedRarity !== 'all' && achievement.rarity !== selectedRarity) {
        return false;
      }

      if (selectedApp !== 'all' && achievement.appId !== selectedApp) {
        return false;
      }

      return !(searchQuery && !achievement.name.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [achievements, progressMap, showHidden, selectedCategory, selectedRarity, selectedApp, searchQuery]);

  const handleExportProgress = async () => {
    try {
      const data = await achievementApi.exportProgress();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'achievements-progress.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(t('Export Error'), error);
    }
  };

  const handleImportProgress = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          await achievementApi.importProgress(text);
          loadData();
        } catch (error) {
          console.error(t('Import Error'), error);
        }
      }
    };
    input.click();
  };

  const handleResetAllProgress = () => {
    if (confirm(t('Reset Progress Confirmation'))) {
      achievementApi.resetAllProgress();
      loadData();
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedRarity('all');
    setSelectedApp('all');
  };

  const activeFiltersCount = [
    selectedCategory !== 'all',
    selectedRarity !== 'all',
    selectedApp !== 'all',
    searchQuery.length > 0
  ].filter(Boolean).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'achievements' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            <FontAwesomeIcon icon={faTrophy} style={{ marginRight: '5px' }} />
            {t('Achievements')}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'stats' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <FontAwesomeIcon icon={faChartBar} style={{ marginRight: '5px' }} />
            {t('Statistics')}
          </button>
        </div>
        {activeTab === 'achievements' && (
          <>
            <div className={styles.mainControls}>
              <div className={styles.searchContainer}>
                <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder={t('Search Achievements')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <div className={styles.compactControls}>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`${styles.button} ${showFilters ? styles.filterToggleActive : styles.filterToggle}`}
                >
                  <FontAwesomeIcon icon={faFilter} />
                  {t('Filters')}
                  {activeFiltersCount > 0 && (
                    <span className={styles.badge}>{activeFiltersCount}</span>
                  )}
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`${styles.chevronIcon} ${showFilters ? styles.chevronIconRotated : ''}`}
                  />
                </button>
                <button
                  onClick={handleExportProgress}
                  className={styles.button}
                  title={t('Export Progress')}
                >
                  <FontAwesomeIcon icon={faDownload} />
                </button>
                <button
                  onClick={handleImportProgress}
                  className={styles.button}
                  title={t('Import Progress')}
                >
                  <FontAwesomeIcon icon={faUpload} />
                </button>
                <button
                  onClick={handleResetAllProgress}
                  className={styles.button}
                  title={t('Reset Progress')}
                >
                  <FontAwesomeIcon icon={faRotateLeft} />
                </button>
              </div>
            </div>
            <div className={showFilters ? styles.filtersRow : styles.filtersRowHidden}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.select}
              >
                <option value="all">{t('All Categories')}</option>
                <option value="system">{t('System')}</option>
                <option value="app">{t('Applications')}</option>
                <option value="cross-app">{t('Cross-Applications')}</option>
                <option value="hidden">{t('Hidden')}</option>
              </select>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className={styles.select}
              >
                <option value="all">{t('All Rarities')}</option>
                <option value="common">{t('Common')}</option>
                <option value="uncommon">{t('Uncommon')}</option>
                <option value="rare">{t('Rare')}</option>
                <option value="epic">{t('Epic')}</option>
                <option value="legendary">{t('Legendary')}</option>
              </select>
              {availableApps.length > 0 && (
                <select
                  value={selectedApp}
                  onChange={(e) => setSelectedApp(e.target.value)}
                  className={styles.select}
                >
                  <option value="all">{t('All Applications')}</option>
                  {availableApps.map(app => (
                    <option key={app} value={app}>{app}</option>
                  ))}
                </select>
              )}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className={`${styles.button} ${styles.buttonSecondary}`}
                >
                  {t('Clear Filters')}
                </button>
              )}
              <div className={styles.resultsCount}>
                {t('Found')}: {filteredAchievements.length} {t('of')} {achievements.length}
              </div>
            </div>
          </>
        )}
      </div>
      <div className={styles.content}>
        {activeTab === 'achievements' && (
          <div className={styles.achievementGrid}>
            {filteredAchievements.map((achievement) => {
              const achievementProgress = progressMap.get(achievement.id);
              const isUnlocked = achievementProgress?.completed || false;
              const progressPercent = achievementProgress
                ? (achievementProgress.current / achievementProgress.target) * 100
                : 0;

              const isHidden = achievement.hidden && !isUnlocked;

              return (
                <div
                  key={achievement.id}
                  className={`${styles.achievementCard} ${
                    isUnlocked ? styles.achievementCardUnlocked : ''
                  } ${isHidden ? styles.achievementCardHidden : ''}`}
                >
                  <div className={styles.achievementHeader}>
                    <div
                      className={`${styles.achievementIcon} ${
                        isUnlocked ? styles.achievementIconUnlocked : styles.achievementIconLocked
                      }`}
                      style={{ backgroundColor: getRarityColor(achievement.rarity) }}
                    >
                      {achievement.icon ? (
                        <img
                          src={achievement.icon}
                          alt=""
                          style={{ width: '24px', height: '24px' }}
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={isHidden ? faLock : getRarityIcon(achievement.rarity)}
                          color="white"
                        />
                      )}
                    </div>
                    <div className={styles.achievementInfo}>
                      <h3 className={styles.achievementName}>
                        {isHidden ? '???' : achievement.name}
                      </h3>
                      <p className={styles.achievementDescription}>
                        {isHidden ? t('Hidden Achievement') : achievement.description}
                      </p>
                      {achievement.appId && (
                        <p className={styles.achievementAppId}>
                          <FontAwesomeIcon icon={faCube} />
                          {achievement.appId}
                        </p>
                      )}
                    </div>
                    <div className={styles.achievementPoints}>
                      {achievement.points} {t('points')}
                    </div>
                  </div>
                  {!isHidden && achievementProgress && achievement.type !== 'event' && (
                    <div className={styles.progressContainer}>
                      <div className={styles.progressBar}>
                        <div
                          className={`${styles.progressFill} ${
                            isUnlocked ? styles.progressFillComplete : styles.progressFillIncomplete
                          }`}
                          style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        />
                      </div>
                      <div className={styles.progressText}>
                        {achievementProgress.current} / {achievementProgress.target}
                      </div>
                    </div>
                  )}
                  <div className={styles.achievementMeta}>
                    <div className={styles.achievementMetaLeft}>
                      <FontAwesomeIcon icon={getCategoryIcon(achievement.category)} />
                      <span>{getCategoryLabel(achievement.category)}</span>
                      <FontAwesomeIcon
                        icon={getRarityIcon(achievement.rarity)}
                        color={getRarityColor(achievement.rarity)}
                      />
                      <span style={{ color: getRarityColor(achievement.rarity) }}>
                        {getRarityLabel(achievement.rarity)}
                      </span>
                    </div>
                    {isUnlocked && achievementProgress?.unlockedAt && (
                      <div className={styles.achievementMetaRight}>
                        <FontAwesomeIcon icon={faCalendar} />
                        {formatDate(achievementProgress.unlockedAt)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {activeTab === 'stats' && stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3 className={styles.statTitle}>
                <FontAwesomeIcon icon={faTrophy} />
                {t('Overall Statistics')}
              </h3>
              <div className={styles.statItem}>
                <span>{t('Total Achievements')}:</span>
                <span>{stats.totalAchievements}</span>
              </div>
              <div className={styles.statItem}>
                <span>{t('Unlocked Achievements')}:</span>
                <span>{stats.unlockedAchievements}</span>
              </div>
              <div className={styles.statItem}>
                <span>{t('Completion Percentage')}:</span>
                <span>{((stats.unlockedAchievements / stats.totalAchievements) * 100).toFixed(1)}%</span>
              </div>
              <div className={`${styles.statItem} ${styles.statItemLast}`}>
                <span>{t('Total Points')}:</span>
                <span>{stats.totalPoints}</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <h3 className={styles.statTitle}>
                <FontAwesomeIcon icon={faFilter} />
                {t('By Category')}
              </h3>
              {Object.entries(stats.categoriesStats).map(([category, stat]) => (
                <div key={category} className={styles.statItem}>
                  <div className={styles.statItemLeft}>
                    <FontAwesomeIcon icon={getCategoryIcon(category as AchievementCategory)} />
                    {getCategoryLabel(category as AchievementCategory)}
                  </div>
                  <span>{stat.unlocked} / {stat.total}</span>
                </div>
              ))}
            </div>
            <div className={styles.statCard}>
              <h3 className={styles.statTitle}>
                <FontAwesomeIcon icon={faGem} />
                {t('By Rarity')}
              </h3>
              {Object.entries(stats.rarityStats).map(([rarity, stat]) => (
                <div key={rarity} className={styles.statItem}>
                  <div className={styles.statItemLeft}>
                    <FontAwesomeIcon
                      icon={getRarityIcon(rarity as AchievementRarity)}
                      color={getRarityColor(rarity as AchievementRarity)}
                    />
                    <span style={{ color: getRarityColor(rarity as AchievementRarity) }}>
                      {getRarityLabel(rarity as AchievementRarity)}
                    </span>
                  </div>
                  <span>{stat.unlocked} / {stat.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { Achievements };