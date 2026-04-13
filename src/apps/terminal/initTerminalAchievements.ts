import { initFirstUseTerminalAchievement } from '@Apps/terminal/achievements/firstUse.terminal.achievement';
import { initFirstErrorTerminalAchievement } from '@Apps/terminal/achievements/firstError.terminal.achievement';
import { initFirstCommandTerminalAchievement } from '@Apps/terminal/achievements/firstCommand.terminal.achievement';
import { initWindowsRefugeeTerminalAchievement } from '@Apps/terminal/achievements/windowsRefugee.terminal.achievement';
import { CoreAPI } from '@nameless-os/sdk';

export function initTerminalAchievements(systemApi: CoreAPI) {
  initFirstUseTerminalAchievement(systemApi);
  initFirstErrorTerminalAchievement(systemApi);
  initFirstCommandTerminalAchievement(systemApi);
  initWindowsRefugeeTerminalAchievement(systemApi);
}
