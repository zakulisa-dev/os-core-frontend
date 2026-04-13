import { Nullable } from '@nameless-os/sdk';

enum FortuneCategory {
  Programming = 'programming',
  Productivity = 'productivity',
  Debugging = 'debugging',
  Workflow = 'workflow',
  Success = 'success',
  Wisdom = 'wisdom',
  Motivational = 'motivational',
  All = 'all',
}

enum FortuneMood {
  Happy = 'happy',
  Motivated = 'motivated',
  Stressed = 'stressed',
  Tired = 'tired',
  Focused = 'focused',
  Creative = 'creative'
}

interface FortuneHistory {
  shown: Set<string>;
  dailyCount: number;
  lastDate: Nullable<string>;
  favorites: Set<string>;
  stats: {
    totalShown: number;
    byCategory: Record<FortuneCategory, number>;
  };
}

export { FortuneCategory, FortuneMood };
export type { FortuneHistory };
