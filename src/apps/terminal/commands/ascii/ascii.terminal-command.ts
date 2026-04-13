import { getRandom, TerminalAPI } from '@nameless-os/sdk';
import { AsciiArts } from '@Apps/terminal/commands/ascii/asciiArts';

const initAsciiCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "ascii",
    description: "Print a random ASCII art",
    handler: (_, ctx) => {
      const art = getRandom(AsciiArts);
      ctx.io.print(art);
    },
  });
};

export { initAsciiCommand };
