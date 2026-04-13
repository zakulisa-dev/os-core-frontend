import { useTerminalStore } from '@Apps/terminal/stores/useTerminal.store';
import { FileSystemAPI, TerminalAPI } from '@nameless-os/sdk';

export function initCpCommand(terminalApi: TerminalAPI, fileSystem: FileSystemAPI) {
  terminalApi.registerCommand({
    name: "cp",
    description: "Copy files",
    handler: async (args, ctx) => {
      try {
        const [from, to] = args.positional;
        if (!from || !to) {
          ctx.io.print("❌ Usage: cp <source> <destination>");
          return;
        }

        const currentDir = useTerminalStore.getState().getCurrentDirectory(ctx.info.appId);
        const fromPath = from.startsWith('/') ? from :
          currentDir === '/' ? `/${from}` : `${currentDir}/${from}`;
        const toPath = to.startsWith('/') ? to :
          currentDir === '/' ? `/${to}` : `${currentDir}/${to}`;

        await fileSystem.copy(fromPath, toPath);
        ctx.io.print(`📋 Copied: ${fromPath} → ${toPath}`);
      } catch (error) {
        ctx.io.print(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  });
}
