import {
  AchievementAPI,
  AppInstanceId,
  CommandContext,
  CommandFlag, FileSystemAPI,
  PagerState,
  TerminalAPI,
  TerminalCommand,
  TerminalCommandDefinition,
} from '@nameless-os/sdk';
import { parseTerminalArgs } from '@Apps/terminal/utils/parseTerminalArgs.util';
import { useTerminalStore } from '@Apps/terminal/stores/useTerminal.store';
import { CommandRegistry } from '@Apps/terminal/core/commandRegistry';
import { VariableManager } from '@Apps/terminal/core/variableManager';
import { InputInterceptor } from '@Apps/terminal/core/inputInterceptor';
import { OutputRenderer } from '@Apps/terminal/core/outputRenderer';
import { CommandParser } from '@Apps/terminal/core/commandParser';
import { BackgroundJobManager } from '@Apps/terminal/core/backgroundJobManager/backgroundJobManager';
import { ExecutionManager } from '@Apps/terminal/core/executionManager';
import { SessionStorageManager } from '@Apps/terminal/core/storageManager';

export class TerminalAPIImpl implements TerminalAPI {
  private readonly commandRegistry: CommandRegistry;
  private readonly variableManager: VariableManager;
  private readonly jobManager: BackgroundJobManager;
  private readonly inputInterceptor: InputInterceptor;
  private readonly outputRenderer: OutputRenderer;
  private readonly commandParser: CommandParser;
  private readonly executionManager: ExecutionManager;
  private readonly sessionStorageManager: SessionStorageManager;
  private readonly fileSystem: FileSystemAPI;
  private readonly achievementApi: AchievementAPI;

  constructor(fileSystem: FileSystemAPI, achievementApi: AchievementAPI) {
    this.commandRegistry = new CommandRegistry();
    this.variableManager = new VariableManager();
    this.jobManager = new BackgroundJobManager();
    this.outputRenderer = new OutputRenderer();
    this.inputInterceptor = new InputInterceptor(this.outputRenderer);
    this.commandParser = new CommandParser();
    this.executionManager = new ExecutionManager();
    this.sessionStorageManager = new SessionStorageManager();
    this.fileSystem = fileSystem;
    this.achievementApi = achievementApi;

    this.initializeBuiltinCommands();
  }

  registerCommand<T extends readonly CommandFlag[]>(command: TerminalCommand | TerminalCommandDefinition<T>): void {
    this.commandRegistry.register<T>(command);
  }

  async executeCommand(input: string, instanceId: AppInstanceId): Promise<void> {
    if (this.inputInterceptor.hasInterceptor(instanceId)) {
      this.inputInterceptor.handleInput(instanceId, input);
      return;
    }

    const ctx = this.createCommandContext(instanceId, input);

    const expandedInput = this.variableManager.expandVariables(input);

    if (expandedInput.endsWith(' &')) {
      const command = expandedInput.slice(0, -1).trim();
      await this.jobManager.createJob(command, ctx, this);
      return;
    }

    if (expandedInput.includes(' >> ') || expandedInput.includes(' > ')) {
      await this.executeRedirectionCommand(expandedInput, ctx);
      return;
    }

    if (expandedInput.includes('|')) {
      await this.executePipelineCommand(expandedInput, ctx);
      return;
    }

    await this.executeSingleCommand(expandedInput, ctx);
  }

  listCommands(): TerminalCommand[] {
    return this.commandRegistry.listAll();
  }

  private async executePipelineCommand(input: string, ctx: CommandContext): Promise<void> {
    const parts = input.split('|').map(p => p.trim());
    let stdin: string | undefined = undefined;

    for (const part of parts) {
      const outputLines: string[] = [];
      const localCtx: CommandContext = {
        ...ctx,
        input: stdin,
        print: (line: string) => outputLines.push(line),
      };
      console.log(outputLines, 'kkk');

      await this.executeSingleCommand(part, localCtx);
      stdin = outputLines.join('\n');
    }

    if (stdin) {
      ctx.io.print(stdin);
    }
  }

  private async executeRedirectionCommand(input: string, ctx: CommandContext): Promise<void> {
    const isAppend = input.includes(' >> ');
    const separator = isAppend ? ' >> ' : ' > ';
    const parts = input.split(separator);

    if (parts.length !== 2) {
      ctx.io.printError('❌ Invalid redirection syntax');
      return;
    }

    const command = parts[0].trim();
    const filename = parts[1].trim();

    if (!filename) {
      ctx.io.printError('❌ No output file specified');
      return;
    }

    const { getCurrentDirectory } = useTerminalStore.getState();
    const currentDir = getCurrentDirectory(ctx.info.appId) || '/home';

    let resolvedPath: string;
    if (filename.includes('/')) {
      const lastSlash = filename.lastIndexOf('/');
      const dirPath = filename.substring(0, lastSlash) || '/';
      const fileName = filename.substring(lastSlash + 1);

      const resolvedDir = await this.fileSystem.resolveAndValidatePath(currentDir, dirPath);
      resolvedPath = resolvedDir === '/' ? `/${fileName}` : `${resolvedDir}/${fileName}`;
    } else {
      resolvedPath = currentDir === '/' ? `/${filename}` : `${currentDir}/${filename}`;
    }

    const outputLines: string[] = [];
    const redirectCtx: CommandContext = {
      ...ctx,
      io: {
        ...ctx.io, print: (line: string) => outputLines.push(line),
      },
    };

    await this.executeSingleCommand(command, redirectCtx);

    const content = outputLines.join('\n');
    if (content) {
      if (isAppend) {
        let existingContent = '';
        if (await this.fileSystem.exists(resolvedPath)) {
          existingContent = await this.fileSystem.readFile(resolvedPath);
        }
        const newContent = existingContent ? `${existingContent}\n${content}` : content;
        await this.fileSystem.writeFile(resolvedPath, newContent);
        ctx.io.print(`Output appended to ${resolvedPath}`);
      } else {
        await this.fileSystem.writeFile(resolvedPath, content);
        ctx.io.print(`Output written to ${resolvedPath}`);
      }
    }
  }

