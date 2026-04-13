import { TerminalAPI } from '@nameless-os/sdk';

const initHelloCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "hello",
    description: "Say hello to the system",
    handler: (_, ctx) => {
      ctx.io.print("👋 Hello, user!");
      ctx.io.print("Welcome to Nameless OS Terminal. Type `help` to get started.");
    },
  });
};

export { initHelloCommand };
