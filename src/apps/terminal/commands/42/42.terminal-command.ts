import { TerminalAPI } from '@nameless-os/sdk';

const init42Command = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "42",
    description: "The answer to life, the universe and everything",
    hidden: true,
    handler: async (_, ctx) => {
      ctx.io.print("Calculating answer...");
      await new Promise((r) => setTimeout(r, 1500));
      ctx.io.print("\x1b[90mThe answer to life, the universe and everything.\x1b[0m");
    },
  });
};

export { init42Command };