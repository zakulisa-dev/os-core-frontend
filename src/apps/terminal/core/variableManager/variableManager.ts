import { CommandContext } from '@nameless-os/sdk';

export class VariableManager {
  private variables: Record<string, string> = {};
  private envVariables: Record<string, string> = {};

  constructor() {
    this.initializeDefaultEnvVars();
  }

  setVariable(name: string, value: string): void {
    this.variables[name] = value;
  }

  getVariable(name: string): string | undefined {
    return this.variables[name];
  }

  getAllVariables(): Record<string, string> {
    return { ...this.variables };
  }

  setEnvVariable(key: string, value: string): void {
    this.envVariables[key] = value;
  }

  getEnvVariable(key: string): string | undefined {
    return this.envVariables[key];
  }

  hasEnvVariable(key: string): boolean {
    return key in this.envVariables;
  }

  getAllEnvVariables(): Record<string, string> {
    return { ...this.envVariables };
  }

  getEnvMethods() {
    return {
      get: (key: string) => this.getEnvVariable(key) || '',
      set: (key: string, value: string) => this.setEnvVariable(key, value),
      has: (key: string) => this.hasEnvVariable(key),
      getAll: () => this.getAllEnvVariables(),
    };
  }

  expandVariables(input: string): string {
    return input
      .replace(/\$ENV\{([a-zA-Z_][a-zA-Z0-9_]*)}/g, (_, varName) => this.envVariables[varName] ?? '')
      .replace(/\$\{ENV:([a-zA-Z_][a-zA-Z0-9_]*)}/g, (_, varName) => this.envVariables[varName] ?? '')
      .replace(/\$\{([a-zA-Z_][a-zA-Z0-9_]*)}/g, (_, varName) => {
        return this.variables[varName] ?? this.envVariables[varName] ?? '';
      })
      .replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, varName) => {
        return this.variables[varName] ?? this.envVariables[varName] ?? '';
      });
  }

  isVariableAssignment(input: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*=/.test(input);
  }

  isEnvVariableAssignment(input: string): boolean {
    return /^export\s+[a-zA-Z_][a-zA-Z0-9_]*=/.test(input);
  }

  handleAssignment(input: string, ctx: CommandContext): void {
    if (this.isEnvVariableAssignment(input)) {
      const cleanInput = input.replace(/^export\s+/, '');
      const [left, ...rest] = cleanInput.split('=');
      const value = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
      const varName = left.trim();

      this.setEnvVariable(varName, value);
      ctx.io.print(`✔ Environment variable ${varName} exported as "${value}"`);
    } else {
      const [left, ...rest] = input.split('=');
      const value = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
      const varName = left.trim();

      this.setVariable(varName, value);
      ctx.io.print(`✔ Variable ${varName} set to "${value}"`);
    }
  }

  private initializeDefaultEnvVars(): void {
    this.envVariables.USER = 'user';
    this.envVariables.HOME = '/home';
    this.envVariables.PATH = '/bin:/usr/bin';
    this.envVariables.PWD = '/home';
    this.envVariables.SHELL = '/bin/nameless-os-shell';
    this.envVariables.TERM = 'nameless-os-terminal';
  }

  updatePWD(newPath: string): void {
    this.setEnvVariable('PWD', newPath);
  }
}