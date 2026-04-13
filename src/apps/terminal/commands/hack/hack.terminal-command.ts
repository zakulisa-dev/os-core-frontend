import { defineFlags, TerminalAPI } from '@nameless-os/sdk';
import { hackSequences } from '@Apps/terminal/commands/hack/hack.data';
import { HackType } from '@Apps/terminal/commands/hack/hack.type';

const initHackCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "hack",
    description: "Initiates fake hacking sequence",
    hidden: true,
    flags: defineFlags([
      {
        name: "fast",
        aliases: ['f'],
        type: "boolean",
        description: "Execute hack sequence faster (200ms intervals)"
      },
      {
        name: "slow",
        aliases: ['s'],
        type: "boolean",
        description: "Execute hack sequence slower (1000ms intervals)"
      },
      {
        name: "silent",
        aliases: ['q'],
        type: "boolean",
        description: "Minimal output mode"
      },
      {
        name: "help",
        aliases: ['h'],
        type: "boolean",
        description: "Show help information"
      }
    ]),
    handler: async ({ positional, flags }, ctx) => {
      const target = positional[0] || "mainframe";
      const speed = flags.fast ? 200 : flags.slow ? 1000 : 500;
      const silent = flags.silent;

      const lines = hackSequences[target as HackType] || hackSequences.mainframe;
      let isAborted = false;

      const showProgress = (message: string, duration = 1500) => {
        return new Promise<void>(resolve => {
          if (isAborted) return resolve();

          const progressChars = ['▱▱▱▱▱', '▰▱▱▱▱', '▰▰▱▱▱', '▰▰▰▱▱', '▰▰▰▰▱', '▰▰▰▰▰'];
          let i = 0;

          const groupId = ctx.io.print(`${message} [${progressChars[0]}]`);

          const interval = setInterval(() => {
            if (isAborted) {
              clearInterval(interval);
              return resolve();
            }

            const progress = progressChars[Math.floor((i / (duration / 100)) * progressChars.length / 100)];
            console.log(Math.floor((i / (duration / 100)) * progressChars.length / 100), 'progress');
            ctx.ui.updateMessage(groupId, `${message} [${progress}]`);
            i += 100;

            if (i >= duration) {
              clearInterval(interval);
              ctx.ui.deleteMessage(groupId);
              resolve();
            }
          }, 100);
        });
      };

      const typewriterEffect = (text: string, delay = 30) => {
        return new Promise<void>(resolve => {
          if (isAborted) return resolve();

          const groupId = ctx.io.print('');
          let i = 0;

          const interval = setInterval(() => {
            if (isAborted) {
              clearInterval(interval);
              return resolve();
            }

            ctx.ui.updateMessage(groupId, text.slice(0, i + 1));
            i++;

            if (i >= text.length) {
              clearInterval(interval);
              resolve();
            }
          }, delay);
        });
      };

      const executeSequence = async () => {
        try {
          if (!silent) {
            ctx.io.print(`🎯 Target: ${target.toUpperCase()}`);
            ctx.io.print(`⚡ Speed: ${speed}ms intervals`);
            ctx.io.print(`📊 Progress tracking enabled\n`);
          }

          for (let i = 0; i < lines.length; i++) {
            if (isAborted) break;

            const line = lines[i];

            await new Promise(resolve => setTimeout(resolve, speed + Math.random() * 300));

            if (line.type === 'progress') {
              ctx.io.print(line.text);
              await showProgress('Processing', 1000 + Math.random() * 1000);
            } else if (line.type === 'success') {
              await typewriterEffect(line.text, 50);

              ctx.io.print("\n" + "═".repeat(50));
              ctx.io.print("🚨 SYSTEM BREACH DETECTED 🚨");
              ctx.io.print("═".repeat(50));

            } else {
              ctx.io.print(line.text);
            }
          }
        } catch (error) {
          ctx.io.printError("❌ Hack sequence interrupted by system error!");
        }
      };

      const handleAbort = () => {
        isAborted = true;
        ctx.io.print("\n⚠️ Hack sequence aborted by user!");
        ctx.io.print("💾 Session data saved to variables");
      };

      if (flags.help) {
        ctx.io.print("hack - Fake hacking sequence simulator");
        ctx.io.print("\nUsage: hack [target] [options]");
        ctx.io.print("\nTargets:");
        ctx.io.print("  mainframe  - Hack a mainframe system (default)");
        ctx.io.print("  database   - Breach database cluster");
        ctx.io.print("  satellite  - Take control of satellite");
        ctx.io.print("\nFlags:");
        ctx.io.print("  -f, --fast     - Faster execution (200ms)");
        ctx.io.print("  -s, --slow     - Slower execution (1000ms)");
        ctx.io.print("  -q, --silent   - Minimal output");
        ctx.io.print("  -h, --help     - Show this help");
        ctx.io.print("\nExamples:");
        ctx.io.print("  hack database --fast");
        ctx.io.print("  hack satellite -s");
        ctx.io.print("  hack --silent");
        return;
      }

      if (!hackSequences[target as HackType]) {
        ctx.io.printError(`❌ Unknown target: ${target}`);
        ctx.io.print("Available targets: mainframe, database, satellite");
        ctx.io.print("Use 'hack --help' for more information");
        return;
      }

      executeSequence().catch(handleAbort);
    },
  });
};

export { initHackCommand };
