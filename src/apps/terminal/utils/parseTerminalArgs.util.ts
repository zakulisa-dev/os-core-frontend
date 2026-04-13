import { CommandFlag } from '@nameless-os/sdk';

const escapeHtml = (unsafe: string): string =>
  unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

function castValue(type: string | boolean | number, raw: string): string | boolean | number {
  switch (type) {
    case 'string': return raw;
    case 'number': {
      const num = Number(raw);
      if (isNaN(num)) throw new Error(`Expected number, got "${raw}"`);
      return num;
    }
    case 'boolean': return raw === 'true' || raw === '1';
  }
}

function parseTerminalArgs(
  args: string[],
  flagDefs: CommandFlag[] = []
): { flags: Record<string, string | boolean | number>; positional: string[] } {
  const flags: Record<string, string | boolean | number> = {};
  const positional: string[] = [];

  const nameMap = new Map<string, CommandFlag>();
  const aliasMap = new Map<string, string>();

  for (const def of flagDefs) {
    nameMap.set(def.name, def);
    flags[def.name] = def.default ?? (def.type === 'boolean' ? false : undefined);
    def.aliases?.forEach(alias => aliasMap.set(alias, def.name));
  }

  let parsingFlags = true;
  let i = 0;

  while (i < args.length) {
    const arg = args[i];

    if (arg === '--') {
      parsingFlags = false;
      i++;
      continue;
    }

    if (!parsingFlags) {
      positional.push(arg);
      i++;
      continue;
    }

    if (arg.startsWith('--') && arg.includes('=')) {
      const [rawKey, rawValue] = arg.slice(2).split('=', 2);
      const canonical = nameMap.get(rawKey) ? rawKey : aliasMap.get(rawKey);

      if (!canonical || !nameMap.has(canonical)) {
        throw new Error(`Unknown flag --${rawKey}`);
      }

      const def = nameMap.get(canonical)!;

      if (def.type === 'boolean') {
        throw new Error(`Boolean flag --${def.name} doesn't accept a value`);
      }

      const casted = castValue(def.type, rawValue);

      if (def.type === 'string' && def.values && !def.values.includes(casted as string)) {
        throw new Error(
          `Invalid value for --${def.name}. Expected one of: ${def.values.join(', ')}, got "${rawValue}".`
        );
      }

      if (def.type === 'string') {
        flags[canonical] = escapeHtml(casted as string);
      } else {
        flags[canonical] = casted;
      }
    }

    else if (arg.startsWith('--')) {
      const rawKey = arg.slice(2);
      const canonical = nameMap.get(rawKey) ? rawKey : aliasMap.get(rawKey);

      if (!canonical || !nameMap.has(canonical)) {
        throw new Error(`Unknown flag "--${rawKey}". Use --help to see supported options.`);
      }

      const def = nameMap.get(canonical)!;
      const next = args[i + 1];

      if (def.type === 'boolean') {
        flags[canonical] = true;
      } else if (next && !next.startsWith('-')) {
        const casted = castValue(def.type, next);

        if (def.type === 'string' && def.values && !def.values.includes(casted as string)) {
          throw new Error(
            `Invalid value for --${def.name}. Expected one of: ${def.values.join(', ')}, got "${next}".`
          );
        }

        if (def.type === 'string') {
          flags[canonical] = escapeHtml(casted as string);
        } else {
          flags[canonical] = casted;
        }
      } else {
        throw new Error(`Flag --${def.name} requires a value`);
      }
    }

    else if (arg.startsWith('-') && arg.length > 2) {
      for (const char of arg.slice(1)) {
        const canonical = aliasMap.get(char);
        if (!canonical || !nameMap.has(canonical)) {
          throw new Error(`Unknown flag -${char}`);
        }

        const def = nameMap.get(canonical)!;
        if (def.type !== 'boolean') {
          throw new Error(`Flag -${char} must be boolean to be grouped`);
        }

        flags[canonical] = true;
      }
    }

    else if (arg.startsWith('-') && arg.length === 2) {
      const alias = arg[1];
      const canonical = aliasMap.get(alias);
      if (!canonical || !nameMap.has(canonical)) {
        throw new Error(`Unknown flag -${alias}`);
      }

      const def = nameMap.get(canonical)!;
      const next = args[i + 1];

      if (def.type === 'boolean') {
        flags[canonical] = true;
      } else if (next && !next.startsWith('-')) {
        const casted = castValue(def.type, next);

        if (def.type === 'string' && def.values && !def.values.includes(casted as string)) {
          throw new Error(
            `Invalid value for --${def.name}. Expected one of: ${def.values.join(', ')}, got "${next}".`
          );
        }

        if (def.type === 'string') {
          flags[canonical] = escapeHtml(casted as string);
        } else {
          flags[canonical] = casted;
        }
        i++;
      } else {
        throw new Error(`Flag -${alias} requires a value`);
      }
    }

    else {
      positional.push(arg);
    }

    i++;
  }

  for (const def of flagDefs) {
    if (def.required && (flags[def.name] === undefined || flags[def.name] === null)) {
      throw new Error(`Missing required flag --${def.name}`);
    }
  }

  for (const def of flagDefs) {
    if (flags[def.name]) {
      for (const conflict of def.conflictsWith || []) {
        if (flags[conflict]) {
          throw new Error(`Flags "--${def.name}" and "--${conflict}" cannot be used together.`);
        }
      }
    }
  }

  for (const def of flagDefs) {
    if (def.exclusive && flags[def.name] && positional.length > 0) {
      throw new Error(`Flag "--${def.name}" cannot be used with positional arguments.`);
    }
  }

  const escapedPositional = positional.map(escapeHtml);
  return { flags, positional: escapedPositional };
}


export { parseTerminalArgs };
