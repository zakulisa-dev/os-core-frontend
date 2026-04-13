import { CommandContext, defineFlags, FlagsToObject, TerminalAPI } from '@nameless-os/sdk';
import { fortuneCategories } from '@Apps/terminal/commands/fortune/fortune.data';
import { FortuneCategory, FortuneHistory, FortuneMood } from '@Apps/terminal/commands/fortune/fortune.types';

const allFortunes = Object.values(fortuneCategories).flat();

let fortuneHistory: FortuneHistory = {
  shown: new Set(),
  dailyCount: 0,
  lastDate: null,
  favorites: new Set(),
  stats: {
    totalShown: 0,
    byCategory: {
      [FortuneCategory.Programming]: 0,
      [FortuneCategory.Productivity]: 0,
      [FortuneCategory.Debugging]: 0,
      [FortuneCategory.Workflow]: 0,
      [FortuneCategory.Success]: 0,
      [FortuneCategory.Wisdom]: 0,
      [FortuneCategory.Motivational]: 0,
      [FortuneCategory.All]: 0,
    }
  }
};

const flagsDef = defineFlags([
  {
    name: 'category',
    aliases: ['c'],
    type: 'string',
    description: 'Category of fortunes',
    values: [...Object.values(FortuneCategory)],
    default: 'all'
  },
  {
    name: 'count',
    aliases: ['n'],
    type: 'number',
    description: 'Number of fortunes to show (1-5)',
    default: 1
  },
  {
    name: 'long',
    aliases: ['l'],
    type: 'boolean',
    description: 'Show longer, wisdom-style fortunes',
    default: false
  },
  {
    name: 'short',
    aliases: ['s'],
    type: 'boolean',
    description: 'Show shorter, quick fortunes',
    default: false
  },
  {
    name: 'no-repeat',
    aliases: ['nr'],
    type: 'boolean',
    description: 'Avoid repeating recent fortunes',
    default: false
  },
  {
    name: 'daily',
    aliases: ['d'],
    type: 'boolean',
    description: 'Show daily fortune (same all day)',
    default: false
  },
  {
    name: 'stats',
    type: 'boolean',
    description: 'Show fortune statistics',
    default: false
  },
  {
    name: 'list',
    type: 'boolean',
    description: 'List all available categories',
    default: false
  },
  {
    name: 'search',
    type: 'string',
    description: 'Search fortunes by keyword'
  },
  {
    name: 'format',
    aliases: ['f'],
    type: 'string',
    description: 'Output format',
    values: ['default', 'plain', 'box', 'banner'],
    default: 'default'
  },
  {
    name: 'add-favorite',
    aliases: ['fav'],
    type: 'boolean',
    description: 'Add last shown fortune to favorites',
    default: false
  },
  {
    name: 'favorites',
    type: 'boolean',
    description: 'Show only favorite fortunes',
    default: false
  },
  {
    name: 'reset',
    aliases: ['r'],
    type: 'boolean',
    description: 'Reset fortune history and stats',
    default: false
  },
  {
    name: 'mood',
    aliases: ['m'],
    type: 'string',
    description: 'Fortune based on mood',
    values: [...Object.values(FortuneMood)]
  },
  {
    name: 'time-based',
    aliases: ['t'],
    type: 'boolean',
    description: 'Fortune appropriate for current time',
    default: false
  }
]);

type FortuneFlags = FlagsToObject<typeof flagsDef>;

const initFortuneCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "fortune",
    description: "Get personalized programming fortunes with categories, moods, and smart features",
    flags: flagsDef,
    handler: (args, ctx) => {
      const { flags } = args;

      updateDailyStats();

      if (flags.reset) {
        fortuneHistory = {
          shown: new Set(),
          dailyCount: 0,
          lastDate: null,
          favorites: new Set(),
          stats: { totalShown: 0, byCategory: {
              [FortuneCategory.Programming]: 0,
              [FortuneCategory.Productivity]: 0,
              [FortuneCategory.Debugging]: 0,
              [FortuneCategory.Workflow]: 0,
              [FortuneCategory.Success]: 0,
              [FortuneCategory.Wisdom]: 0,
              [FortuneCategory.Motivational]: 0,
              [FortuneCategory.All]: 0,
            } }
        };
        ctx.io.print("🔄 Fortune history and statistics reset!");
        return;
      }

      if (flags.stats) {
        showStats(ctx);
        return;
      }

      if (flags.list) {
        listCategories(ctx);
        return;
      }

      if (flags['add-favorite']) {
        ctx.io.print("⭐ Feature not fully implemented yet - would add last fortune to favorites");
        return;
      }

      if (flags.search) {
        searchFortunes(flags.search, ctx, flags);
        return;
      }

      let fortunePool = getFortunes(flags);

      fortunePool = applyFilters(fortunePool, flags);

      if (fortunePool.length === 0) {
        ctx.io.print("🔮 No fortunes available with current filters. Try different options!");
        return;
      }

      const count = Math.max(1, Math.min(5, flags.count));
      const fortunes = getSelectedFortunes(fortunePool, count, flags);

      displayFortunes(fortunes, flags, ctx);

      updateStats(fortunes, flags);
    }
  });

  function updateDailyStats() {
    const today = new Date().toDateString();
    if (fortuneHistory.lastDate !== today) {
      fortuneHistory.dailyCount = 0;
      fortuneHistory.lastDate = today;
    }
  }

  function getFortunes(flags: FortuneFlags) {
    if (flags.favorites) {
      return Array.from(fortuneHistory.favorites);
    }

    if (flags.mood) {
      return getFortunesByMood(flags.mood);
    }

    if (flags['time-based']) {
      return getTimeBasedFortunes();
    }

    if (flags.category === 'all') {
      return allFortunes;
    }

    return fortuneCategories[flags.category] || fortuneCategories.programming;
  }

  function getFortunesByMood(mood: FortuneMood) {
    const moodMapping: Record<FortuneMood, FortuneCategory[]> = {
      happy: [FortuneCategory.Success, FortuneCategory.Motivational],
      motivated: [FortuneCategory.Motivational, FortuneCategory.Success, FortuneCategory.Productivity],
      stressed: [FortuneCategory.Wisdom, FortuneCategory.Motivational],
      tired: [FortuneCategory.Motivational, FortuneCategory.Productivity],
      focused: [FortuneCategory.Motivational, FortuneCategory.Productivity],
      creative: [FortuneCategory.Wisdom, FortuneCategory.Motivational, FortuneCategory.Success]
    };

    const categories = moodMapping[mood] || [FortuneCategory.Motivational];
    return categories.flatMap(category => fortuneCategories[category] || []);
  }

  function getTimeBasedFortunes() {
    const hour = new Date().getHours();

    if (hour < 10) {
      return fortuneCategories.motivational;
    } else if (hour < 14) {
      return fortuneCategories.productivity;
    } else if (hour < 18) {
      return fortuneCategories.programming;
    } else {
      return fortuneCategories.wisdom;
    }
  }

  function applyFilters(fortunes: string[], flags: FortuneFlags) {
    let filtered = [...fortunes];

    if (flags.long) {
      filtered = filtered.filter(f => f.length > 80);
    } else if (flags.short) {
      filtered = filtered.filter(f => f.length <= 50);
    }

    if (flags['no-repeat']) {
      filtered = filtered.filter(f => !fortuneHistory.shown.has(f));

      if (filtered.length === 0) {
        fortuneHistory.shown.clear();
        filtered = [...fortunes];
      }
    }

    return filtered;
  }

  function getSelectedFortunes(pool: string[], count: number, flags: FortuneFlags) {
    if (flags.daily) {
      const seed = new Date().toDateString();

      const hash = seed.split('').reduce((acc, char) => {
        const next = ((acc << 5) - acc) + char.charCodeAt(0);
        return next & next;
      }, 0);

      const index = Math.abs(hash) % pool.length;

      return [pool[index]];
    }

    const selected = [];
    const usedIndices = new Set();

    for (let i = 0; i < count && selected.length < pool.length; i++) {
      let index;
      do {
        index = Math.floor(Math.random() * pool.length);
      } while (usedIndices.has(index));

      usedIndices.add(index);
      selected.push(pool[index]);
    }

    return selected;
  }

  function displayFortunes(fortunes: string[], flags: FortuneFlags, ctx: CommandContext) {
    fortunes.forEach((fortune, index) => {
      const formatted = formatFortune(fortune, flags.format, index + 1, fortunes.length);
      ctx.io.print(formatted);
    });

    if (flags.daily) {
      ctx.io.print("📅 This is your fortune for today!");
    }

    if (flags.mood) {
      ctx.io.print(`🎭 Fortune selected for mood: ${flags.mood}`);
    }

    if (flags['time-based']) {
      const hour = new Date().getHours();
      const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      ctx.io.print(`🕐 ${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} fortune`);
    }
  }

  function formatFortune(fortune: string, format: string, number: number, total: number) {
    switch (format) {
      case 'plain':
        return fortune;

      case 'box':
        const line = '─'.repeat(Math.min(fortune.length + 4, 60));
        return `┌${line}┐\n│ 🔮 ${fortune.padEnd(Math.min(fortune.length, 56))} │\n└${line}┘`;

      case 'banner':
        return `\n🌟 ${'═'.repeat(20)} FORTUNE ${'═'.repeat(20)} 🌟\n   ${fortune}\n${'═'.repeat(50)}\n`;

      case 'default':
      default:
        const icon = total > 1 ? `[${number}/${total}]` : '🔮';
        return `${icon} ${fortune}`;
    }
  }

  function searchFortunes(searchTerm: string, ctx: CommandContext, flags: FortuneFlags) {
    const term = searchTerm.toLowerCase();
    const matches = allFortunes.filter(fortune =>
      fortune.toLowerCase().includes(term)
    );

    if (matches.length === 0) {
      ctx.io.print(`🔍 No fortunes found containing "${searchTerm}"`);
      return;
    }

    ctx.io.print(`🔍 Found ${matches.length} fortune(s) containing "${searchTerm}":\n`);
    matches.slice(0, 10).forEach((fortune, index) => {
      const formatted = formatFortune(fortune, flags.format, index + 1, Math.min(matches.length, 10));
      ctx.io.print(formatted);
    });

    if (matches.length > 10) {
      ctx.io.print(`\n... and ${matches.length - 10} more. Use more specific search terms.`);
    }
  }

  function showStats(ctx: CommandContext) {
    const totalFortunes = allFortunes.length;
    const categoryCounts = Object.entries(fortuneCategories)
      .map(([cat, fortunes]) => `  ${cat}: ${fortunes.length} fortunes`)
      .join('\n');

    ctx.io.print("📊 Fortune Statistics:");
    ctx.io.print("─".repeat(25));
    ctx.io.print(`Total available: ${totalFortunes}`);
    ctx.io.print(`Daily count: ${fortuneHistory.dailyCount}`);
    ctx.io.print(`Total shown: ${fortuneHistory.stats.totalShown}`);
    ctx.io.print(`Shown today: ${fortuneHistory.dailyCount}`);
    ctx.io.print(`In history: ${fortuneHistory.shown.size}`);
    ctx.io.print(`Favorites: ${fortuneHistory.favorites.size}`);
    ctx.io.print("\n📂 By category:");
    ctx.io.print(categoryCounts);
  }

  function listCategories(ctx: CommandContext) {
    ctx.io.print("📂 Available Fortune Categories:");
    ctx.io.print("─".repeat(30));

    Object.entries(fortuneCategories).forEach(([category, fortunes]) => {
      const description = getCategoryDescription(category as FortuneCategory);
      ctx.io.print(`• ${category} (${fortunes.length}) - ${description}`);
    });

    ctx.io.print("\n💡 Use --category or -c to specify a category");
    ctx.io.print("Example: fortune -c wisdom -n 2");
  }

  function getCategoryDescription(category: FortuneCategory) {
    const descriptions: Record<FortuneCategory, string> = {
      [FortuneCategory.Programming]: "Code, bugs, and development life",
      [FortuneCategory.Productivity]: "Getting things done efficiently",
      [FortuneCategory.Debugging]: "Finding and fixing issues",
      [FortuneCategory.Workflow]: "Development process and tools",
      [FortuneCategory.Success]: "Achievements and victories",
      [FortuneCategory.Wisdom]: "Programming philosophy and insights",
      [FortuneCategory.Motivational]: "Inspiration and encouragement",
      [FortuneCategory.All]: "Error",
    };
    return descriptions[category] || "Programming-related wisdom";
  }

  function updateStats(fortunes: string[], flags: FortuneFlags) {
    fortuneHistory.stats.totalShown += fortunes.length;
    fortuneHistory.dailyCount += fortunes.length;

    const category = flags.category || FortuneCategory.All;
    fortuneHistory.stats.byCategory[category] =
      (fortuneHistory.stats.byCategory[category] || 0) + fortunes.length;

    if (flags['no-repeat']) {
      fortunes.forEach(fortune => {
        fortuneHistory.shown.add(fortune);

        if (fortuneHistory.shown.size > 100) {
          const firstFortune = fortuneHistory.shown.values().next().value;
          if (typeof firstFortune === 'string') {
            fortuneHistory.shown.delete(firstFortune);
          }
        }
      });
    }
  }
};

export { initFortuneCommand };