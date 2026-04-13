import { useTerminalStore } from '@Apps/terminal/stores/useTerminal.store';
import { FileSystemAPI, TerminalAPI } from '@nameless-os/sdk';

export function initCatCommand(terminalApi: TerminalAPI, fileSystem: FileSystemAPI) {
  terminalApi.registerCommand({
    name: "cat",
    description: "Display file contents",
    handler: async (args, ctx) => {
      try {
        const fileName = args.positional[0];
        if (!fileName) {
          ctx.io.print("❌ Usage: cat <filename>");
          return;
        }

        const currentDir = useTerminalStore.getState().getCurrentDirectory(ctx.info.appId);
        const filePath = fileName.startsWith('/') ? fileName :
          currentDir === '/' ? `/${fileName}` : `${currentDir}/${fileName}`;

        const content = await fileSystem.readFile(filePath);
        ctx.io.print(`📄 ${filePath}:`);
        ctx.io.print(content || "(empty file)");
      } catch (error) {
        ctx.io.print(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  });
}
