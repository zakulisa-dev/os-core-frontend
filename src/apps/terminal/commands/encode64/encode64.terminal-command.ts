import { TerminalAPI } from '@nameless-os/sdk';

const initEncode64Command = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "encode64",
    description: "Encode text to base64",
    handler: (args, ctx) => {
      if (!args.positional.length) {
        ctx.io.print("Usage: encode64 [text]");
        return;
      }
      const input = args.positional.join(" ");
      const encoded = btoa(input);
      ctx.io.print(`📦 ${encoded}`);
    },
  });
};

export { initEncode64Command };
