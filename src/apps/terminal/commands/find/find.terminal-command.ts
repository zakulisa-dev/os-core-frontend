import { CommandContext, defineFlags, FileSystemAPI, FlagsToObject, TerminalAPI } from '@nameless-os/sdk';
import { useTerminalStore } from '@Apps/terminal/stores/useTerminal.store';

const findFlags = defineFlags([
  {
    name: 'name',
    aliases: ['n'],
    type: 'string',
    description: 'Base of file name (the path with the leading directories removed)',
  },
  {
    name: 'iname',
    type: 'string',
    description: 'Case insensitive -name',
  },
  {
    name: 'type',
    aliases: ['t'],
    type: 'string',
    description: 'File type: f (file), d (directory)',
    values: ['f', 'd'],
  },
  {
    name: 'size',
    aliases: ['s'],
    type: 'string',
    description: 'File size (e.g., +100k, -1M, 500)',
  },
  {
    name: 'maxdepth',
    aliases: ['m'],
    type: 'number',
    description: 'Maximum depth to search',
  },
  {
    name: 'mindepth',
    type: 'number',
    description: 'Minimum depth to search',
  },
  {
    name: 'empty',
    aliases: ['e'],
    type: 'boolean',
    description: 'Find empty files and directories',
    default: false,
  },
  {
    name: 'executable',
    aliases: ['x'],
    type: 'boolean',
    description: 'Find executable files',
    default: false,
  },
  {
    name: 'print0',
    type: 'boolean',
    description: 'Print full file name on stdout, followed by null character',
    default: false,
  },
]);

type FindFlagsType = FlagsToObject<typeof findFlags>;

const initFindCommand = (terminalApi: TerminalAPI, fileSystem: FileSystemAPI): void => {
  terminalApi.registerCommand({
    name: 'find',
    description: 'Search for files and directories',
    flags: findFlags,
    positionalArgs: [
      {
        name: 'path',
        description: 'Starting directory (default: current directory)',
        required: false,
      },
    ],
    handler: async ({ flags, positional }, ctx) => {
      const startPath: string = positional[0] || '.';

      try {
        const files = await searchFiles(startPath, flags, ctx, fileSystem);

        for (const file of files) {
          if (flags.print0) {
            ctx.io.print(file + '\0');
          } else {
            ctx.io.print(file);
          }
        }

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        ctx.io.printError(`find: ${errorMessage}`);
      }
    },
  });
};

const searchFiles = async (
  startPath: string,
  flags: FindFlagsType,
  ctx: CommandContext,
  fileSystem: FileSystemAPI,
): Promise<string[]> => {
  const results: string[] = [];

  let resolvedStartPath: string;

  try {
    if (startPath === '.') {
      resolvedStartPath = useTerminalStore.getState().getCurrentDirectory(ctx.info.appId);
    } else if (startPath.startsWith('/')) {
      resolvedStartPath = startPath;
    } else {
      const currentDir = useTerminalStore.getState().getCurrentDirectory(ctx.info.appId);
      resolvedStartPath = currentDir === '/' ? `/${startPath}` : `${currentDir}/${startPath}`;
    }

    if (!(await fileSystem.exists(resolvedStartPath))) {
      throw new Error(`No such file or directory: ${resolvedStartPath}`);
    }
  } catch (error) {
    throw new Error(`No such file or directory: ${startPath}`);
  }

  const traverse = async (path: string, depth: number = 0): Promise<void> => {
    if (flags.maxdepth !== undefined && depth > flags.maxdepth) return;

    try {
      if (!(await fileSystem.exists(path))) return;

      const stat = await fileSystem.stat(path);
      const isDirectory = stat.isDirectory;

      if (flags.mindepth === undefined || depth >= flags.mindepth) {
        const name = path.split('/').pop() || path;
        const entry = {
          name,
          type: isDirectory ? 'directory' : 'file',
          size: stat.size || 0,
          path,
          executable: stat.permissions?.includes('x') || false,
        };

        if (await matchesFilters(entry, flags, fileSystem)) {
          results.push(path);
        }
      }

      if (isDirectory) {
        try {
          const entries = await fileSystem.readDir(path);

          for (const entry of entries) {
            await traverse(entry.path, depth + 1);
          }
        } catch (error) {
        }
      }
    } catch (error) {
    }
  };

  await traverse(resolvedStartPath, 0);
  return results;
};

const matchesFilters = async (entry: {
  name: string
  type: string
  size: number
  path: string
  executable: boolean
}, flags: FindFlagsType, fileSystem: FileSystemAPI): Promise<boolean> => {
  if (flags.name) {
    const pattern = globToRegex(flags.name as string);
    if (!pattern.test(entry.name)) return false;
  }

  if (flags.iname) {
    const pattern = globToRegex(flags.iname as string, true);
    if (!pattern.test(entry.name)) return false;
  }

  if (flags.type) {
    const expectedType = flags.type === 'f' ? 'file' : 'directory';
    if (entry.type !== expectedType) return false;
  }

  if (flags.size) {
    if (!matchesSize(entry.size || 0, flags.size as string)) return false;
  }

  if (flags.empty) {
    if (entry.type === 'file' && (entry.size || 0) > 0) return false;
    if (entry.type === 'directory') {
      try {
        const dirEntries = await fileSystem.readDir(entry.path);
        if (dirEntries.length > 0) return false;
      } catch (error) {
        return false;
      }
    }
  }

  if (flags.executable) {
    if (!entry.executable) return false;
  }

  return true;
};

const globToRegex = (pattern: string, caseInsensitive: boolean = false): RegExp => {
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');

  const flags = caseInsensitive ? 'i' : '';
  return new RegExp(`^${regexPattern}$`, flags);
};

const matchesSize = (fileSize: number, sizePattern: string): boolean => {
  const match = sizePattern.match(/^([+-]?)(\d+)([kmg]?)$/i);
  if (!match) return false;

  const [, operator, sizeStr, unit] = match;
  let size = parseInt(sizeStr);

  switch (unit.toLowerCase()) {
    case 'k':
      size *= 1024;
      break;
    case 'm':
      size *= 1024 * 1024;
      break;
    case 'g':
      size *= 1024 * 1024 * 1024;
      break;
  }

  switch (operator) {
    case '+':
      return fileSize > size;
    case '-':
      return fileSize < size;
    default:
      return fileSize === size;
  }
};

export { initFindCommand };