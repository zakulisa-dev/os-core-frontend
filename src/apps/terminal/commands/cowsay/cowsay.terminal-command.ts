import { cowsayAnimals, getCowsayAnimalByFlags } from '@Apps/terminal/commands/cowsay/cowsayAnimals';
import { wrapTerminalText } from '@Apps/terminal/utils/wrapText.util';
import { CommandContext, defineFlags, TerminalAPI } from '@nameless-os/sdk';
import { CowsayAnimal } from '@Apps/terminal/commands/cowsay/cowsayAnimal.enum';

interface Emotion {
  eyes: string;
  tongue: string;
}

interface Animal {
  name: string;
  rarity: string;
  defaultText: string;
  art: string[];
}

interface ExtendedAnimals {
  emotions: Record<string, Emotion>;
  extras: Record<string, Animal>;
  colorSchemes: Record<string, string[]>;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: () => boolean;
}

const extendedAnimals: ExtendedAnimals = {
  emotions: {
    happy: { eyes: '^^', tongue: 'U ' },
    sad: { eyes: 'TT', tongue: '  ' },
    angry: { eyes: '><', tongue: '  ' },
    dead: { eyes: 'XX', tongue: 'U ' },
    tired: { eyes: '--', tongue: '  ' },
    surprised: { eyes: 'OO', tongue: '  ' },
    wink: { eyes: ';)', tongue: '  ' },
    love: { eyes: '♥♥', tongue: '  ' },
    crazy: { eyes: '@@', tongue: 'p ' }
  },

  extras: {
    dragon: {
      name: 'dragon',
      art: [
        '        \\   ^__^',
        '         \\  (oo)\\_______',
        '            (__)\\       )\\/\\',
        '             U  ||----w |',
        '                ||     ||',
        '      🔥🔥🔥🔥🔥🔥🔥🔥🔥'
      ],
      rarity: 'legendary',
      defaultText: 'I am the mighty dragon! 🐉'
    },
    unicorn: {
      name: 'unicorn',
      art: [
        '         \\   ,;,,;,',
        '          \\  \\  o o  /',
        '             \\ \\_V_/ /',
        '              )  ^  (',
        '             /|  |  |\\',
        '            / |🦄| \\ \\'
      ],
      rarity: 'rare',
      defaultText: 'Believe in magic! ✨'
    },
    robot: {
      name: 'robot',
      art: [
        '        \\  ┌─────┐',
        '         \\ │ ● ● │',
        '            │  ─  │',
        '            └─┬─┬─┘',
        '              │ │',
        '            ┌─┴─┴─┐',
        '            │     │',
        '            └─────┘'
      ],
      rarity: 'uncommon',
      defaultText: 'BEEP BOOP! Computing...'
    }
  },

  colorSchemes: {
    rainbow: ['\x1b[31m', '\x1b[33m', '\x1b[32m', '\x1b[36m', '\x1b[34m', '\x1b[35m'],
    fire: ['\x1b[31m', '\x1b[91m', '\x1b[33m'],
    ocean: ['\x1b[34m', '\x1b[36m', '\x1b[94m'],
    forest: ['\x1b[32m', '\x1b[92m', '\x1b[33m'],
    sunset: ['\x1b[33m', '\x1b[91m', '\x1b[35m']
  }
};

interface Stats {
  totalSays: number;
  animalUsage: Record<string, number>;
  unlockedAnimals: Set<string>;
  achievements: Set<string>;
  longestMessage: number;
  favoriteAnimal: string;
  streakCount: number;
  lastAnimal: string;
}

let cowsayStats: Stats = {
  totalSays: 0,
  animalUsage: {},
  unlockedAnimals: new Set(['cow']),
  achievements: new Set(),
  longestMessage: 0,
  favoriteAnimal: '',
  streakCount: 0,
  lastAnimal: ''
};

