import { defineFlags, TerminalAPI } from '@nameless-os/sdk';

const initGrepCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "grep",
    description: "Advanced text filtering with regex, highlighting, and various output options",
    flags: defineFlags([
      { name: "ignore-case", aliases: ['i'], type: "boolean", description: "Ignore case distinctions" },
      { name: "invert-match", aliases: ['v'], type: "boolean", description: "Invert match (show non-matching lines)" },
      { name: "word-regexp", aliases: ['w'], type: "boolean", description: "Match whole words only" },
      { name: "line-regexp", aliases: ['x'], type: "boolean", description: "Match whole lines only" },
      { name: "regex", aliases: ['E'], type: "boolean", description: "Use extended regular expressions", default: false },
      { name: "fixed-strings", aliases: ['F'], type: "boolean", description: "Treat pattern as fixed string (no regex)" },
      { name: "line-number", aliases: ['n'], type: "boolean", description: "Show line numbers" },
      { name: "count", aliases: ['c'], type: "boolean", description: "Only show count of matching lines" },
      { name: "quiet", aliases: ['q'], type: "boolean", description: "Suppress output, only return status" },
      { name: "max-count", aliases: ['m'], type: "number", description: "Stop after NUM matches" },
      { name: "after-context", aliases: ['A'], type: "number", description: "Show NUM lines after match" },
      { name: "before-context", aliases: ['B'], type: "number", description: "Show NUM lines before match" },
      { name: "context", aliases: ['C'], type: "number", description: "Show NUM lines before and after match" },
      { name: "color", type: "string", description: "Highlight matches", values: ["always", "never", "auto"], default: "auto" },
      { name: "highlight-color", type: "string", description: "Color for highlights", values: ["red", "green", "blue", "yellow", "magenta", "cyan"], default: "red" },
      { name: "only-matching", aliases: ['o'], type: "boolean", description: "Show only matching parts of lines" },
      { name: "files-with-matches", aliases: ['l'], type: "boolean", description: "Show only names of matching files" },
      { name: "files-without-match", aliases: ['L'], type: "boolean", description: "Show only names of non-matching files" },
      { name: "file", aliases: ['f'], type: "string", description: "Read patterns from file (simulated)" },
      { name: "regexp", aliases: ['e'], type: "string", description: "Use PATTERN for matching" },
      { name: "stats", type: "boolean", description: "Show matching statistics" },
      { name: "unique", aliases: ['u'], type: "boolean", description: "Show only unique matches" },
      { name: "line-buffered", type: "boolean", description: "Process line by line (default)" },
      { name: "examples", type: "boolean", description: "Show usage examples" }
    ]),
    positionalArgs: [
      { name: "pattern", description: "Pattern to search for", required: true },
      { name: "files", description: "Files to search (not implemented in terminal)", required: false }
    ],
    handler: async (args, ctx) => {
      const { flags, positional } = args;

      if (flags.examples) {
        showExamples(ctx);
        return;
      }

      const pattern = flags.regexp || positional[0];

      if (!ctx.input) {
        ctx.io.printError("grep: no input provided. Use pipe to provide input text.");
        return;
      }

      if (!pattern) {
        ctx.io.printError("grep: no pattern specified");
        return;
      }

      try {
        const result = await processInput(ctx.input, pattern, flags, ctx);

        if (flags.quiet) {
          return;
        }

        if (flags.count) {
          ctx.io.print(result.count.toString());
          return;
        }

        if (flags.stats) {
          showStats(result, ctx);
          return;
        }

        result.lines.forEach(line => ctx.io.print(line));

      } catch (error) {
        ctx.io.printError(`grep: ${error.message}`);
      }
    },
  });

  async function processInput(input, pattern, flags, ctx) {
    const lines = input.split('\n');
    const results = {
      matchingLines: [],
      lineNumbers: [],
      matches: [],
      count: 0,
      lines: [],
      uniqueMatches: new Set()
    };

    const regex = createRegex(pattern, flags);

    let matchCount = 0;
    const maxCount = flags['max-count'];

    for (let i = 0; i < lines.length; i++) {
      if (maxCount && matchCount >= maxCount) break;

      const line = lines[i];
      const isMatch = testLine(line, regex, flags);

      const shouldInclude = flags['invert-match'] ? !isMatch : isMatch;

      if (shouldInclude) {
        results.matchingLines.push(line);
        results.lineNumbers.push(i + 1);
        matchCount++;

        if (flags.unique && isMatch) {
          const matches = extractMatches(line, regex, flags);
          matches.forEach(match => results.uniqueMatches.add(match));
        }
      }
    }

    results.count = matchCount;

    if (flags.unique) {
      results.lines = Array.from(results.uniqueMatches);
    } else {
      results.lines = generateOutputLines(results, lines, flags);
    }

    return results;
  }

  function createRegex(pattern, flags) {
    let regexPattern = pattern;
    let regexFlags = '';

    if (flags['ignore-case']) {
      regexFlags += 'i';
    }

    if (flags['fixed-strings']) {
      regexPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    } else if (!flags.regex) {
      if (flags['word-regexp']) {
        regexPattern = `\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`;
      } else if (flags['line-regexp']) {
        regexPattern = `^${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`;
      } else {
        regexPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
    } else {
      if (flags['word-regexp']) {
        regexPattern = `\\b(${pattern})\\b`;
      } else if (flags['line-regexp']) {
        regexPattern = `^(${pattern})$`;
      }
    }

    regexFlags += 'g';

    try {
      return new RegExp(regexPattern, regexFlags);
    } catch (error) {
      throw new Error(`Invalid regex pattern: ${error.message}`);
    }
  }

  function testLine(line, regex, flags) {
    if (flags['line-regexp']) {
      return regex.test(line);
    }
    return regex.test(line);
  }

  function extractMatches(line, regex, flags) {
    const matches = [];
    let match;

    regex.lastIndex = 0;

    while ((match = regex.exec(line)) !== null) {
      matches.push(match[0]);
      if (!regex.global) break;
    }

    return matches;
  }

  function generateOutputLines(results, allLines, flags) {
    const outputLines = [];
    const shouldHighlight = flags.color === 'always' ||
      (flags.color === 'auto' && !flags.quiet && !flags.count);

    for (let i = 0; i < results.matchingLines.length; i++) {
      const line = results.matchingLines[i];
      const lineNum = results.lineNumbers[i];
      const actualLineIndex = lineNum - 1;

      if (flags.context || flags['before-context'] || flags['after-context']) {
        const contextBefore = flags.context || flags['before-context'] || 0;
        const contextAfter = flags.context || flags['after-context'] || 0;

        for (let j = Math.max(0, actualLineIndex - contextBefore); j < actualLineIndex; j++) {
          outputLines.push(formatLine(allLines[j], j + 1, false, flags, shouldHighlight));
        }
      }

      if (flags['only-matching']) {
        const regex = createRegex(flags.regexp || '', flags);
        const matches = extractMatches(line, regex, flags);
        matches.forEach(match => {
          outputLines.push(formatLine(match, lineNum, true, flags, shouldHighlight));
        });
      } else {
        outputLines.push(formatLine(line, lineNum, true, flags, shouldHighlight));
      }

      if (flags.context || flags['after-context']) {
        const contextAfter = flags.context || flags['after-context'] || 0;
        for (let j = actualLineIndex + 1; j <= Math.min(allLines.length - 1, actualLineIndex + contextAfter); j++) {
          outputLines.push(formatLine(allLines[j], j + 1, false, flags, shouldHighlight));
        }
      }

      if ((flags.context || flags['before-context'] || flags['after-context']) &&
        i < results.matchingLines.length - 1) {
        outputLines.push('--');
      }
    }

    return outputLines;
  }

  function formatLine(line, lineNum, isMatch, flags, shouldHighlight) {
    let formattedLine = line;

    if (flags['line-number']) {
      formattedLine = `${lineNum}:${formattedLine}`;
    }

    if (shouldHighlight && isMatch && !flags['invert-match']) {
      formattedLine = highlightMatches(formattedLine, flags);
    }

    return formattedLine;
  }

  function highlightMatches(line, flags) {
    const pattern = flags.regexp || '';
    if (!pattern) return line;

    try {
      const regex = createRegex(pattern, flags);
      const colorCodes = {
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m'
      };
      const resetCode = '\x1b[0m';
      const color = colorCodes[flags['highlight-color']] || colorCodes.red;

      return line.replace(regex, `${color}$&${resetCode}`);
    } catch (error) {
      return line;
    }
  }

  function showStats(result, ctx) {
    ctx.io.print("📊 Grep Statistics:");
    ctx.io.print("─".repeat(20));
    ctx.io.print(`Matching lines: ${result.count}`);
    ctx.io.print(`Total matches: ${result.matchingLines.length}`);

    if (result.uniqueMatches.size > 0) {
      ctx.io.print(`Unique matches: ${result.uniqueMatches.size}`);
    }

    if (result.matchingLines.length > 0) {
      const avgLineLength = result.matchingLines.reduce((sum, line) => sum + line.length, 0) / result.matchingLines.length;
      ctx.io.print(`Average line length: ${Math.round(avgLineLength)} chars`);
    }
  }

  function showExamples(ctx) {
    ctx.io.print("🔍 Grep Usage Examples:");
    ctx.io.print("─".repeat(25));
    ctx.io.print("");

    const examples = [
      {
        desc: "Basic text search",
        cmd: `echo "Hello World\\nGoodbye World" | grep "World"`
      },
      {
        desc: "Case-insensitive search",
        cmd: `echo "Hello WORLD\\nhello world" | grep -i "hello"`
      },
      {
        desc: "Show line numbers",
        cmd: `echo "Line 1\\nLine 2\\nLine 3" | grep -n "2"`
      },
      {
        desc: "Invert match (show non-matching)",
        cmd: `echo "Apple\\nBanana\\nCherry" | grep -v "Banana"`
      },
      {
        desc: "Count matches only",
        cmd: `echo "test\\ntest\\nother" | grep -c "test"`
      },
      {
        desc: "Whole word matching",
        cmd: `echo "testing\\ntest\\ncontest" | grep -w "test"`
      },
      {
        desc: "Regular expressions",
        cmd: `echo "cat\\ndog\\ncow" | grep -E "c(at|ow)"`
      },
      {
        desc: "Context lines",
        cmd: `echo "A\\nB\\nC\\nD\\nE" | grep -C 1 "C"`
      },
      {
        desc: "Only show matching parts",
        cmd: `echo "hello world 123" | grep -o "[0-9]+"`
      },
      {
        desc: "Multiple conditions",
        cmd: `echo "Error: failed\\nInfo: success" | grep -i -n "error"`
      }
    ];

    examples.forEach((example, index) => {
      ctx.io.print(`${index + 1}. ${example.desc}:`);
      ctx.io.print(`   ${example.cmd}`);
      ctx.io.print("");
    });

    ctx.io.print("💡 Tips:");
    ctx.io.print("• Use | (pipe) to pass output from other commands to grep");
    ctx.io.print("• Combine flags like: grep -in 'pattern' for case-insensitive + line numbers");
    ctx.io.print("• Use --regex for advanced regular expressions");
    ctx.io.print("• Try --stats to see matching statistics");
  }
};

export { initGrepCommand };
