import { CoreAPI } from '@nameless-os/sdk';

export function initFirstUseTerminalAchievement(systemApi: CoreAPI) {
  systemApi.achievement.registerAchievement({
    id: 'terminal_first_use',
    name: 'First Terminal User',
    description: 'Successfully opened and used the terminal for the first time',
    icon: 'assets/images/icons/terminal.svg',
    category: 'system',
    rarity: 'common',
    type: 'conditional',
    condition: {
      target: 1,
      type: 'event',
    },
    points: 10,
    hidden: false
  });
}
