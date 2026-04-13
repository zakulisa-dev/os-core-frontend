import { CommandContext, TerminalAPI } from '@nameless-os/sdk';

function printAliases(ctx: CommandContext) {
  const aliases = ctx.alias.get();
  if (Object.keys(aliases).length === 0) {
    ctx.io.print("No aliases defined.");
  } else {
    ctx.io.print("Aliases:");
    Object.entries(aliases).forEach(([key, val]) =>
      ctx.io.print(`- ${key} → ${val}`)
    );
  }
}

function removeAlias(args: any, ctx: CommandContext) {
  const nameToRemove = args.positional[1];
  const removed = ctx.alias.remove(nameToRemove);
  if (removed) {
    ctx.io.print(`Alias "${nameToRemove}" removed.`);
  } else {
    ctx.io.print(`Alias "${nameToRemove}" not found.`);
  }
}

const initAliasCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "alias",
    description: "Manage command aliases. Usage: alias [name] [target]",
    handler: (args, ctx) => {
      if (args.positional.length === 0) {
        printAliases(ctx);
        return;
      }

      if (args.positional[0] === "rm" && args.positional[1]) {
        removeAlias(args, ctx);
        return;
      }

      if (args.positional.length < 2) {
        ctx.io.print("Usage: alias [name] [target]");
        return;
      }

      const [aliasName, ...targetParts] = args.positional;

      if (aliasName === 'alias') {
        ctx.io.print("⚠️ 'alias' is a reserved keyword. Please choose a different value.");
        return;
      }

      const targetCommand = targetParts.join(" ");
      ctx.alias.register(aliasName, targetCommand);
      ctx.io.print(`Alias added: ${aliasName} → ${targetCommand}`);
    },
  });
};

export { initAliasCommand };