const achievements: Achievement[] = [
  {
    id: 'first_moo',
    name: 'First Moo',
    description: 'Make your first animal speak',
    icon: '🐄',
    condition: () => cowsayStats.totalSays >= 1
  },
  {
    id: 'chatterbox',
    name: 'Chatterbox',
    description: 'Make animals speak 50 times',
    icon: '💬',
    condition: () => cowsayStats.totalSays >= 50
  },
  {
    id: 'animal_whisperer',
    name: 'Animal Whisperer',
    description: 'Use 10 different animals',
    icon: '🦄',
    condition: () => Object.keys(cowsayStats.animalUsage).length >= 10
  },
  {
    id: 'novelist',
    name: 'Novelist',
    description: 'Make an animal say 200+ characters',
    icon: '📚',
    condition: () => cowsayStats.longestMessage >= 200
  },
  {
    id: 'loyal_friend',
    name: 'Loyal Friend',
    description: 'Use the same animal 20 times',
    icon: '💕',
    condition: () => Math.max(...Object.values(cowsayStats.animalUsage)) >= 20
  }
];

const initCowsayCommand = (terminalApi: TerminalAPI) => {
  try {
    const saved = JSON.parse(localStorage.getItem('cowsay_stats') || '{}');
    cowsayStats = { ...cowsayStats, ...saved };
    cowsayStats.unlockedAnimals = new Set(cowsayStats.unlockedAnimals || ['cow']);
    cowsayStats.achievements = new Set(cowsayStats.achievements || []);
  } catch (e) {}

  const saveStats = () => {
    try {
      const toSave = {
        ...cowsayStats,
        unlockedAnimals: Array.from(cowsayStats.unlockedAnimals),
        achievements: Array.from(cowsayStats.achievements)
      };
      localStorage.setItem('cowsay_stats', JSON.stringify(toSave));
    } catch (e) {}
  };

  const checkAchievements = (ctx: CommandContext) => {
    const newAchievements: Achievement[] = [];
    achievements.forEach(ach => {
      if (!cowsayStats.achievements.has(ach.id) && ach.condition()) {
        cowsayStats.achievements.add(ach.id);
        newAchievements.push(ach);
      }
    });

    if (newAchievements.length > 0) {
      ctx.io.print('');
      ctx.io.print('🏆 ACHIEVEMENT UNLOCKED!');
      newAchievements.forEach(ach => {
        ctx.io.print(`${ach.icon} ${ach.name}: ${ach.description}`);
      });
    }
  };

  const unlockRandomAnimal = (ctx: CommandContext) => {
    const allAnimals = [...Object.keys(cowsayAnimals), ...Object.keys(extendedAnimals.extras)];
    const locked = allAnimals.filter(name => !cowsayStats.unlockedAnimals.has(name));

    if (locked.length > 0 && Math.random() < 0.1) {
      const newAnimal = locked[Math.floor(Math.random() * locked.length)];
      cowsayStats.unlockedAnimals.add(newAnimal);
      ctx.io.print(`🎉 New animal unlocked: ${newAnimal}!`);
    }
  };

  const applyEmotion = (animalArt: string[], emotion: string) => {
    if (!emotion || !extendedAnimals.emotions[emotion]) return animalArt;

    const emotionData = extendedAnimals.emotions[emotion];
    return animalArt.map(line => {
      return line
        .replace(/oo/g, emotionData.eyes)
        .replace(/U /g, emotionData.tongue);
    });
  };

  const applyColorScheme = (text: string, scheme: string) => {
    if (!scheme || !extendedAnimals.colorSchemes[scheme]) return text;

    const colors = extendedAnimals.colorSchemes[scheme];
    return text.split('\n').map((line, index) => {
      const color = colors[index % colors.length];
      return `${color}${line}\x1b[0m`;
    }).join('\n');
  };

  const generateSmartQuote = (animal: string) => {
    const quotes: Record<string, string[]> = {
      cow: ["Moo-tivation is key!", "I'm utterly amazing!", "Don't have a cow, man!"],
      dragon: ["I hoard knowledge, not gold!", "Breathe fire, spread wisdom!", "Legends never die!"],
      unicorn: ["Always believe in magic!", "Sparkle wherever you go!", "Dreams do come true!"],
      robot: ["404: Humor not found... just kidding!", "Processing... friendship.exe", "I compute, therefore I am"],
      default: ["Wisdom comes from unexpected places", "Every voice matters", "Speak your truth!"]
    };

    const animalQuotes = quotes[animal] || quotes.default;
    return animalQuotes[Math.floor(Math.random() * animalQuotes.length)];
  };

  const createAnimatedEffect = (text: string, effect: string) => {
    if (!effect) return text;

    switch (effect) {
      case 'shake':
        return text.split('').map(char => {
          const offset = Math.random() < 0.3 ? (Math.random() < 0.5 ? ' ' : '') : '';
          return offset + char;
        }).join('');

      case 'wave':
        return text.split('').map((char, i) => {
          return Math.sin(i * 0.5) > 0 ? char.toUpperCase() : char.toLowerCase();
        }).join('');

      case 'sparkle':
        return text.replace(/ /g, Math.random() < 0.1 ? '✨' : ' ');

      default:
        return text;
    }
  };

  terminalApi.registerCommand({
    name: 'cowsay',
    description: 'Make an animal say something with style and personality',
    flags: defineFlags([
      {
        name: 'thoughts',
        aliases: ['t'],
        type: 'boolean',
        description: 'Make the animal think instead of speak'
      },
      {
        name: 'list',
        aliases: ['l'],
        type: 'boolean',
        exclusive: true,
        description: 'List all available animals'
      },
      {
        name: 'random',
        aliases: ['r'],
        type: 'boolean',
        description: 'Choose a random animal'
      },
      {
        name: 'animal',
        aliases: ['a'],
        type: 'string',
        values: Object.values(cowsayAnimals).map(a => a.name),
        description: 'Choose specific animal'
      },
      {
        name: 'emotion',
        aliases: ['e'],
        type: 'string',
        values: Object.keys(extendedAnimals.emotions),
        description: 'Set animal emotion'
      },
      {
        name: 'color',
        aliases: ['c'],
        type: 'string',
        values: Object.keys(extendedAnimals.colorSchemes),
        description: 'Apply color scheme'
      },
      {
        name: 'effect',
        type: 'string',
        values: ['shake', 'wave', 'sparkle'],
        description: 'Add text effect'
      },
      {
        name: 'quote',
        aliases: ['q'],
        type: 'boolean',
        description: 'Generate smart quote for the animal'
      },
      {
        name: 'stats',
        aliases: ['s'],
        type: 'boolean',
        exclusive: true,
        description: 'Show usage statistics'
      },
      {
        name: 'achievements',
        type: 'boolean',
        exclusive: true,
        description: 'Show achievements'
      },
      {
        name: 'story',
        type: 'boolean',
        description: 'Generate a mini story'
      },
      {
        name: 'help',
        aliases: ['h'],
        type: 'boolean',
        exclusive: true,
        description: 'Show detailed help'
      }
    ]),
    handler: ({ flags, positional }, ctx) => {
      if (flags.stats) {
        ctx.io.print('📊 ═══ COWSAY STATISTICS ═══');
        ctx.io.print('');
        ctx.io.print(`🎯 Total Uses: ${cowsayStats.totalSays}`);
        ctx.io.print(`🦄 Unlocked Animals: ${cowsayStats.unlockedAnimals.size}`);
        ctx.io.print(`🏆 Achievements: ${cowsayStats.achievements.size}/${achievements.length}`);
        ctx.io.print(`📏 Longest Message: ${cowsayStats.longestMessage} characters`);
        ctx.io.print('');

        if (Object.keys(cowsayStats.animalUsage).length > 0) {
          ctx.io.print('🐾 Most Used Animals:');
          const sorted = Object.entries(cowsayStats.animalUsage)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
          sorted.forEach(([animal, count]) => {
            ctx.io.print(`  ${animal}: ${count} times`);
          });
        }
        return;
      }

      if (flags.achievements) {
        ctx.io.print('🏆 ═══ ACHIEVEMENTS ═══');
        ctx.io.print('');
        achievements.forEach(ach => {
          const unlocked = cowsayStats.achievements.has(ach.id);
          const status = unlocked ? '✅' : '🔒';
          ctx.io.print(`${status} ${ach.icon} ${ach.name}`);
          ctx.io.print(`    ${ach.description}`);
        });
        ctx.io.print('');
        ctx.io.print(`Progress: ${cowsayStats.achievements.size}/${achievements.length} unlocked`);
        return;
      }

      if (flags.list) {
        ctx.io.print('🐾 ═══ AVAILABLE ANIMALS ═══');
        ctx.io.print('');
        ctx.io.print('✅ Unlocked:');
        Array.from(cowsayStats.unlockedAnimals).forEach(name => {
          const usage = cowsayStats.animalUsage[name] || 0;
          ctx.io.print(`  🐄 ${name} (used ${usage} times)`);
        });

        const allAnimals = [...Object.keys(cowsayAnimals), ...Object.keys(extendedAnimals.extras)];
        const locked = allAnimals.filter(name => !cowsayStats.unlockedAnimals.has(name));

        if (locked.length > 0) {
          ctx.io.print('');
          ctx.io.print('🔒 Locked (keep using cowsay to unlock):');
          locked.forEach(name => {
            const rarity = extendedAnimals.extras[name]?.rarity || 'common';
            ctx.io.print(`  ❓ ${name} (${rarity})`);
          });
        }

        ctx.io.print('');
        ctx.io.print(`Total: ${cowsayStats.unlockedAnimals.size}/${allAnimals.length} unlocked`);
        return;
      }

      let animal;
      if (flags.random) {
        const available = Array.from(cowsayStats.unlockedAnimals);
        const randomName = available[Math.floor(Math.random() * available.length)];
        animal = cowsayAnimals[randomName as CowsayAnimal] || extendedAnimals.extras[randomName];
      } else if (flags.animal) {
        if (!cowsayStats.unlockedAnimals.has(flags.animal)) {
          ctx.io.print(`🔒 Animal "${flags.animal}" is not unlocked yet!`);
          ctx.io.print('💡 Use cowsay more to unlock new animals!');
          return;
        }
        animal = cowsayAnimals[flags.animal as CowsayAnimal] || extendedAnimals.extras[flags.animal];
      } else {
        animal = getCowsayAnimalByFlags(flags);
      }

      if (!animal) {
        ctx.io.print('❌ Animal not found!');
        return;
      }

      let message;
      if (flags.quote) {
        message = generateSmartQuote(animal.name);
      } else if (flags.story) {
        const stories = [
          `Once upon a time, ${animal.name} discovered the secret to happiness...`,
          `In a land far away, ${animal.name} embarked on an epic quest...`,
          `${animal.name} woke up one morning and decided to change the world...`
        ];
        message = stories[Math.floor(Math.random() * stories.length)];
      } else {
        message = positional.join(' ') || animal.defaultText || `Hello from ${animal.name}!`;
      }

      if (flags.effect) {
        message = createAnimatedEffect(message, flags.effect);
      }

      cowsayStats.totalSays++;
      cowsayStats.animalUsage[animal.name] = (cowsayStats.animalUsage[animal.name] || 0) + 1;
      cowsayStats.longestMessage = Math.max(cowsayStats.longestMessage, message.length);
      cowsayStats.lastAnimal = animal.name;

      const isThinking = flags.thoughts === true;
      let animalArt = [...animal.art];

      if (flags.emotion) {
        animalArt = applyEmotion(animalArt, flags.emotion);
      }

      const lines = wrapTerminalText(message, 40);
      const maxLength = Math.max(...lines.map((l) => l.length));
      const border = '_'.repeat(maxLength + 2);
      const separator = '-'.repeat(maxLength + 2);

      const quoteLines = lines
        .map((line) => {
          const padded = line.padEnd(maxLength);
          return isThinking ? `\x1b[36m( ${padded} )` : `\x1b[36m< ${padded} >`;
        })
        .join('\n');

      let result = [
        `\x1b[90m ${border}`,
        quoteLines,
        `\x1b[90m ${separator}`,
        ...animalArt,
      ].join('\n');

      if (flags.color) {
        result = applyColorScheme(result, flags.color);
      }

      ctx.io.print(result);

      checkAchievements(ctx);

      unlockRandomAnimal(ctx);

      saveStats();

      if (Math.random() < 0.05) {
        const easter_eggs = [
          '🌟 The animal winks at you mysteriously...',
          '✨ You feel a strange connection with the animal world...',
          '🎭 The animal seems unusually wise today...',
          '🦄 Magic is in the air...'
        ];
        ctx.io.print('');
        ctx.io.print(easter_eggs[Math.floor(Math.random() * easter_eggs.length)]);
      }
    },
  });
};

export { initCowsayCommand };