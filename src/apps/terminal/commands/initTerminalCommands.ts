import { initBasicTerminalCommands } from '@Apps/terminal/commands/initBasicTerminalCommands';
import { initDoomCommands } from '@Apps/terminal/commands/doom/initDoomCommands';
import { AchievementAPI, FileSystemAPI, SoundAPI, TerminalAPI } from '@nameless-os/sdk';

function initTerminalCommands(terminalApi: TerminalAPI, fileSystem: FileSystemAPI, achievementApi: AchievementAPI, soundApi: SoundAPI) {
  initBasicTerminalCommands(terminalApi, fileSystem, achievementApi);
  initDoomCommands(terminalApi, soundApi);
}

export { initTerminalCommands };