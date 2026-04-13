import { TerminalAPI } from '@nameless-os/sdk';

const initEchoCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "echo",
    description: "Echo output",
    handler: (args, ctx) => {
      ctx.io.print(args.positional.join(" ").replace(/\\n/g, '\n'));
    },
  })
}

export { initEchoCommand };
