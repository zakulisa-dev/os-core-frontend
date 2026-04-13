import { AchievementProgress, AchievementStats, FileSystemAPI, Nullable } from '@nameless-os/sdk';
import {
  ACHIEVEMENT_BACKUP_DIR,
  ACHIEVEMENT_DIR, ACHIEVEMENT_MAX_BACKUPS,
  ACHIEVEMENT_PROGRESS_FILE,
  ACHIEVEMENT_STATS_FILE,
} from './achievement.config';

interface SavedProgressData {
  progress: [string, AchievementProgress][];
  lastSaved: string;
  version: string;
}

export class AchievementStorage {
  private readonly fileSystem: FileSystemAPI;

  constructor(fileSystem: FileSystemAPI) {
    this.fileSystem = fileSystem;
    this.initStorage();
  }

  private async initStorage(): Promise<void> {
    try {
      await this.ensureDirectory(ACHIEVEMENT_DIR);
      await this.ensureDirectory(`${ACHIEVEMENT_DIR}/${ACHIEVEMENT_BACKUP_DIR}`);
    } catch (error) {
      console.error('Failed to initialize achievement storage:', error);
    }
  }

  private async ensureDirectory(path: string): Promise<void> {
    try {
      await this.fileSystem.stat(path);
    } catch {
      await this.fileSystem.mkdir(path, { recursive: true });
    }
  }

