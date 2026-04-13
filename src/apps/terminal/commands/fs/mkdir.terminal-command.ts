import { useTerminalStore } from '@Apps/terminal/stores/useTerminal.store';
import { FileSystemAPI, TerminalAPI } from '@nameless-os/sdk';

export function initMkdirCommand(terminalApi: TerminalAPI, fileSystem: FileSystemAPI) {
  terminalApi.registerCommand({
    name: "mkdir",
    description: "Create directory",
    handler: async (args, ctx) => {
      try {
        const dirName = args.positional[0];
        if (!dirName) {
          ctx.io.print("❌ Usage: mkdir <directory_name>");
          return;
        }

        const currentDir = useTerminalStore.getState().getCurrentDirectory(ctx.info.appId);
        const dirPath = dirName.startsWith('/') ? dirName :
          currentDir === '/' ? `/${dirName}` : `${currentDir}/${dirName}`;

        await fileSystem.mkdir(dirPath, { recursive: true });
        ctx.io.print(`📁 Created directory: ${dirPath}`);
      } catch (error) {
        ctx.io.print(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  });
}
