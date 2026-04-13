import { Nullable } from '@nameless-os/sdk';

export class CommandParser {
  parse(input: string): string[] {
    const args: string[] = [];
    let current = '';
    let quote: Nullable<'"' | "'"> = null;
    let escaped = false;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if (escaped) {
        current += char;
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (quote) {
        if (char === quote) {
          quote = null;
        } else {
          current += char;
        }
      } else if (char === '"' || char === "'") {
        quote = char;
      } else if (/\s/.test(char)) {
        if (current.length > 0) {
          args.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (quote) {
      throw new Error(`Unterminated ${quote} quote`);
    }

    if (escaped) {
      throw new Error(`Stray backslash at end of input`);
    }

    if (current.length > 0) {
      args.push(current);
    }

    return args;
  }
}