  private isValidAchievementProgress(obj: unknown): obj is AchievementProgress {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      'id' in obj &&
      'current' in obj &&
      'target' in obj &&
      'completed' in obj &&
      typeof (obj as Record<string, unknown>).current === 'number' &&
      typeof (obj as Record<string, unknown>).target === 'number' &&
      typeof (obj as Record<string, unknown>).completed === 'boolean' &&
      (
        !('unlockedAt' in obj) ||
        (obj as Record<string, unknown>).unlockedAt === undefined ||
        (obj as Record<string, unknown>).unlockedAt instanceof Date ||
        typeof (obj as Record<string, unknown>).unlockedAt === 'string'
      ) &&
      (
        !('firstProgressAt' in obj) ||
        (obj as Record<string, unknown>).firstProgressAt === undefined ||
        (obj as Record<string, unknown>).firstProgressAt instanceof Date ||
        typeof (obj as Record<string, unknown>).firstProgressAt === 'string'
      )
    );
  }

  private isValidProgressEntry(entry: unknown): entry is [string, AchievementProgress] {
    return (
      Array.isArray(entry) &&
      entry.length === 2 &&
      typeof entry[0] === 'string' &&
      this.isValidAchievementProgress(entry[1])
    );
  }

  private isValidSavedProgressData(obj: unknown): obj is SavedProgressData {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      'version' in obj &&
      'lastSaved' in obj &&
      'progress' in obj &&
      typeof (obj as Record<string, unknown>).version === 'string' &&
      typeof (obj as Record<string, unknown>).lastSaved === 'string' &&
      Array.isArray((obj as Record<string, unknown>).progress) &&
      ((obj as Record<string, unknown>).progress as unknown[]).every((entry: unknown) => this.isValidProgressEntry(entry))
    );
  }

  private parseAchievementProgress(data: unknown): AchievementProgress {
    if (!this.isValidAchievementProgress(data)) {
      throw new Error('Invalid achievement progress data structure');
    }

    const parsed = { ...data } as AchievementProgress;

    if (parsed.unlockedAt && typeof parsed.unlockedAt === 'string') {
      const date = new Date(parsed.unlockedAt);
      if (!isNaN(date.getTime())) {
        parsed.unlockedAt = date;
      } else {
        delete parsed.unlockedAt;
      }
    }

    if (parsed.firstProgressAt && typeof parsed.firstProgressAt === 'string') {
      const date = new Date(parsed.firstProgressAt);
      if (!isNaN(date.getTime())) {
        parsed.firstProgressAt = date;
      } else {
        delete parsed.firstProgressAt;
      }
    }

    return parsed;
  }

  async saveProgress(progress: Map<string, AchievementProgress>): Promise<void> {
    const data: SavedProgressData = {
      progress: Array.from(progress.entries()),
      lastSaved: new Date().toISOString(),
      version: '1.0'
    };

    try {
      await this.createBackup();

      const filePath = `${ACHIEVEMENT_DIR}/${ACHIEVEMENT_PROGRESS_FILE}`;
      await this.fileSystem.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save achievement progress:', error);
      try {
        localStorage.setItem('achievements_progress_backup', JSON.stringify(data));
      } catch (storageError) {
        console.error('Failed to save to localStorage backup:', storageError);
      }
    }
  }

  async loadProgress(): Promise<Map<string, AchievementProgress>> {
    try {
      const filePath = `${ACHIEVEMENT_DIR}/${ACHIEVEMENT_PROGRESS_FILE}`;
      const fileContent = await this.fileSystem.readFile(filePath);

      let rawData: unknown;
      try {
        rawData = JSON.parse(fileContent);
      } catch (parseError) {
        throw new Error(`Invalid JSON in progress file: ${parseError}`);
      }

      if (rawData && typeof rawData === 'object' && !('version' in rawData)) {
        return this.migrateOldProgress(rawData as SavedProgressData);
      }

      if (!this.isValidSavedProgressData(rawData)) {
        throw new Error('Invalid progress data structure');
      }

      const lastSavedDate = new Date(rawData.lastSaved);
      if (isNaN(lastSavedDate.getTime())) {
        console.warn('Invalid lastSaved date in progress file');
      }

      const progressMap = new Map<string, AchievementProgress>();

      for (const [id, progressData] of rawData.progress) {
        try {
          const validatedProgress = this.parseAchievementProgress(progressData);
          progressMap.set(id, validatedProgress);
        } catch (error) {
          console.warn(`Skipping invalid progress entry for ${id}:`, error);
        }
      }

      return progressMap;

    } catch (error) {
      console.warn('Failed to load from fs, trying localStorage backup:', error);

      try {
        const backupData = localStorage.getItem('achievements_progress_backup');
        if (backupData) {
          let parsed: unknown;
          try {
            parsed = JSON.parse(backupData);
          } catch (parseError) {
            throw new Error('Invalid JSON in localStorage backup');
          }

          if (!this.isValidSavedProgressData(parsed)) {
            throw new Error('Invalid backup data structure');
          }

          const progressMap = new Map<string, AchievementProgress>();

          for (const [id, progressData] of parsed.progress) {
            try {
              const validatedProgress = this.parseAchievementProgress(progressData);
              progressMap.set(id, validatedProgress);
            } catch (error) {
              console.warn(`Skipping invalid backup entry for ${id}:`, error);
            }
          }

          return progressMap;
        }
      } catch (storageError) {
        console.error('Failed to load from localStorage backup:', storageError);
      }

      return new Map();
    }
  }

  private async createBackup(): Promise<void> {
    try {
      const progressFile = `${ACHIEVEMENT_DIR}/${ACHIEVEMENT_PROGRESS_FILE}`;

      try {
        await this.fileSystem.stat(progressFile);
      } catch {
        return;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `${ACHIEVEMENT_DIR}/${ACHIEVEMENT_BACKUP_DIR}/progress_${timestamp}.json`;

      const currentData = await this.fileSystem.readFile(progressFile);
      await this.fileSystem.writeFile(backupPath, currentData);

      await this.cleanupOldBackups();
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const backupDir = `${ACHIEVEMENT_DIR}/${ACHIEVEMENT_BACKUP_DIR}`;
      const files = await this.fileSystem.readDir(backupDir);

      const backupFiles = files
        .filter(file => file.name.startsWith('progress_') && file.name.endsWith('.json'))
        .sort()
        .reverse();

      for (let i = ACHIEVEMENT_MAX_BACKUPS; i < backupFiles.length; i++) {
        await this.fileSystem.delete(`${backupDir}/${backupFiles[i].name}`);
      }
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
    }
  }

  async exportProgress(progress: Map<string, AchievementProgress>): Promise<string> {
    const exportData = {
      progress: Array.from(progress.entries()),
      exportedAt: new Date().toISOString(),
      version: '0.3',
      platform: 'nameless-os'
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportPath = `${ACHIEVEMENT_DIR}/export_${timestamp}.json`;

    try {
      await this.fileSystem.writeFile(exportPath, JSON.stringify(exportData, null, 2));
      console.log(`Progress exported to: ${exportPath}`);
    } catch (error) {
      console.error('Failed to save export file:', error);
    }

    return JSON.stringify(exportData, null, 2);
  }

  async importProgress(data: string): Promise<Map<string, AchievementProgress>> {
    try {
      const parsed: unknown = JSON.parse(data);

      if (!parsed || typeof parsed !== 'object' || !('progress' in parsed) || !Array.isArray((parsed as Record<string, unknown>).progress)) {
        throw new Error('Invalid import data format');
      }

      const progressArray = (parsed as Record<string, unknown>).progress as unknown[];
      const validatedProgress = new Map<string, AchievementProgress>();

      for (const entry of progressArray) {
        if (this.isValidProgressEntry(entry)) {
          const [id, progressData] = entry;
          try {
            const validatedProgressData = this.parseAchievementProgress(progressData);
            validatedProgress.set(id, validatedProgressData);
          } catch (error) {
            console.warn(`Skipping invalid imported progress entry for ${id}:`, error);
          }
        }
      }

      return validatedProgress;
    } catch (error) {
      console.error('Failed to import progress:', error);
      throw error;
    }
  }

  async saveStats(stats: AchievementStats): Promise<void> {
    try {
      const statsData = {
        ...stats,
        lastUpdated: new Date().toISOString()
      };

      const statsPath = `${ACHIEVEMENT_DIR}/${ACHIEVEMENT_STATS_FILE}`;
      await this.fileSystem.writeFile(statsPath, JSON.stringify(statsData, null, 2));
    } catch (error) {
      console.error('Failed to save achievement stats:', error);
    }
  }

  async loadStats(): Promise<Nullable<AchievementStats>> {
    try {
      const statsPath = `${ACHIEVEMENT_DIR}/${ACHIEVEMENT_STATS_FILE}`;
      const fileContent = await this.fileSystem.readFile(statsPath);
      return JSON.parse(fileContent);
    } catch (error) {
      console.warn('Failed to load achievement stats:', error);
      return null;
    }
  }

  private migrateOldProgress(oldData: SavedProgressData): Map<string, AchievementProgress> {
    if (oldData.progress) {
      return new Map(oldData.progress);
    }
    return new Map();
  }

  async getStorageInfo(): Promise<{
    totalSize: number;
    backupCount: number;
    lastBackup: Nullable<Date>;
  }> {
    try {
      const progressFile = `${ACHIEVEMENT_DIR}/${ACHIEVEMENT_PROGRESS_FILE}`;
      const backupDir = `${ACHIEVEMENT_DIR}/${ACHIEVEMENT_BACKUP_DIR}`;

      let totalSize = 0;
      let backupCount = 0;
      let lastBackup: Nullable<Date> = null;

      try {
        const stat = await this.fileSystem.stat(progressFile);
        totalSize += stat.size || 0;
      } catch {}

      try {
        const backupFiles = await this.fileSystem.readDir(backupDir);
        const progressBackups = backupFiles.filter(f => f.name.startsWith('progress_'));
        backupCount = progressBackups.length;

        if (progressBackups.length > 0) {
          const latestBackup = progressBackups.sort().pop();
          if (latestBackup) {
            const backupStat = await this.fileSystem.stat(`${backupDir}/${latestBackup.name}`);
            totalSize += backupStat.size || 0;
            const dateStr = latestBackup.name.replace('progress_', '').replace('.json', '');
            lastBackup = new Date(dateStr.replace(/-/g, ':'));
          }
        }
      } catch {}

      return { totalSize, backupCount, lastBackup };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { totalSize: 0, backupCount: 0, lastBackup: null };
    }
  }
}