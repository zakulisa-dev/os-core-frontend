import { TerminalAPI } from '@nameless-os/sdk';

const initVersionCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "version",
    description: "Show Nameless OS version",
    handler: (_, ctx) => {
      ctx.io.print("🖥️ Nameless OS v0.3");
    },
  });
};

export { initVersionCommand };
