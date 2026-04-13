import { TerminalAPI } from '@nameless-os/sdk';

const initDecode64Command = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "decode64",
    description: "Decode base64 to text",
    handler: (args, ctx) => {
      if (!args.positional.length) {
        ctx.io.print("Usage: decode64 [base64]");
        return;
      }
      const input = args.positional.join(" ");
      try {
        const decoded = atob(input);
        ctx.io.print(`📭 ${decoded}`);
      } catch {
        ctx.io.print("❌ Invalid base64 input");
      }
    },
  });
};

export { initDecode64Command };
