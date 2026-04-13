import { TerminalAPIImpl } from '@Apps/terminal/core/terminalAPI/terminalAPI';
import { initTerminalCommands } from '@Apps/terminal/commands/initTerminalCommands';
import { AchievementAPI, FileSystemAPI, SoundAPI } from '@nameless-os/sdk';

function initTerminal(fs: FileSystemAPI, achievementApi: AchievementAPI, soundApi: SoundAPI) {
  const terminal = new TerminalAPIImpl(fs, achievementApi);
  initTerminalCommands(terminal, fs, achievementApi, soundApi);
  return terminal;
}

export { initTerminal };
