import { CoreAPI } from '@nameless-os/sdk';

export function initFirstErrorTerminalAchievement(systemApi: CoreAPI) {
  systemApi.achievement.registerAchievement({
    id: 'terminal_first_error',
    name: 'First Mistake',
    description: 'Made your first command error - everyone starts somewhere!',
    icon: 'assets/images/icons/terminal.svg',
    category: 'app',
    rarity: 'common',
    type: 'conditional',
    condition: {
      target: 1,
      type: 'event',
    },
    points: 5,
    hidden: false
  });
}