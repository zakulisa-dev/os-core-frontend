import { TerminalAPI } from '@nameless-os/sdk';

const initUptimeCommand = (terminalApi: TerminalAPI) => {
  const startTime = Date.now();
  terminalApi.registerCommand({
    name: "uptime",
    description: "Show how long the system has been running",
    handler: (_, ctx) => {
      const ms = Date.now() - startTime;
      const seconds = Math.floor(ms / 1000) % 60;
      const minutes = Math.floor(ms / (1000 * 60)) % 60;
      const hours = Math.floor(ms / (1000 * 60 * 60));
      ctx.io.print(`⏱️ Uptime: ${hours}h ${minutes}m ${seconds}s`);
    },
  });
};

export { initUptimeCommand };
