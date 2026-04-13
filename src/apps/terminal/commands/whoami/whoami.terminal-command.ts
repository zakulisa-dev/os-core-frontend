import { TerminalAPI } from '@nameless-os/sdk';

const initWhoamiCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "whoami",
    description: "Show current user",
    handler: (_, ctx) => {
      ctx.io.print("root");
    },
  });
};

export { initWhoamiCommand };
