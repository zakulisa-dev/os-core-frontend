import { useTerminalStore } from '@Apps/terminal/stores/useTerminal.store';
import { FileSystemAPI, TerminalAPI } from '@nameless-os/sdk';

export function initTouchCommand(terminalApi: TerminalAPI, fileSystem: FileSystemAPI) {
  terminalApi.registerCommand({
    name: "touch",
    description: "Create empty file or update timestamp",
    handler: async (args, ctx) => {
      const filePath = args.positional[0];

      if (!filePath) {
        ctx.io.print("❌ Usage: touch <filename>");
        return;
      }

      try {
        const currentDir = useTerminalStore.getState().getCurrentDirectory(ctx.info.appId);
        const resolvedPath = await fileSystem.touchFile(currentDir, filePath);

        ctx.io.print(`📝 ${resolvedPath}`);

      } catch (error) {
        ctx.io.print(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  });
}