import { defineFlags, Nullable, TerminalAPI } from '@nameless-os/sdk';

interface SortOptions {
  numeric: boolean;
  ignoreCase: boolean;
  monthSort: boolean;
}

const initSortCommand = (terminalApi: TerminalAPI): void => {
  terminalApi.registerCommand({
    name: "sort",
    description: "Sort lines of text files",
    flags: defineFlags([
      {
        name: 'reverse',
        aliases: ['r'],
        type: 'boolean',
        description: 'Reverse the result of comparisons',
        default: false,
      },
      {
        name: 'numeric',
        aliases: ['n'],
        type: 'boolean',
        description: 'Compare according to string numerical value',
        default: false,
      },
      {
        name: 'unique',
        aliases: ['u'],
        type: 'boolean',
        description: 'Output only the first of an equal run',
        default: false,
      },
      {
        name: 'ignore-case',
        aliases: ['f'],
        type: 'boolean',
        description: 'Fold lower case to upper case characters',
        default: false,
      },
      {
        name: 'key',
        aliases: ['k'],
        type: 'string',
        description: 'Sort via a key; KEYDEF gives location and type',
      },
      {
        name: 'field-separator',
        aliases: ['t'],
        type: 'string',
        description: 'Use SEP instead of non-blank to blank transition',
      },
      {
        name: 'random-sort',
        aliases: ['R'],
        type: 'boolean',
        description: 'Shuffle, but group identical keys',
        default: false,
      },
      {
        name: 'month-sort',
        aliases: ['M'],
        type: 'boolean',
        description: 'Compare (unknown) < JAN < ... < DEC',
        default: false,
      },
    ]),
    handler: async ({ positional, flags }, ctx) => {
      let inputLines: string[] = [];

      if (ctx.input) {
        inputLines = ctx.input.split('\n');
      } else {
        ctx.io.printError('sort: missing operand');
        return;
      }

      if (inputLines.length > 0 && inputLines[inputLines.length - 1] === '') {
        inputLines.pop();
      }

      let sortedLines: string[] = [...inputLines];

      try {
        if (flags['random-sort'] as boolean) {
          sortedLines = shuffleArray(sortedLines);
        } else if (flags.key as string) {
          sortedLines = sortByKey(sortedLines, flags.key as string, flags['field-separator'] as string, {
            numeric: flags.numeric as boolean,
            ignoreCase: flags['ignore-case'] as boolean,
            monthSort: flags['month-sort'] as boolean,
          });
        } else {
          sortedLines.sort((a: string, b: string) => {
            let compareA: string = a;
            let compareB: string = b;

            if (flags['ignore-case'] as boolean) {
              compareA = compareA.toLowerCase();
              compareB = compareB.toLowerCase();
            }

            if (flags.numeric as boolean) {
              const numA: number = parseFloat(compareA) || 0;
              const numB: number = parseFloat(compareB) || 0;
              return numA - numB;
            }

            if (flags['month-sort'] as boolean) {
              const monthA: number = getMonthValue(compareA);
              const monthB: number = getMonthValue(compareB);
              if (monthA !== -1 && monthB !== -1) {
                return monthA - monthB;
              }
            }

            return compareA.localeCompare(compareB);
          });
        }

        if (flags.reverse as boolean) {
          sortedLines.reverse();
        }

        if (flags.unique as boolean) {
          sortedLines = removeDuplicates(sortedLines, flags['ignore-case'] as boolean);
        }

        for (const line of sortedLines) {
          ctx.io.print(line);
        }

      } catch (error: unknown) {
        const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
        ctx.io.printError(`sort: ${errorMessage}`);
      }
    }
  });
};

const shuffleArray = <T>(array: T[]): T[] => {
  const result: T[] = [...array];
  for (let i: number = result.length - 1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const sortByKey = (
  lines: string[],
  keyDef: string,
  separator?: string,
  options: SortOptions = { numeric: false, ignoreCase: false, monthSort: false }
): string[] => {
  const keyParts: string[] = keyDef.split(',');
  const primaryKey: string = keyParts[0];
  const fieldMatch: Nullable<RegExpMatchArray> = primaryKey.match(/^(\d+)(?:\.(\d+))?$/);

  if (!fieldMatch) {
    throw new Error(`Invalid key format: ${keyDef}`);
  }

  const fieldNum: number = parseInt(fieldMatch[1]) - 1;
  const charNum: number = fieldMatch[2] ? parseInt(fieldMatch[2]) - 1 : 0;

  return [...lines].sort((a: string, b: string) => {
    const fieldsA: string[] = separator ? a.split(separator) : a.split(/\s+/);
    const fieldsB: string[] = separator ? b.split(separator) : b.split(/\s+/);

    let keyA: string = fieldsA[fieldNum] || '';
    let keyB: string = fieldsB[fieldNum] || '';

    if (charNum > 0) {
      keyA = keyA.substring(charNum);
      keyB = keyB.substring(charNum);
    }

    if (options.ignoreCase) {
      keyA = keyA.toLowerCase();
      keyB = keyB.toLowerCase();
    }

    if (options.numeric) {
      const numA: number = parseFloat(keyA) || 0;
      const numB: number = parseFloat(keyB) || 0;
      return numA - numB;
    }

    if (options.monthSort) {
      const monthA: number = getMonthValue(keyA);
      const monthB: number = getMonthValue(keyB);
      if (monthA !== -1 && monthB !== -1) {
        return monthA - monthB;
      }
    }

    return keyA.localeCompare(keyB);
  });
};

const getMonthValue = (str: string): number => {
  const months: string[] = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
  ];

  const month: string = str.toUpperCase().substring(0, 3);
  return months.indexOf(month);
};

const removeDuplicates = (lines: string[], ignoreCase: boolean): string[] => {
  const seen: Set<string> = new Set<string>();
  const result: string[] = [];

  for (const line of lines) {
    const key: string = ignoreCase ? line.toLowerCase() : line;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(line);
    }
  }

  return result;
};

export { initSortCommand };
