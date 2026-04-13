import { useTerminalStore } from '@Apps/terminal/stores/useTerminal.store';
import { FileSystemAPI, TerminalAPI } from '@nameless-os/sdk';

export function initCdCommand(terminalApi: TerminalAPI, fileSystem: FileSystemAPI) {
  terminalApi.registerCommand({
    name: "cd",
    description: "Change directory",
    handler: async (args, ctx) => {
      try {
        const targetPath = args.positional[0] || '/';
        const currentDir = useTerminalStore.getState().getCurrentDirectory(ctx.info.appId);

        const resolvedPath = await fileSystem.resolveAndValidatePath(
          currentDir,
          targetPath
        );

        useTerminalStore.getState().setCurrentDirectory(ctx.info.appId, resolvedPath);

        ctx.io.print(`📁 ${resolvedPath}`);

      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            ctx.io.print(`❌ Directory not found: ${args.positional[0]}`);
          } else if (error.message.includes('Not a directory')) {
            ctx.io.print(`❌ Not a directory: ${args.positional[0]}`);
          } else {
            ctx.io.print(`❌ Error: ${error.message}`);
          }
        } else {
          ctx.io.print(`❌ Unknown error occurred`);
        }
      }
    },
  });
}