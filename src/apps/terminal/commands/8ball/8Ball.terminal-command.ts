import { getRandom, TerminalAPI } from '@nameless-os/sdk';
import { base8BallPersonas, base8BallResponses } from '@Apps/terminal/commands/8ball/8ball.data';
import { Base8BallPersona } from '@Apps/terminal/commands/8ball/8ball.types';

const init8BallCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "8ball",
    description: "Ask the magic 8-ball a question",
    handler: async (args, ctx) => {
      const input = args.positional.join(' ').trim();

      if (!input) {
        ctx.io.print("🎱 Ask a full question, like: `8ball Will I be rich?`");
        return;
      }

      if (!input.endsWith("?")) {
        ctx.io.print("🤔 That doesn’t look like a question. Add a '?' maybe?");
        return;
      }

      const lower = input.toLowerCase();
      if (lower.includes("when") && Math.random() < 0.1) {
        ctx.io.print("⏳ Sooner than you think...");
        return;
      }
      if (lower.includes("who") && Math.random() < 0.1) {
        ctx.io.print("🕵️‍♂️ Someone you’d least expect.");
        return;
      }

      const persona = Math.random() < 0.25 ? getRandomPersona() : base8BallPersonas[Base8BallPersona.Classic];
      const answer = getRandom(base8BallResponses);
      ctx.io.print(`${persona.prefix} ${persona.style(answer)}`);

      if (Math.random() < 0.2) {
        ctx.io.print("Do you believe that? [Y/n]");
        const reply = (await ctx.io.awaitInput()).trim().toLowerCase();

        if (["y", "yes", ""].includes(reply)) {
          ctx.io.print("Glad you trust the orb. ✨");
        } else if (["n", "no"].includes(reply)) {
          ctx.io.print("😤 You dare question me? Then... the answer is now: ❌ NO.");
        } else {
          ctx.io.print("🤷‍♂️ I’ll take that as a maybe.");
        }
      }
    },
  });
};

function getRandomPersona() {
  return base8BallPersonas[getRandom(Object.values(Base8BallPersona))];
}

export { init8BallCommand };
