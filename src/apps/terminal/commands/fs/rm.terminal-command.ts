import { useTerminalStore } from '@Apps/terminal/stores/useTerminal.store';
import { defineFlags, FileSystemAPI, TerminalAPI } from '@nameless-os/sdk';

export function initRmCommand(terminalApi: TerminalAPI, fileSystem: FileSystemAPI) {
  terminalApi.registerCommand({
    name: "rm",
    flags: defineFlags([
      {
        name: "recursive",
        aliases: ["r"],
        type: "boolean",
      }
    ]),
    description: "Remove files or directories (-r for recursive)",
    handler: async (args, ctx) => {
      try {
        const fileName = args.positional[0];

        if (!fileName) {
          ctx.io.print("❌ Usage: rm [-r] <filename>");
          return;
        }

        const currentDir = useTerminalStore.getState().getCurrentDirectory(ctx.appId);
        const filePath = fileName.startsWith('/') ? fileName :
          currentDir === '/' ? `/${fileName}` : `${currentDir}/${fileName}`;

        if (filePath === '/') {
          ctx.io.print("❌ Cannot delete root directory!");
          return;
        }

        console.log(args);
        await fileSystem.delete(filePath, { recursive: args.flags.recursive });
        ctx.io.print(`🗑️ Deleted: ${filePath}`);
      } catch (error) {
        ctx.io.print(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  });
}
