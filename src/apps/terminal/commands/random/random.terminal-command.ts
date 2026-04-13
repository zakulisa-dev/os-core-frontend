import { TerminalAPI } from '@nameless-os/sdk';

const initRandomCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "random",
    description: "Generate a random number between min and max",
    handler: (args, ctx) => {
      const [min, max] = args.positional.map(Number);
      if (isNaN(min) || isNaN(max)) {
        ctx.io.print("Usage: random [min] [max]");
        return;
      }
      const result = Math.floor(Math.random() * (max - min + 1)) + min;
      ctx.io.print(`🎲 Random: ${result}`);
    },
  });
};

export { initRandomCommand };
