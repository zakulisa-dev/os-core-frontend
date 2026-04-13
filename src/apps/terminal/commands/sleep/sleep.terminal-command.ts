import { TerminalAPI } from '@nameless-os/sdk';

export const initSleepCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: 'sleep',
    description: '',
    flags: [],
    handler: async (args, ctx) => {
      const seconds = parseInt(args.positional[0] || '5');
      if (isNaN(seconds)) {
        ctx.io.printError('Usage: sleep <seconds>');
        return;
      }

      ctx.io.print(`Sleeping for ${seconds} seconds...`);

      for (let i = 0; i < seconds; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        ctx.io.print(`${i + 1}/${seconds} seconds elapsed`);
      }

      ctx.io.print('Sleep completed!');
    }
  });
};