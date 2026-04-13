import { defineFlags, TerminalAPI } from '@nameless-os/sdk';

const wcFlags = defineFlags([
  {
    name: 'lines',
    aliases: ['l'],
    type: 'boolean',
    description: 'Count lines only',
    default: false,
  },
  {
    name: 'words',
    aliases: ['w'],
    type: 'boolean',
    description: 'Count words only',
    default: false,
  },
  {
    name: 'chars',
    aliases: ['c'],
    type: 'boolean',
    description: 'Count characters only',
    default: false,
  },
  {
    name: 'bytes',
    aliases: ['m'],
    type: 'boolean',
    description: 'Count bytes only',
    default: false,
  },
]);

const initWcCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "wc",
    flags: wcFlags,
    description: "Counts lines, words and characters",
    handler: async ({ flags }, ctx) => {
      const text = ctx.input ?? '';

      const lines = text ? text.split('\n').length : 0;
      const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
      const chars = text.length;
      const bytes = new TextEncoder().encode(text).length;

      const showLines = flags.lines;
      const showWords = flags.words;
      const showChars = flags.chars;
      const showBytes = flags.bytes;

      const showAll = !showLines && !showWords && !showChars && !showBytes;

      let output = '';

      if (showAll) {
        output = `${lines} ${words} ${chars}`;
      } else {
        const parts = [];
        if (showLines) parts.push(lines.toString());
        if (showWords) parts.push(words.toString());
        if (showChars) parts.push(chars.toString());
        if (showBytes) parts.push(bytes.toString());
        output = parts.join(' ');
      }

      ctx.io.print(output);
    }
  });
};

export { initWcCommand };