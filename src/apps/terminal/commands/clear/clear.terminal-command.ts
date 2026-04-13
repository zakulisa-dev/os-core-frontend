import { useTerminalStore } from '@Apps/terminal/stores/useTerminal.store';
import { TerminalAPI } from '@nameless-os/sdk';

const initClearCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "clear",
    description: "Clear the terminal screen",
    handler: (_, ctx) => {
      useTerminalStore.getState().clearHistory(ctx.info.appId);
    },
  });
};

export { initClearCommand };