  private async executeSingleCommand(input: string, ctx: CommandContext): Promise<void> {
    if (this.variableManager.isVariableAssignment(input) || this.variableManager.isEnvVariableAssignment(input)) {
      this.variableManager.handleAssignment(input, ctx);
      return;
    }

    let rawArgs: string[];
    try {
      rawArgs = this.commandParser.parse(input.trim());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      ctx.io.printError(`❌ Error: ${errorMessage}`);
      return;
    }

    const rawCommandName = rawArgs[0];
    if (!rawCommandName) return;

    const expandedCommand = this.commandRegistry.resolveAlias(rawCommandName);
    if (expandedCommand !== rawCommandName) {
      const remaining = rawArgs.slice(1).join(' ');
      const newInput = `${expandedCommand}${remaining ? ' ' + remaining : ''}`;
      await this.executeSingleCommand(newInput, ctx);
      return;
    }

    const command = this.commandRegistry.getCommand(rawCommandName);
    if (!command) {
      ctx.io.printError(`❌ Unknown command: "${rawCommandName}"`);
      this.achievementApi.updateProgress('terminal_first_error', 1);
      return;
    }

    let args;
    try {
      args = this.normalizeArgs(
        parseTerminalArgs(rawArgs, command.flags ?? []),
        ctx,
      );
      args.positional.shift();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      ctx.io.printError(`❌ Error: ${errorMessage}`);
      return;
    }

    try {
      await command.handler(args, ctx);
      this.achievementApi.updateProgress('terminal_first_command', 1);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[terminal] Error executing command "${rawCommandName}":`, err);
      ctx.io.printError(`❌ Error: ${errorMessage}`);
      this.achievementApi.updateProgress('terminal_first_error', 1);
    } finally {
      this.executionManager.finishExecution(ctx.info.appId);
    }
  }

  private createCommandContext(instanceId: AppInstanceId, input: string): CommandContext {
    const parts = input.trim().split(/\s+/);
    return {
      info: {
        appId: instanceId,
        fullInput: input,
        name: parts[0] || '',
        args: parts.slice(1),
        startTime: Number(new Date()),
      },
      io: {
        print: ((arg: string) => this.outputRenderer.print(arg, instanceId)),
        printError: (arg: string) => this.outputRenderer.printError(arg, instanceId),
        awaitInput: () => this.inputInterceptor.awaitInput(instanceId),
        awaitConfirm: (message: string) =>this.inputInterceptor.awaitConfirm(message, instanceId),
      },
      ui: {
        updateMessage: (groupId: string, newContent: string) => this.outputRenderer.updateMessage(groupId, newContent, instanceId),
        deleteMessage: (groupId: string) => this.outputRenderer.deleteMessage(groupId, instanceId),
        setPager: (pager: PagerState) => useTerminalStore.getState().setPager(instanceId, pager),
        progress: {
          start: (total?: number, message?: string) => {}, // TODO
          update: (current: number, message?: string) => {}, // TODO
          finish: (message?: string) => {}, // TODO
        },
        status: {
          set: (message: string) => {}, // TODO
          clear: () => {}, // TODO
        },
      },
      alias: {
        register: (from: string, to: string) => this.commandRegistry.registerAlias(from, to),
        remove: (from: string) => this.commandRegistry.removeAlias(from),
        get: () => this.commandRegistry.getAliases(),
        list: () => {
          const aliases = this.commandRegistry.getAliases();
          return Object.entries(aliases).map(([from, to]) => ({ from, to }));
        },
        exists: (alias: string) => {
          const aliases = this.commandRegistry.getAliases();
          return aliases.hasOwnProperty(alias);
        },
      },
      execution: this.executionManager.createExecution(instanceId),
      env: this.variableManager.getEnvMethods(),
      storage: this.sessionStorageManager.getStorageForInstance(instanceId),
      history: {
        add: (command: string) => {},  // TODO
        get: (count?: number) => {},  // TODO
        search: (pattern: string) => {},  // TODO
        clear: () => {},  // TODO
      },
    };
  }

  private normalizeArgs(args: ReturnType<typeof parseTerminalArgs>, ctx: CommandContext) {
    if (args.positional.length === 1 && ctx.input) {
      args.positional.push(ctx.input);
    }
    return args;
  }

  private initializeBuiltinCommands(): void {
    this.jobManager.registerCommands(this);
  }
}
