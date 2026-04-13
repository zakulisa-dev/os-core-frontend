import { useTerminalStore } from '@Apps/terminal/stores/useTerminal.store';
import { FileSystemAPI, TerminalAPI } from '@nameless-os/sdk';

export function initMvCommand(terminalApi: TerminalAPI, fileSystem: FileSystemAPI) {
  terminalApi.registerCommand({
    name: "mv",
    description: "Move or rename files/directories",
    handler: async (args, ctx) => {
      try {
        const [from, to] = args.positional;
        if (!from || !to) {
          ctx.io.print("❌ Usage: mv <source> <destination>");
          return;
        }

        const currentDir = useTerminalStore.getState().getCurrentDirectory(ctx.info.appId);
        const fromPath = from.startsWith('/') ? from :
          currentDir === '/' ? `/${from}` : `${currentDir}/${from}`;
        const toPath = to.startsWith('/') ? to :
          currentDir === '/' ? `/${to}` : `${currentDir}/${to}`;

        await fileSystem.move(fromPath, toPath);
        ctx.io.print(`📦 Moved: ${fromPath} → ${toPath}`);
      } catch (error) {
        ctx.io.print(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  });
}
