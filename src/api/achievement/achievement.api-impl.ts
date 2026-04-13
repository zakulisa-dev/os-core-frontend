import {
  AchievementAPI, AchievementCategory,
  AchievementDefinition, AchievementId,
  AchievementProgress, AchievementRarity, AchievementStats, AppId, EventBusAPI, FileSystemAPI, NotificationAPI,
  Nullable, SoundAPI,
  UnlockedAchievement,
} from '@nameless-os/sdk';
import { AchievementStorage } from './achievementStorage';
import {
  ACHIEVEMENT_PROGRESS_EVENT, ACHIEVEMENT_PROGRESS_IMPORTED_EVENT,
  ACHIEVEMENT_REGISTER_EVENT,
  ACHIEVEMENT_UNLOCK_EVENT,
  ACHIEVEMENT_UNLOCK_SOUND,
} from './achievement.constants';

export class AchievementApiImpl implements AchievementAPI {
  private storage: AchievementStorage;
  private achievements = new Map<string, AchievementDefinition>();
  private progress = new Map<string, AchievementProgress>();
  private unlockCallbacks: ((achievement: UnlockedAchievement) => void)[] = [];
  private progressCallbacks: ((progress: AchievementProgress) => void)[] = [];
  private readonly notificationApi: NotificationAPI;
  private readonly eventBus: EventBusAPI;
  private readonly soundApi: SoundAPI;

  constructor(notificationApi: NotificationAPI, eventBus: EventBusAPI, soundApi: SoundAPI, fileSystem: FileSystemAPI) {
    this.notificationApi = notificationApi;
    this.eventBus = eventBus;
    this.soundApi = soundApi;
    this.storage = new AchievementStorage(fileSystem);
    this.init();
  }

  private async init() {
    await this.loadProgress();
  }

  registerAchievement(achievement: AchievementDefinition): void {
    this.achievements.set(achievement.id, achievement);

    if (!this.progress.has(achievement.id)) {
      this.progress.set(achievement.id, {
        id: achievement.id,
        current: 0,
        target: achievement.condition.target || 1,
        completed: false
      });
    }

    this.eventBus.emit(ACHIEVEMENT_REGISTER_EVENT, {
      achievement,
      source: achievement.appId ? 'app' : 'system',
      appId: achievement.appId
    });
  }

  registerAchievements(achievements: AchievementDefinition[]): void {
    achievements.forEach(achievement => this.registerAchievement(achievement));
  }

  async updateProgress(achievementId: string, increment: number = 1): Promise<boolean> {
    const achievement = this.achievements.get(achievementId);
    const progress = this.progress.get(achievementId);

    if (!achievement || !progress || progress.completed) {
      return false;
    }

    const previousValue = progress.current;
    progress.current = Math.min(progress.current + increment, progress.target);

    if (!progress.firstProgressAt) {
      progress.firstProgressAt = new Date();
    }

    let unlocked = false;
    if (progress.current >= progress.target && !progress.completed) {
      unlocked = await this.unlockAchievement(achievementId);
    }

    this.progressCallbacks.forEach(callback => callback(progress));
    this.eventBus.emit(ACHIEVEMENT_PROGRESS_EVENT, {
      achievementId,
      progress,
      previousValue,
      increment
    });

    await this.saveProgress();
    return unlocked;
  }

  async setProgress(achievementId: string, value: number): Promise<boolean> {
    const progress = this.progress.get(achievementId);
    if (!progress) return false;

    const increment = value - progress.current;
    return this.updateProgress(achievementId, increment);
  }

  async checkCondition<T>(achievementId: string, data?: T): Promise<boolean> {
    const achievement = this.achievements.get(achievementId);
    const progress = this.progress.get(achievementId);

    if (!achievement || !progress || progress.completed) {
      return false;
    }

    if (achievement.prerequisite) {
      const allMet = achievement.prerequisite.every(prereqId => {
        const prereqProgress = this.progress.get(prereqId);
        return prereqProgress?.completed;
      });
      if (!allMet) return false;
    }

    let shouldUnlock = false;

    switch (achievement.condition.type) {
      case 'event':
        shouldUnlock = true;
        break;

      case 'custom':
        if (achievement.condition.customCheck) {
          shouldUnlock = achievement.condition.customCheck(data);
        }
        break;

      case 'count':
        shouldUnlock = progress.current >= progress.target;
        break;

      case 'time':
        break;
    }

    if (shouldUnlock) {
      return this.unlockAchievement(achievementId);
    }

    return false;
  }

  private async unlockAchievement(achievementId: string): Promise<boolean> {
    const achievement = this.achievements.get(achievementId);
    const progress = this.progress.get(achievementId);

    if (!achievement || !progress || progress.completed) {
      return false;
    }

    progress.completed = true;
    progress.unlockedAt = new Date();
    progress.current = progress.target;

    const unlockedAchievement: UnlockedAchievement = {
      achievement,
      unlockedAt: progress.unlockedAt,
      progress
    };

    this.showAchievementNotification(unlockedAchievement);

    this.soundApi.play(ACHIEVEMENT_UNLOCK_SOUND);

    this.unlockCallbacks.forEach(callback => callback(unlockedAchievement));
    this.eventBus.emit(ACHIEVEMENT_UNLOCK_EVENT, {
      achievement: unlockedAchievement,
      isFirstTime: true
    });

    await this.saveProgress();
    return true;
  }

