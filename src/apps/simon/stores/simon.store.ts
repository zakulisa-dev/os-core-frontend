import { create } from 'zustand';
import { SimonStatus } from '@Simon/enums/simonStatus.enum';
import { generatePattern, regeneratePattern, updatePattern } from '@Simon/logic';
import { SimonDifficulty as Difficulty } from '@Simon/enums/simonDifficulty.enum';
import { AppInstanceId } from '@nameless-os/sdk';

import simonSuccessSound from 'src/assets/sounds/simon/simonSuccess.wav';
import simonLoseSound from 'src/assets/sounds/simon/simonLoseSound.wav';

type SimonData = {
  difficulty: Difficulty;
  simonStatus: SimonStatus;
  level: number;
  move: number;
  pattern: number[];
};

type SimonStore = {
  simonsData: Record<AppInstanceId, SimonData>;

  get: (instanceId: AppInstanceId) => SimonData | undefined;
  init: (instanceId: AppInstanceId) => void;
  close: (instanceId: AppInstanceId) => void;

  changeDifficulty: (instanceId: AppInstanceId, difficulty: Difficulty) => void;
  updateStatus: (instanceId: AppInstanceId, status: SimonStatus) => void;
  startShowing: (instanceId: AppInstanceId) => void;
  simonClick: (instanceId: AppInstanceId, numberOfButton: number) => void;
  restartGame: (instanceId: AppInstanceId) => void;
};

export const useSimonStore = create<SimonStore>((set, get) => ({
  simonsData: {},

  get: (instanceId) => get().simonsData[instanceId],

  init: (instanceId) =>
    set((state) => {
      if (state.simonsData[instanceId]) return state;
      return {
        simonsData: {
          ...state.simonsData,
          [instanceId]: {
            difficulty: Difficulty.None,
            simonStatus: SimonStatus.Waiting,
            level: 1,
            move: 1,
            pattern: [],
          },
        },
      };
    }),

  close: (instanceId) =>
    set((state) => {
      const { [instanceId]: removed, ...rest } = state.simonsData;
      return {
        simonsData: rest,
      };
    }),

  changeDifficulty: (instanceId, difficulty) =>
    set((state) => {
      const simon = state.simonsData[instanceId];
      if (!simon) return state;

      return {
        simonsData: {
          ...state.simonsData,
          [instanceId]: {
            ...simon,
            difficulty,
            level: 1,
            move: 1,
            pattern: [],
            simonStatus: SimonStatus.Waiting,
          },
        },
      };
    }),

  updateStatus: (instanceId, status) =>
    set((state) => {
      const simon = state.simonsData[instanceId];
      if (!simon) return state;

      return {
        simonsData: {
          ...state.simonsData,
          [instanceId]: {
            ...simon,
            simonStatus: status,
          },
        },
      };
    }),

  startShowing: (instanceId) =>
    set((state) => {
      const simon = state.simonsData[instanceId];
      if (!simon) return state;

      let newPattern: number[];

      if (simon.level === 1) {
        if (simon.difficulty === Difficulty.Easy || simon.difficulty === Difficulty.Medium) {
          newPattern = generatePattern(4);
        } else {
          newPattern = generatePattern(9);
        }
      } else if (simon.difficulty === Difficulty.Easy) {
        newPattern = updatePattern(simon.pattern, 4);
      } else if (simon.difficulty === Difficulty.Medium) {
        newPattern = regeneratePattern(3 + (simon.level - 1), 4);
      } else if (simon.difficulty === Difficulty.Hard) {
        newPattern = updatePattern(simon.pattern, 9);
      } else {
        newPattern = regeneratePattern(3 + (simon.level - 1), 9);
      }

      return {
        simonsData: {
          ...state.simonsData,
          [instanceId]: {
            ...simon,
            pattern: newPattern,
          },
        },
      };
    }),

  simonClick: (instanceId, numberOfButton) =>
    set((state) => {
      const simon = state.simonsData[instanceId];
      if (!simon) return state;

      if (simon.pattern[simon.move - 1] !== numberOfButton) {
        new Audio(simonLoseSound).play();
        return {
          simonsData: {
            ...state.simonsData,
            [instanceId]: {
              ...simon,
              simonStatus: SimonStatus.Losed,
            },
          },
        };
      } else {
        const newMove = simon.move + 1;

        if (newMove === simon.pattern.length + 1) {
          const audio = new Audio(simonSuccessSound);
          audio.play();

          return {
            simonsData: {
              ...state.simonsData,
              [instanceId]: {
                ...simon,
                move: 1,
                level: simon.level + 1,
                simonStatus: SimonStatus.Showing,
              },
            },
          };
        } else {
          return {
            simonsData: {
              ...state.simonsData,
              [instanceId]: {
                ...simon,
                move: newMove,
              },
            },
          };
        }
      }
    }),

  restartGame: (instanceId) =>
    set((state) => {
      const simon = state.simonsData[instanceId];
      if (!simon) return state;

      return {
        simonsData: {
          ...state.simonsData,
          [instanceId]: {
            ...simon,
            level: 1,
            move: 1,
            pattern: [],
            simonStatus: SimonStatus.Showing,
          },
        },
      };
    }),
}));