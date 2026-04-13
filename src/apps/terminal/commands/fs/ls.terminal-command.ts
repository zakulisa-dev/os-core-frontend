import { useTerminalStore } from '@Apps/terminal/stores/useTerminal.store';
import { FileSystemAPI, TerminalAPI } from '@nameless-os/sdk';

export const initLsCommand = (terminalApi: TerminalAPI, fileSystem: FileSystemAPI) => {
  terminalApi.registerCommand({
    name: 'ls',
    description: 'List directory contents',
    handler: async (args, ctx) => {
      try {
        const currentDirectory = useTerminalStore.getState().getCurrentDirectory(ctx.info.appId);
        const path = args.positional[0] || currentDirectory;
        const entries = await fileSystem.readDir(path);

        if (entries.length === 0) {
          ctx.io.print('📂 Empty directory');
          return;
        }

        entries.forEach(entry => {
          const icon = entry.type === 'directory' ? '📁' : '📄';
          const size = entry.type === 'file' ? `\t${entry.stats.size}` : '\t-';
          ctx.io.print(`${icon} ${entry.name}${size}`);
        });
      } catch (error) {
        ctx.io.print(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  });
};

