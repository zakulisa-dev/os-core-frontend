import { CoreAPI } from '@nameless-os/sdk';

export function initWindowsRefugeeTerminalAchievement(systemApi: CoreAPI) {
  systemApi.achievement.registerAchievement({
    id: 'terminal_windows_refugee',
    name: 'Windows Refugee',
    description: 'Tried to use "dir" instead of "ls" - old habits die hard!',
    icon: 'assets/images/icons/terminal.svg',
    category: 'app',
    rarity: 'common',
    type: 'conditional',
    condition: {
      target: 1,
      type: 'event',
    },
    points: 10,
    hidden: true,
  });
}
