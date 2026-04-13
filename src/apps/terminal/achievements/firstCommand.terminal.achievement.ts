import { CoreAPI } from '@nameless-os/sdk';

export function initFirstCommandTerminalAchievement(systemApi: CoreAPI) {
  systemApi.achievement.registerAchievement({
    id: 'terminal_first_command',
    name: 'Command Pioneer',
    description: 'Successfully executed your very first command',
    icon: 'assets/images/icons/terminal.svg',
    category: 'app',
    rarity: 'common',
    type: 'conditional',
    condition: {
      target: 1,
      type: 'event',
    },
    points: 15,
    hidden: false
  });
}