  private showAchievementNotification(achievement: UnlockedAchievement) {
    const rarityEmojis = {
      common: '🏆',
      uncommon: '🥉',
      rare: '🥈',
      epic: '🥇',
      legendary: '👑'
    };

    this.notificationApi.notify(
       `${rarityEmojis[achievement.achievement.rarity]} Достижение получено!`, // TODO: add i18n
     `${achievement.achievement.name}\n${achievement.achievement.description}`,
    );
  }

  getAchievement(id: AchievementId): Nullable<AchievementDefinition> {
    return this.achievements.get(id) || null;
  }

  getAllAchievements(): AchievementDefinition[] {
    return Array.from(this.achievements.values());
  }

  getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[] {
    return this.getAllAchievements().filter(a => a.category === category);
  }

  getAchievementsByApp(appId: AppId): AchievementDefinition[] {
    return this.getAllAchievements().filter(a => a.appId === appId);
  }

  getProgress(achievementId: AchievementId): Nullable<AchievementProgress> {
    return this.progress.get(achievementId) || null;
  }

  getAllProgress(): AchievementProgress[] {
    return Array.from(this.progress.values());
  }

  getUnlockedAchievements(): UnlockedAchievement[] {
    return this.getAllProgress()
      .filter(achievement => achievement.completed)
      .map(achievement => ({
        achievement: this.achievements.get(achievement.id)!,
        unlockedAt: achievement.unlockedAt!,
        progress: achievement
      }));
  }

  getStats(): AchievementStats {
    const allAchievements = this.getAllAchievements();
    const unlockedCount = this.getAllProgress().filter(achievement => achievement.completed).length;
    const totalPoints = this.getUnlockedAchievements()
      .reduce((sum, achievement) => sum + achievement.achievement.points, 0);

    const categoriesStats = {} as Record<AchievementCategory, { total: number; unlocked: number; }>;
    const rarityStats = {} as Record<AchievementRarity, { total: number; unlocked: number; }>;

    (['system', 'app', 'cross-app', 'hidden'] as AchievementCategory[]).forEach(cat => {
      categoriesStats[cat] = { total: 0, unlocked: 0 };
    });

    (['common', 'uncommon', 'rare', 'epic', 'legendary'] as AchievementRarity[]).forEach(rarity => {
      rarityStats[rarity] = { total: 0, unlocked: 0 };
    });

    allAchievements.forEach(achievement => {
      categoriesStats[achievement.category].total++;
      rarityStats[achievement.rarity].total++;

      const progress = this.progress.get(achievement.id);
      if (progress?.completed) {
        categoriesStats[achievement.category].unlocked++;
        rarityStats[achievement.rarity].unlocked++;
      }
    });

    return {
      totalAchievements: allAchievements.length,
      unlockedAchievements: unlockedCount,
      totalPoints,
      categoriesStats,
      rarityStats
    };
  }

  onAchievementUnlocked(callback: (achievement: UnlockedAchievement) => void): () => void {
    this.unlockCallbacks.push(callback);
    return () => {
      const index = this.unlockCallbacks.indexOf(callback);
      if (index > -1) this.unlockCallbacks.splice(index, 1);
    };
  }

  onProgressUpdated(callback: (progress: AchievementProgress) => void): () => void {
    this.progressCallbacks.push(callback);
    return () => {
      const index = this.progressCallbacks.indexOf(callback);
      if (index > -1) this.progressCallbacks.splice(index, 1);
    };
  }

  resetProgress(achievementId: string): void {
    const progress = this.progress.get(achievementId);
    if (progress) {
      progress.current = 0;
      progress.completed = false;
      progress.unlockedAt = undefined;
      progress.firstProgressAt = undefined;
      this.saveProgress();
    }
  }

  resetAllProgress(): void {
    const resetProgress = new Map<string, AchievementProgress>();

    for (const [key, progress] of this.progress.entries()) {
      resetProgress.set(key, {
        ...progress,
        current: 0,
        completed: false,
        unlockedAt: undefined,
        firstProgressAt: undefined,
      });
    }

    this.progress = resetProgress;
    this.saveProgress();
  }

  async exportProgress(): Promise<string> {
    return this.storage.exportProgress(this.progress);
  }

  async importProgress(data: string): Promise<void> {
    try {
      this.progress = await this.storage.importProgress(data);
      await this.saveProgress();

      this.eventBus.emit(ACHIEVEMENT_PROGRESS_IMPORTED_EVENT, {
        importedCount: this.progress.size
      });
    } catch (error) {
      throw error;
    }
  }

  protected async saveProgress(): Promise<void> {
    await this.storage.saveProgress(this.progress);

    const stats = this.getStats();
    await this.storage.saveStats(stats);
  }

  protected async loadProgress(): Promise<void> {
    try {
      this.progress = await this.storage.loadProgress();
    } catch (error) {
      this.progress = new Map();
    }
  }

  async getStorageInfo() {
    return await this.storage.getStorageInfo();
  }
}