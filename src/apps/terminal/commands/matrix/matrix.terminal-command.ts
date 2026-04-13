import { defineFlags, TerminalAPI } from '@nameless-os/sdk';

const matrixFlags = defineFlags([
  {
    name: 'speed',
    aliases: ['s'],
    type: 'number',
    default: 5,
    description: 'Animation speed (1-10, higher = faster)'
  },
  {
    name: 'width',
    aliases: ['w'],
    type: 'number',
    default: 50,
    description: 'Matrix width (20-100 columns)'
  },
  {
    name: 'height',
    aliases: ['h'],
    type: 'number',
    default: 25,
    description: 'Matrix height (10-50 rows)'
  },
  {
    name: 'duration',
    aliases: ['d'],
    type: 'number',
    default: 15,
    description: 'Animation duration in seconds (5-60)'
  },
  {
    name: 'chars',
    aliases: ['c'],
    type: 'string',
    default: 'matrix',
    values: ['binary', 'katakana', 'symbols', 'matrix'],
    description: 'Character set to use'
  },
  {
    name: 'color',
    type: 'string',
    default: 'green',
    values: ['green', 'blue', 'red', 'cyan', 'white'],
    description: 'Color scheme'
  },
  {
    name: 'custom-chars',
    type: 'string',
    description: 'Custom character set (overrides --chars)'
  }
]);

const initMatrixCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "matrix",
    description: "Display animated falling code effect with customization options",
    flags: matrixFlags,
    handler: ({ flags }, ctx) => {
      const config = {
        speed: Math.max(1, Math.min(10, flags.speed)),
        width: Math.max(20, Math.min(100, flags.width)),
        height: Math.max(10, Math.min(50, flags.height)),
        duration: Math.max(5, Math.min(60, flags.duration)),
        chars: flags.chars,
        color: flags.color,
        customChars: flags['custom-chars']
      };

      const charSets = {
        binary: '01',
        katakana: 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
        matrix: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ'
      };

      const chars = config.customChars || charSets[config.chars] || charSets.matrix;

      const colors = {
        green: { bright: '\x1b[1;32m', normal: '\x1b[32m', dim: '\x1b[2;32m', reset: '\x1b[0m' },
        blue: { bright: '\x1b[1;36m', normal: '\x1b[36m', dim: '\x1b[2;36m', reset: '\x1b[0m' },
        red: { bright: '\x1b[1;31m', normal: '\x1b[31m', dim: '\x1b[2;31m', reset: '\x1b[0m' },
        cyan: { bright: '\x1b[1;96m', normal: '\x1b[96m', dim: '\x1b[2;96m', reset: '\x1b[0m' },
        white: { bright: '\x1b[1;37m', normal: '\x1b[37m', dim: '\x1b[2;37m', reset: '\x1b[0m' }
      };

      const colorScheme: Record<string, string> = colors[config.color]; // TODO FIX

      const drops: {
        y: number;
        speed: number;
        chars: string[];
        trail: number;
      }[] = [];
      for (let i = 0; i < config.width; i++) {
        drops[i] = {
          y: Math.random() * config.height,
          speed: Math.random() * 0.5 + 0.1,
          chars: [],
          trail: Math.floor(Math.random() * 10) + 10
        };
      }

      const generateMatrix = () => {
        const matrix = Array.from({ length: config.height }, () =>
          Array(config.width).fill({ char: ' ', color: 'reset' })
        );

        for (let x = 0; x < drops.length; x++) {
          const drop = drops[x];

          drop.y += drop.speed * (config.speed / 5);

          if (drop.y > config.height + drop.trail) {
            drop.y = -drop.trail;
            drop.speed = Math.random() * 0.8 + 0.2;
            drop.trail = Math.floor(Math.random() * 15) + 8;
            drop.chars = [];
          }

          while (drop.chars.length < drop.trail) {
            drop.chars.push(chars[Math.floor(Math.random() * chars.length)]);
          }

          if (Math.random() < 0.1) {
            const pos = Math.floor(Math.random() * drop.chars.length);
            drop.chars[pos] = chars[Math.floor(Math.random() * chars.length)];
          }

          for (let i = 0; i < drop.trail; i++) {
            const y = Math.floor(drop.y - i);
            if (y >= 0 && y < config.height) {
              let color;
              if (i === 0) {
                color = 'bright';
              } else if (i < drop.trail / 3) {
                color = 'normal';
              } else {
                color = 'dim';
              }

              matrix[y][x] = {
                char: drop.chars[i] || chars[Math.floor(Math.random() * chars.length)],
                color: color
              };
            }
          }
        }

        const lines = [];
        for (let y = 0; y < config.height; y++) {
          let line = '';
          for (let x = 0; x < config.width; x++) {
            const cell: { char: string, color: string } = matrix[y][x];
            if (cell.char === ' ') {
              line += ' ';
            } else {
              line += colorScheme[cell.color] + cell.char + colorScheme.reset;
            }
          }
          lines.push(line);
        }

        return lines.join('\n');
      };

      const charsetName = config.customChars ?
        `custom:${config.customChars.slice(0, 10)}${config.customChars.length > 10 ? '...' : ''}` :
        config.chars;

      const startInfo = ctx.io.print(`${colorScheme.bright}🎬 Matrix animation starting...${colorScheme.reset}
${colorScheme.normal}📊 Config: ${config.width}x${config.height}, speed=${config.speed}, duration=${config.duration}s, chars=${charsetName}, color=${config.color}${colorScheme.reset}
${colorScheme.dim}⏹️  Press Ctrl+C to stop early${colorScheme.reset}\n`);

      const matrixId = ctx.io.print(generateMatrix());

      let frame = 0;
      const frameRate = Math.max(50, 200 - (config.speed * 15));
      const maxFrames = (config.duration * 1000) / frameRate;
      let isRunning = true;

      const animate = () => {
        if (!isRunning || frame >= maxFrames) {
          ctx.ui.updateMessage(matrixId,
            `${colorScheme.bright}🎯 Matrix animation completed.${colorScheme.reset}\n` +
            `${colorScheme.normal}💾 Total frames: ${frame}, Duration: ${Math.round(frame * frameRate / 1000)}s${colorScheme.reset}`
          );
          return;
        }

        ctx.ui.updateMessage(matrixId, generateMatrix());
        frame++;

        setTimeout(animate, frameRate);
      };

      const stopAnimation = () => {
        isRunning = false;
        ctx.ui.updateMessage(matrixId,
          `${colorScheme.bright}⛔ Matrix animation stopped by user.${colorScheme.reset}\n` +
          `${colorScheme.normal}💾 Frames rendered: ${frame}${colorScheme.reset}`
        );
      };

      setTimeout(animate, 300);
    },
  });
};

export { initMatrixCommand };