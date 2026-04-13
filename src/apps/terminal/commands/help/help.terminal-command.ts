import { CommandContext, defineFlags, FlagsToObject, TerminalAPI, TerminalCommand } from '@nameless-os/sdk';

const flagsDef = defineFlags([
  {
    name: 'command',
    aliases: ['c'],
    type: 'string',
    description: 'Show detailed help for a specific command'
  },
  {
    name: 'search',
    aliases: ['s'],
    type: 'string',
    description: 'Search commands by name or description'
  },
  {
    name: 'category',
    aliases: ['cat'],
    type: 'string',
    description: 'Filter commands by category/app',
    values: ['system', 'utils', 'fun', 'dev', 'all'],
    default: 'all'
  },
  {
    name: 'format',
    aliases: ['f'],
    type: 'string',
    description: 'Output format',
    values: ['default', 'detailed', 'compact', 'json'],
    default: 'default'
  },
  {
    name: 'show-hidden',
    aliases: ['h'],
    type: 'boolean',
    description: 'Include hidden commands',
    default: false
  },
  {
    name: 'no-pager',
    aliases: ['np'],
    type: 'boolean',
    description: 'Disable pagination',
    default: false
  },
  {
    name: 'page-size',
    aliases: ['ps'],
    type: 'number',
    description: 'Number of commands per page (5-50)',
    default: 10
  },
  {
    name: 'sort',
    type: 'string',
    description: 'Sort commands by',
    values: ['name', 'app', 'description'],
    default: 'name'
  },
  {
    name: 'stats',
    type: 'boolean',
    description: 'Show command statistics',
    default: false
  },
  {
    name: 'examples',
    aliases: ['ex'],
    type: 'boolean',
    description: 'Show usage examples for commands',
    default: false
  }
]);

type HelpFlags = FlagsToObject<typeof flagsDef>;

