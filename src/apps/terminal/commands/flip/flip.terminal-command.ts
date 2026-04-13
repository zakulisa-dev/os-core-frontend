import { TerminalAPI } from '@nameless-os/sdk';

const initFlipCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "flip",
    description: "Flip a coin",
    handler: (_, ctx) => {
      const result = Math.random() < 0.5 ? "Heads" : "Tails";
      ctx.io.print(result);
    },
  });
};

export { initFlipCommand };
