import { TerminalAPI } from '@nameless-os/sdk';

const initCreditsCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "credits",
    description: "Show the creators and contributors",
    handler: async (_, ctx) => {
      const lines = [
        "\x1b[36m╔══════════════════════════════╗\x1b[0m",
        "\x1b[36m║      NamelessOS Credits      ║\x1b[0m",
        "\x1b[36m╚══════════════════════════════╝\x1b[0m",
        "",
        "\x1b[33mAuthor:         \x1b[0mDenis 'Noxtheris' Goncharov",
        "\x1b[33mStarted:        \x1b[0mApril 19, 2021",
        "\x1b[33mLines of code:  \x1b[0m50,000+",
        "\x1b[33mInspired by:    \x1b[0mLinux, Windows, retro OS vibes",
        "\x1b[33mSpecial thanks: \x1b[0mCoffee, OpenAI, and countless late-night Google searches",
        "",
        "\x1b[32m🎁 Easter Eggs:\x1b[0m Try \x1b[1m`idkfa`\x1b[0m, \x1b[1m`42`\x1b[0m, \x1b[1m`hack`\x1b[0m 😉",
        ""
      ];

      const messageIds = lines.map(() => ctx.io.print(""));

      for (let i = 0; i < lines.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        ctx.ui.updateMessage(messageIds[i], lines[i]);
      }
    },
  });
};

export { initCreditsCommand };