function initHelpCommand(terminalApi: TerminalAPI) {
  terminalApi.registerCommand({
    name: "help",
    description: "List and search available commands with advanced filtering options",
    flags: flagsDef,
    positionalArgs: [
      {
        name: 'command',
        description: 'Command name to get detailed help for',
        required: false
      }
    ],
    handler: ({ flags, positional }, ctx) => {
      const targetCommand = positional[0] || flags.command;

      if (targetCommand) {
        showCommandHelp(targetCommand, ctx, flags, terminalApi);
        return;
      }

      const allCommands = terminalApi.listCommands();

      if (flags.stats) {
        showCommandStats(allCommands, ctx);
        return;
      }

      let commands = filterCommands(allCommands, flags);

      if (flags.search) {
        const searchTerm = flags.search.toLowerCase();
        commands = commands.filter(cmd =>
          cmd.name.toLowerCase().includes(searchTerm) ||
          (cmd.description && cmd.description.toLowerCase().includes(searchTerm))
        );

        if (commands.length === 0) {
          ctx.io.print(`🔍 No commands found matching "${flags.search}"`);
          return;
        }

        ctx.io.print(`🔍 Found ${commands.length} command(s) matching "${flags.search}":\n`);
      }

      commands = sortCommands(commands, flags.sort);

      if (flags.format === 'json') {
        const jsonOutput = commands.map(cmd => ({
          name: cmd.name,
          description: cmd.description || '',
          app: cmd.app || 'system',
          hidden: cmd.hidden || false,
          flags: cmd.flags?.map(flag => ({
            name: flag.name,
            type: flag.type,
            description: flag.description,
            aliases: flag.aliases
          })) || []
        }));
        ctx.io.print(JSON.stringify(jsonOutput, null, 2));
        return;
      }

      const lines = formatCommandList(commands, flags);

      if (flags['no-pager'] || lines.length <= flags['page-size']) {
        lines.forEach(ctx.io.print);
        showFooter(commands, flags, ctx);
      } else {
        const pageSize = Math.max(5, Math.min(50, flags['page-size']));
        const page = lines.slice(0, pageSize);

        page.forEach(ctx.io.print);
        showFooter(commands, flags, ctx);

        if (lines.length > pageSize) {
          ctx.io.print(`\n📄 Showing ${pageSize} of ${lines.length} commands (type "next" for more)`);
          ctx.setPager?.({
            lines,
            currentPage: 1,
            pageSize,
          });
        }
      }
    }
  });

  function showCommandHelp(commandName: string, ctx: CommandContext, flags: HelpFlags, terminalApi: TerminalAPI) {
    const allCommands = terminalApi.listCommands();
    const command = allCommands.find(cmd => cmd.name === commandName);

    if (!command) {
      ctx.io.print(`❌ Command '${commandName}' not found.`);

      const suggestions = allCommands
        .filter(cmd => cmd.name.includes(commandName) ||
          (cmd.description && cmd.description.toLowerCase().includes(commandName.toLowerCase())))
        .slice(0, 3);

      if (suggestions.length > 0) {
        ctx.io.print(`\n💡 Did you mean:`);
        suggestions.forEach(cmd => ctx.io.print(`   ${cmd.name} - ${cmd.description || 'No description'}`));
      }
      return;
    }

    ctx.io.print(`📋 Command: ${command.name}`);
    ctx.io.print("─".repeat(40));

    if (command.description) {
      ctx.io.print(`Description: ${command.description}`);
    }

    if (command.app) {
      ctx.io.print(`App: ${command.app}`);
    }

    if (command.hidden) {
      ctx.io.print(`🔒 Hidden command`);
    }

    if (command.flags && command.flags.length > 0) {
      ctx.io.print(`\n🏁 Flags:`);
      command.flags.forEach(flag => {
        const aliases = flag.aliases ? ` (${flag.aliases.map(a => `-${a}`).join(', ')})` : '';
        const required = flag.required ? ' [REQUIRED]' : '';
        const defaultValue = flag.default !== undefined ? ` (default: ${flag.default})` : '';

        ctx.io.print(`   --${flag.name}${aliases}${required}`);
        if (flag.description) {
          ctx.io.print(`     ${flag.description}${defaultValue}`);
        }
        if (flag.values) {
          ctx.io.print(`     Values: ${flag.values.join(', ')}`);
        }
      });
    }

    if (command.positionalArgs && command.positionalArgs.length > 0) {
      ctx.io.print(`\n📥 Arguments:`);
      command.positionalArgs.forEach(arg => {
        const required = arg.required ? ' [REQUIRED]' : ' [OPTIONAL]';
        ctx.io.print(`   ${arg.name}${required}`);
        if (arg.description) {
          ctx.io.print(`     ${arg.description}`);
        }
      });
    }

    if (flags.examples) {
      const examples = getCommandExamples(command.name);
      if (examples.length > 0) {
        ctx.io.print(`\n💡 Examples:`);
        examples.forEach(example => ctx.io.print(`   ${example}`));
      }
    }
  }

  function filterCommands(commands: TerminalCommand[], flags: HelpFlags) {
    let filtered = commands;

    if (!flags['show-hidden']) {
      filtered = filtered.filter(cmd => !cmd.hidden);
    }

    if (flags.category !== 'all') {
      const categoryMap = {
        'system': ['', 'system', undefined],
        'utils': ['utils', 'utility'],
        'fun': ['fun', 'game', 'entertainment'],
        'dev': ['dev', 'development', 'coding']
      };

      const validApps = categoryMap[flags.category] || [flags.category];
      filtered = filtered.filter(cmd => validApps.includes(cmd.app));
    }

    return filtered;
  }

  function sortCommands(commands: TerminalCommand[], sortBy) {
    return commands.sort((a, b) => {
      switch (sortBy) {
        case 'app':
          return (a.app || '').localeCompare(b.app || '');
        case 'description':
          return (a.description || '').localeCompare(b.description || '');
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }

  function formatCommandList(commands: TerminalCommand[], flags: HelpFlags) {
    switch (flags.format) {
      case 'compact':
        return commands.map(cmd => cmd.name);

      case 'detailed':
        return commands.flatMap(cmd => {
          const lines = [`📌 ${cmd.name}`];
          if (cmd.description) {
            lines.push(`   ${cmd.description}`);
          }
          if (cmd.app) {
            lines.push(`   App: ${cmd.app}`);
          }
          if (cmd.flags && cmd.flags.length > 0) {
            lines.push(`   Flags: ${cmd.flags.length} available`);
          }
          lines.push('');
          return lines;
        });

      case 'default':
      default:
        return commands.map(cmd => {
          const app = cmd.app ? ` [${cmd.app}]` : '';
          const description = cmd.description ? `: ${cmd.description}` : '';
          return `• ${cmd.name}${app}${description}`;
        });
    }
  }

  function showCommandStats(commands: TerminalCommand[], ctx: CommandContext) {
    const total = commands.length;
    const visible = commands.filter(cmd => !cmd.hidden).length;
    const hidden = total - visible;

    const byApp = commands.reduce((acc, cmd) => {
      const app = cmd.app || 'system';
      acc[app] = (acc[app] || 0) + 1;
      return acc;
    }, {});

    const withFlags = commands.filter(cmd => cmd.flags && cmd.flags.length > 0).length;
    const withArgs = commands.filter(cmd => cmd.positionalArgs && cmd.positionalArgs.length > 0).length;

    ctx.io.print("📊 COMMAND STATISTICS");
    ctx.io.print("─".repeat(25));
    ctx.io.print(`Total commands: ${total}`);
    ctx.io.print(`Visible: ${visible}`);
    ctx.io.print(`Hidden: ${hidden}`);
    ctx.io.print(`With flags: ${withFlags}`);
    ctx.io.print(`With arguments: ${withArgs}`);
    ctx.io.print("");
    ctx.io.print("📦 By category/app:");
    Object.entries(byApp)
      .sort(([,a], [,b]) => b - a)
      .forEach(([app, count]) => {
        ctx.io.print(`   ${app}: ${count}`);
      });
  }

  function showFooter(commands: TerminalCommand[], flags: HelpFlags, ctx: CommandContext) {
    if (flags.format !== 'json' && flags.format !== 'compact') {
      ctx.io.print("");
      ctx.io.print(`💡 Showing ${commands.length} command(s)`);
      ctx.io.print("📖 Use 'help <command>' for detailed information");
      ctx.io.print("🔍 Use 'help --search <term>' to search commands");

      if (!flags['show-hidden']) {
        ctx.io.print("👁️ Use 'help --show-hidden' to see hidden commands");
      }
    }
  }

  function getCommandExamples(commandName: string) {
    const examples = {
      'help': [
        'help',
        'help ls',
        'help --search file',
        'help --category utils',
        'help --format detailed --show-hidden'
      ],
      'joke': [
        'joke',
        'joke -c javascript -n 3',
        'joke --search bug',
        'joke --interactive --no-repeat'
      ],
      'idkfa': [
        'idkfa',
        'idkfa --silent',
        'idkfa --volume 0.5',
        'idkfa --disable'
      ]
    };

    return examples[commandName] || [];
  }
}

export { initHelpCommand };
