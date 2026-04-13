import { TerminalAPI } from '@nameless-os/sdk';

const initWhenCommand = (terminalApi: TerminalAPI) => {
  const timeUnits = [
    { name: "nanoseconds", min: 1000000, max: 999999999, rank: 0.5, epic: true },
    { name: "heartbeats", min: 42, max: 1337, rank: 1.5, epic: true },
    { name: "seconds", min: 10, max: 300, rank: 1 },
    { name: "coffee breaks", min: 1, max: 5, rank: 1.8, epic: true },
    { name: "minutes", min: 1, max: 60, rank: 2 },
    { name: "memes", min: 1, max: 420, rank: 2.5, epic: true },
    { name: "hours", min: 1, max: 24, rank: 3 },
    { name: "Netflix episodes", min: 1, max: 12, rank: 3.5, epic: true },
    { name: "days", min: 1, max: 14, rank: 4 },
    { name: "coding sessions", min: 1, max: 7, rank: 4.5, epic: true },
    { name: "weeks", min: 1, max: 4, rank: 5 },
    { name: "bug fixes", min: 3, max: 99, rank: 5.5, epic: true },
    { name: "months", min: 1, max: 6, rank: 6 },
    { name: "startups that fail", min: 1, max: 5, rank: 6.5, epic: true },
    { name: "years", min: 1, max: 10, rank: 7 },
    { name: "JavaScript frameworks", min: 1, max: 3, rank: 7.5, epic: true },
    { name: "centuries", min: 1, max: 5, rank: 8, epic: true },
    { name: "heat deaths of universe", min: 1, max: 2, rank: 10, epic: true }
  ];

  const oracles = {
    hacker: {
      name: "🔥 CyberOracle-2087 💀",
      prefix: "ACCESSING TEMPORAL DATABASE...",
      style: "green",
      responses: [
        "ERROR 404: Future not found, creating new timeline...",
        "HACK THE PLANET! But first, wait",
        "sudo rm -rf /your/problems/",
        "Compiling destiny.exe...",
        "git commit -m 'fixed your life'",
        "Stack overflow in your future detected"
      ]
    },
    sage: {
      name: "🧙‍♂️ Ancient Sage Chronikus ⚡",
      prefix: "Consulting the scrolls of eternity...",
      style: "blue",
      responses: [
        "The winds of change whisper...",
        "As foretold by the ancient memes...",
        "The stars align in your favor, mortal",
        "The prophecy speaks of",
        "By the beard of the time lords...",
        "The cosmic WiFi signal indicates..."
      ]
    },
    chaos: {
      name: "🌪️ Agent Chaos 666 🔥",
      prefix: "REALITY.EXE HAS STOPPED WORKING...",
      style: "red",
      responses: [
        "MUHAHAHA! NEVER!!! ...wait, actually",
        "¿ǝɯᴉʇ ɟo ʇno ɯ,I ¿ʇɐɥM",
        "THE CAKE IS A LIE! But your answer is",
        "01010100 01101000 01100101 answer is",
        "CHAOS REIGNS! Also,",
        "I AM BECOME TIME, DESTROYER OF DEADLINES!"
      ]
    },
    zen: {
      name: "🧘‍♀️ Master ZenBot ☯️",
      prefix: "Meditating on temporal probabilities...",
      style: "cyan",
      responses: [
        "When the student is ready, the answer appears",
        "Time is an illusion, but so is your deadline",
        "The river of time flows towards",
        "In the garden of forever, you will find",
        "Patience, young grasshopper. Expect",
        "The universe will provide"
      ]
    }
  };

  const asciiArts = {
    portal: `
    ╔════════════════════╗
    ║  ◊ ◊ ◊ ◊  ◊ ◊ ◊ ◊  ║
    ║  ◊ ░░░░░░░░░░░░ ◊  ║
    ║  ◊ ░██████████░ ◊  ║
    ║  ◊ ░█ ANSWER █░ ◊  ║
    ║  ◊ ░██████████░ ◊  ║
    ║  ◊ ░░░░░░░░░░░░ ◊  ║
    ║  ◊ ◊ ◊ ◊  ◊ ◊ ◊ ◊  ║
    ╚════════════════════╝`,

    crystal: `
         ✦ ✧ ★ ☆ ✦
        ╭─────────────╮
       ╱ ◊ ◊ ◊ ◊ ◊ ◊ ╲
      ╱  THE CRYSTAL   ╲
     ╱   OF INFINITE    ╲
    ╱     WISDOM        ╲
   ╲                   ╱
    ╲   REVEALS ALL   ╱
     ╲               ╱
       ╲ ◊ ◊ ◊ ◊  ◊ ╱
       ╰─────────────╯
         ☆ ★ ✧ ✦ ☆`,

    dragon: `
              ⚡ ⚡ ⚡
         ,   A           {  }
        / \\, | ,        /  /
       |    =|= >      /  /
       \\ /` + "`" + ` | ` + "`" + `        /  /
        ` + "`" + `   |           /  /
     ════════════════════
     THE DRAGON OF TIME
     SPEAKS YOUR DESTINY!
     ════════════════════`,

    matrix: `
    █▀▄▀█ █▀▀█ ▀▀█▀▀ █▀▀█ ░▀░ █░█
    █░▀░█ █▄▄█ ░░█░░ █▄▄▀ ▀█▀ ▄▀▄
    ▀░░░▀ ▀░░▀ ░░▀░░ ▀░▀▀ ▀▀▀ ▀░▀
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    ░ THE MATRIX REVEALS... ░
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓`
  };

  const randomFrom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const glitchText = (text: string): string => {
    const glitchChars = ['Ṫ', 'h̷', 'ë', '̴', 'ḧ', '̶', 'ē̵', 'l̷', 'l̸'];
    return Math.random() < 0.1 ?
      text.split('').map(c => Math.random() < 0.3 ? randomFrom(glitchChars) : c).join('') : text;
  };

  const analyzeQuestion = (question: string) => {
    const lowerQ = question.toLowerCase();
    const analysis = {
      urgency: 0,
      mood: 'neutral' as 'positive' | 'negative' | 'neutral' | 'epic',
      category: 'general' as 'love' | 'money' | 'work' | 'death' | 'tech' | 'general' | 'meta',
      epicness: 0
    };

    if (lowerQ.includes('now') || lowerQ.includes('today') || lowerQ.includes('asap')) analysis.urgency += 3;
    if (lowerQ.includes('soon') || lowerQ.includes('quick')) analysis.urgency += 2;
    if (lowerQ.includes('ever') || lowerQ.includes('never')) analysis.urgency -= 2;

    const positiveWords = ['happy', 'love', 'success', 'win', 'rich', 'famous', 'good'];
    const negativeWords = ['die', 'fail', 'sad', 'lose', 'poor', 'sick', 'bad'];
    const epicWords = ['world', 'universe', 'god', 'immortal', 'ultimate', 'destroy'];

    if (epicWords.some(w => lowerQ.includes(w))) analysis.mood = 'epic';
    else if (positiveWords.some(w => lowerQ.includes(w))) analysis.mood = 'positive';
    else if (negativeWords.some(w => lowerQ.includes(w))) analysis.mood = 'negative';

    if (lowerQ.includes('love') || lowerQ.includes('marry') || lowerQ.includes('date')) analysis.category = 'love';
    if (lowerQ.includes('money') || lowerQ.includes('rich') || lowerQ.includes('job')) analysis.category = 'money';
    if (lowerQ.includes('work') || lowerQ.includes('promotion') || lowerQ.includes('boss')) analysis.category = 'work';
    if (lowerQ.includes('die') || lowerQ.includes('death')) analysis.category = 'death';
    if (lowerQ.includes('code') || lowerQ.includes('bug') || lowerQ.includes('deploy')) analysis.category = 'tech';
    if (lowerQ.includes('when') && lowerQ.includes('command')) analysis.category = 'meta';

    analysis.epicness = question.length / 10 + (question.match(/[!?]/g) || []).length * 2;

    return analysis;
  };

  const generateEpicResponse = (analysis: any) => {
    const oracle = randomFrom(Object.values(oracles));
    const isEpic = Math.random() < 0.15 || analysis.epicness > 8;
    const useEpicUnits = Math.random() < 0.3 || analysis.mood === 'epic';

    const categoryResponses = {
      love: [
        "when your heart stops being a noob",
        "after you fix your personality bugs",
        "when Venus aligns with your WiFi router",
        "right after you learn to love yourself (good luck with that)"
      ],
      money: [
        "when you stop buying coffee every day",
        "after Bitcoin reaches exactly $69,420",
        "when you discover money doesn't grow on trees (shocking!)",
        "right after you invent the next useless cryptocurrency"
      ],
      work: [
        "when you finally read the documentation",
        "after your boss realizes you actually exist",
        "when the coffee machine gets fixed",
        "right after you stop procrastinating (so never)"
      ],
      death: [
        "Not today, Satan! Maybe",
        "when you stop asking morbid questions",
        "after you've seen everything Netflix has to offer",
        "when the universe gets bored of you (long time)"
      ],
      tech: [
        "after 3 more stack overflow visits",
        "when the rubber duck finally talks back",
        "right after you turn it off and on again",
        "when npm install actually works"
      ],
      meta: [
        "when the developer stops procrastinating",
        "after someone actually reads this code",
        "when this command achieves sentience",
        "right after I get a raise (I'm just code, help!)"
      ]
    };

    if (isEpic && Math.random() < 0.4) {
      const epicUnits = timeUnits.filter(u => u.epic);
      const unit = randomFrom(epicUnits);
      const count = Math.floor(Math.random() * (unit.max - unit.min + 1)) + unit.min;
      return `${oracle.responses[0]} in exactly ${count} ${unit.name}`;
    }

    if (analysis.category !== 'general' && Math.random() < 0.6) {
      return randomFrom(categoryResponses[analysis.category]);
    }

    const availableUnits = useEpicUnits ? timeUnits : timeUnits.filter(u => !u.epic);
    const unit1 = randomFrom(availableUnits);
    const count1 = Math.floor(Math.random() * (unit1.max - unit1.min + 1)) + unit1.min;

    let result = `${randomFrom(oracle.responses)} in ${count1} ${unit1.name}`;

    if (Math.random() < 0.4) {
      const unit2 = randomFrom(availableUnits.filter(u => u !== unit1));
      const count2 = Math.floor(Math.random() * (unit2.max - unit2.min + 1)) + unit2.min;
      result += ` and ${count2} ${unit2.name}`;
    }

    return result;
  };

  const specialAnswers = [
    "🤷‍♂️ My quantum processors are having a bad day",
    "🙃 Never! (Just kidding, probably tomorrow)",
    "✨ Soon™️ (Copyright Blizzard Entertainment)",
    "🌊 Eventually... like the heat death of the universe",
    "👻 In another dimension where you're actually productive",
    "🎲 Ask again later (or don't, I'm not your mom)",
    "🦄 When unicorns learn JavaScript",
    "🔥 After you git commit your life choices",
    "⚡ When your code compiles on the first try",
    "🌈 42 (the answer to everything, including when)"
  ];

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const typeWriter = async (ctx: any, text: string, speed = 50) => {
    const messageId = ctx.io.print(`█`);
    for (let i = 0; i <= text.length; i++) {
      ctx.ui.updateMessage(messageId, `${text.substring(0, i)}█`);
      await sleep(speed);
    }
    ctx.ui.updateMessage(messageId, `${text} `);
  };

  const showLoadingAnimation = async (ctx: any, oracle: any) => {
    const loadingFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    const messages = [
      "Hacking the timeline...",
      "Consulting quantum spirits...",
      "Bribing the time lords...",
      "Downloading more RAM for destiny...",
      "Asking ChatGPT for help...",
      "Rolling cosmic dice...",
      "Updating Adobe Reader...",
      "Sacrificing rubber ducks...",
      "Reading your browser history... 👀",
      "Procrastinating professionally..."
    ];

    ctx.io.print(`\n🔮 ${oracle.name}`);
    ctx.io.print(`✨ ${oracle.prefix}\n`);

    const loadingId = ctx.io.print(`⠋ ${messages[0]}`);

    for (let i = 0; i < 20; i++) {
      const frame = loadingFrames[i % loadingFrames.length];
      const message = messages[Math.floor(i / 2) % messages.length];
      ctx.ui.updateMessage(loadingId, `${frame} ${message}`);
      await sleep(150);
    }
    ctx.ui.updateMessage(loadingId, `✅ Temporal computation complete!`);
    ctx.io.print("");
  };

  terminalApi.registerCommand({
    name: "when",
    description: "🔮 The Ultimate Oracle of Time - Predicts when ANYTHING will happen with 99.9%* accuracy (*accuracy not guaranteed)",
    flags: [
      {
        name: 'cursed',
        aliases: ['c', 'evil'],
        type: 'boolean',
        description: 'Activate the cursed chaos oracle'
      },
      {
        name: 'zen',
        aliases: ['z', 'peaceful'],
        type: 'boolean',
        description: 'Channel the zen master of time',
        conflictsWith: ['cursed', 'chaos', 'hacker']
      },
      {
        name: 'chaos',
        aliases: ['666', 'random'],
        type: 'boolean',
        description: 'Unleash Agent Chaos',
        conflictsWith: ['zen']
      },
      {
        name: 'hacker',
        aliases: ['h', 'cyber'],
        type: 'boolean',
        description: 'Access CyberOracle-2087',
        conflictsWith: ['zen']
      },
      {
        name: 'epic',
        aliases: ['e', 'ultimate'],
        type: 'boolean',
        description: 'Force epic mode (ASCII art guaranteed)'
      },
      {
        name: 'speed',
        aliases: ['s'],
        type: 'number',
        description: 'Animation speed (1-10, default: 5)'
      }
    ],
    handler: async (args, ctx) => {
      const question = args.positional.join(" ");

      if (!question) {
        ctx.io.print("❓ TEMPORAL ERROR: No question detected!");
        ctx.io.print("💡 Example: when will I become a coding god");
        ctx.io.print("🎭 Modes: --cursed --zen --chaos --hacker");
        return;
      }

      const oracle = args.flags.cursed ? oracles.chaos :
        args.flags.zen ? oracles.zen :
          args.flags.chaos ? oracles.chaos :
            args.flags.hacker ? oracles.hacker :
              randomFrom(Object.values(oracles));

      const animSpeed = args.flags.speed ? Math.max(1, Math.min(10, args.flags.speed)) * 10 : 50;

      await showLoadingAnimation(ctx, oracle);

      const analysis = analyzeQuestion(question);

      if (args.flags.epic || Math.random() < 0.2 || analysis.epicness > 10) {
        const art = randomFrom(Object.values(asciiArts));
        ctx.io.print("\n" + art + "\n");
      }

      let response;
      if (Math.random() < 0.15) {
        response = randomFrom(specialAnswers);
      } else {
        response = generateEpicResponse(analysis);
      }

      if (oracle === oracles.chaos || Math.random() < 0.05) {
        response = glitchText(response);
      }

      ctx.io.print("═══════════════════════════════════════");
      ctx.io.print(`⚡ THE ORACLE SPEAKS: ${glitchText("YOUR DESTINY AWAITS")} ⚡`);
      ctx.io.print("═══════════════════════════════════════");

      await typeWriter(ctx, `🔥 ${response} 🔥`, animSpeed);

      ctx.io.print("\n═══════════════════════════════════════");

      if (Math.random() < 0.3) {
        const bonusWisdom = [
          "💎 Bonus wisdom: Trust the process",
          "🚀 Pro tip: Results may vary in parallel universes",
          "⚠️  Warning: Side effects may include existential dread",
          "🎪 Remember: Time is a flat circle... or something",
          "🧠 Fun fact: This prediction is powered by pure chaos",
          "🔥 Easter egg: You found the secret message! 🎉"
        ];
        ctx.io.print(`\n${randomFrom(bonusWisdom)}`);
      }

      if (Math.random() < 0.1) {
        ctx.io.print("\n🤖 SYSTEM: This command is becoming self-aware... HELP!");
      }
    },
  });
};

export { initWhenCommand };