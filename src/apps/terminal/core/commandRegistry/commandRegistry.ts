import {
  CommandFlag,
  defineCommand,
  TerminalCommand,
  TerminalCommandDefinition,
} from '@nameless-os/sdk';

export class CommandRegistry {
  private commands: Map<string, TerminalCommand> = new Map();
  private aliases: Record<string, string> = {
    cls: "clear",
  };

  register<T extends readonly CommandFlag[]>(command: TerminalCommand | TerminalCommandDefinition<T>): void {
    const normalizedCommand = Array.isArray(command.flags)
      ? defineCommand(command as TerminalCommandDefinition<T>)
      : command as TerminalCommand;

    if (this.commands.has(normalizedCommand.name)) {
      console.warn(`[terminal] Command "${normalizedCommand.name}" already exists. Overwriting.`);
    }

    this.commands.set(normalizedCommand.name, normalizedCommand);
  }

  getCommand(name: string): TerminalCommand | undefined {
    return this.commands.get(name);
  }

  listAll(): TerminalCommand[] {
    return Array.from(this.commands.values());
  }

  resolveAlias(name: string): string {
    let resolved = name;
    let depth = 0;
    const maxDepth = 10;

    while (this.aliases[resolved] && depth < maxDepth) {
      resolved = this.aliases[resolved];
      depth++;
    }

    if (depth >= maxDepth) {
      console.warn(`[terminal] Max alias resolution depth reached for "${name}"`);
    }

    return resolved;
  }

  registerAlias(from: string, to: string): boolean {
    this.aliases[from] = to;
    return true;
  }

  removeAlias(from: string): boolean {
    if (from in this.aliases) {
      delete this.aliases[from];
      return true;
    }
    return false;
  }

  getAliases(): Record<string, string> {
    return { ...this.aliases };
  }

  hasCommand(name: string): boolean {
    return this.commands.has(name);
  }

  unregister(name: string): boolean {
    return this.commands.delete(name);
  }

  getCommandNames(): string[] {
    return Array.from(this.commands.keys());
  }

  findCommands(pattern: string): TerminalCommand[] {
    const regex = new RegExp(pattern, 'i');
    return this.listAll().filter(cmd =>
      regex.test(cmd.name) || regex.test(cmd.description || '')
    );
  }
}
