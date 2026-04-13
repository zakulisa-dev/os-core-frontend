import { initIdkfaCommand } from '@Apps/terminal/commands/doom/idkfa.terminal-command';
import { initIddqdCommand } from '@Apps/terminal/commands/doom/iddqd.terminal-command';
import { initIdclipCommand } from '@Apps/terminal/commands/doom/idclip.terminal-command';
import { initIdspispopdCommand } from '@Apps/terminal/commands/doom/idspispopd.terminal-command';
import { SoundAPI, TerminalAPI } from '@nameless-os/sdk';

export function initDoomCommands(terminalApi: TerminalAPI, soundApi: SoundAPI) {
  initIdkfaCommand(terminalApi, soundApi);
  initIddqdCommand(terminalApi);
  initIdclipCommand(terminalApi);
  initIdspispopdCommand(terminalApi);
}