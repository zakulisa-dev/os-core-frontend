import { TerminalAPI } from '@nameless-os/sdk';

const initRollCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "roll",
    description: "Roll dice in NdN format (e.g. 2d6)",
    handler: (args, ctx) => {
      const input = args.positional[0] || "1d6";
      const match = input.match(/(\d+)d(\d+)/);
      if (!match) {
        ctx.io.print("Usage: roll [NdN], e.g. 2d6");
        return;
      }
      const [_, nStr, dStr] = match;
      const n = parseInt(nStr);
      const d = parseInt(dStr);
      if (isNaN(n) || isNaN(d)) {
        ctx.io.print("Invalid dice format.");
        return;
      }
      const rolls = Array.from({ length: n }, () => Math.floor(Math.random() * d) + 1);
      const total = rolls.reduce((a, b) => a + b, 0);
      ctx.io.print(`🎲 Rolls: ${rolls.join(", ")} (Total: ${total})`);
    },
  });
};

export { initRollCommand };
