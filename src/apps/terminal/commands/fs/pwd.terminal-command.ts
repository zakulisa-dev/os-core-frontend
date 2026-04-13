import { useTerminalStore } from '@Apps/terminal/stores/useTerminal.store';
import { TerminalAPI } from '@nameless-os/sdk';

export function initPwdCommand(terminalApi: TerminalAPI) {
  terminalApi.registerCommand({
    name: "pwd",
    description: "Print working directory",
    handler: async (args, ctx) => {
      const currentDir = useTerminalStore.getState().getCurrentDirectory(ctx.appId);
      ctx.io.print(`📍 Current directory: ${currentDir}`);
    },
  });
}
