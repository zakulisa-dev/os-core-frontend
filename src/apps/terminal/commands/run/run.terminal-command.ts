import { useTerminalStore } from '@Apps/terminal/stores/useTerminal.store';
import { FileSystemAPI, TerminalAPI } from '@nameless-os/sdk';
import * as ts from 'typescript';

export const initRunCommand = (terminalApi: TerminalAPI, fileSystem: FileSystemAPI) => {
  terminalApi.registerCommand({
    name: 'run',
    description: 'Execute JavaScript or TypeScript files with arguments',
    handler: async (args, ctx) => {
      try {
        const filename = args.positional[0];

        if (!filename) {
          ctx.io.print('❌ Usage: run <filename> [args...]');
          ctx.io.print('   Supported formats: .js, .ts');
          ctx.io.print('   Example: run script.ts hello world --debug');
          return;
        }

        const currentDirectory = useTerminalStore.getState().getCurrentDirectory(ctx.info.appId);
        const fullPath = filename.startsWith('/') ? filename : `${currentDirectory}/${filename}`;

        let fileContent: string;
        try {
          fileContent = await fileSystem.readFile(fullPath);
        } catch (error) {
          ctx.io.print(`❌ File '${filename}' not found`);
          return;
        }

        const extension = filename.split('.').pop()?.toLowerCase();

        if (!['js', 'ts'].includes(extension || '')) {
          ctx.io.print(`❌ Unsupported file type: .${extension}`);
          ctx.io.print('   Supported formats: .js, .ts');
          return;
        }

        const scriptArgs = args.positional.slice(1);

        ctx.io.print(`🚀 Running ${filename}...`);
        if (scriptArgs.length > 0) {
          ctx.io.print(`📋 Arguments: [${scriptArgs.map(arg => `"${arg}"`).join(', ')}]`);
        }
        ctx.io.print('');

        const scriptContext = createScriptContext(ctx, filename, scriptArgs);

        try {
          let jsCode = fileContent;

          if (extension === 'ts') {
            jsCode = transpileTypeScript(fileContent);
          }

          await executeScript(jsCode, scriptContext);

        } catch (executionError) {
          ctx.io.print(`💥 Runtime Error: ${executionError instanceof Error ? executionError.message : 'Unknown error'}`);
          if (executionError instanceof Error && executionError.stack) {
            ctx.io.print(`   Stack: ${executionError.stack.split('\n')[1]?.trim() || ''}`);
          }
        }

        ctx.io.print('');
        ctx.io.print('✅ Script execution completed');

      } catch (error) {
        ctx.io.print(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  });
};

function transpileTypeScript(source: string): string {
  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.None,
    removeComments: false,
    strict: false,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
  };

  const result = ts.transpile(source, compilerOptions);
  return result;
}

function createScriptContext(ctx: any, filename: string, scriptArgs: string[]) {
  const argv = ['node', filename, ...scriptArgs];

  return {
    process: {
      argv,
      env: {},
      cwd: () => useTerminalStore.getState().getCurrentDirectory(ctx.info.appId),
      exit: (code: number = 0) => {
        ctx.io.print(`🏁 Process exited with code ${code}`);
      }
    },

    args: scriptArgs,

    __filename: filename,
    __dirname: filename.substring(0, filename.lastIndexOf('/')),

    console: {
      log: (...args: any[]) => {
        const output = args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        ctx.io.print(`📝 ${output}`);
      },
      error: (...args: any[]) => {
        const output = args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        ctx.io.print(`❌ ${output}`);
      },
      warn: (...args: any[]) => {
        const output = args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        ctx.io.print(`⚠️  ${output}`);
      },
      info: (...args: any[]) => {
        const output = args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        ctx.io.print(`ℹ️  ${output}`);
      },
      clear: () => {
        ctx.io.print('\n'.repeat(10));
      }
    },

    setTimeout: (callback: Function, delay: number) => {
      return window.setTimeout(callback, delay);
    },
    setInterval: (callback: Function, delay: number) => {
      return window.setInterval(callback, delay);
    },
    clearTimeout: (id: number) => {
      window.clearTimeout(id);
    },
    clearInterval: (id: number) => {
      window.clearInterval(id);
    },

    fetch: window.fetch.bind(window)
  };
}

async function executeScript(jsCode: string, context: any): Promise<void> {
  const func = new Function(
    'process',
    'args',
    '__filename',
    '__dirname',
    'console',
    'setTimeout',
    'setInterval',
    'clearTimeout',
    'clearInterval',
    'fetch',
    `
    "use strict";
    ${jsCode}
    `
  );

  await func(
    context.process,
    context.args,
    context.__filename,
    context.__dirname,
    context.console,
    context.setTimeout,
    context.setInterval,
    context.clearTimeout,
    context.clearInterval,
    context.fetch
  );
}