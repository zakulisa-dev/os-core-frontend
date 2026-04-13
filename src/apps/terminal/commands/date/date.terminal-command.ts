import { defineFlags, TerminalAPI } from '@nameless-os/sdk';

const getTimezoneEmoji = (tz: string) => {
  if (/tokyo|seoul|asia\/(tokyo|seoul|osaka|sapporo)/i.test(tz)) return "🗾";
  if (/moscow|europe\/moscow/i.test(tz)) return "🩰";
  if (/new_york|america\/new_york/i.test(tz)) return "🗽";
  if (/london|europe\/london/i.test(tz)) return "🕰";
  if (/berlin|europe\/berlin/i.test(tz)) return "🍻";
  if (/paris|europe\/paris/i.test(tz)) return "🥐";
  if (/hong_kong|asia\/hong_kong/i.test(tz)) return "🏮";
  if (/sydney|australia\/sydney/i.test(tz)) return "🦘";
  if (/los_angeles|america\/los_angeles/i.test(tz)) return "🎬";
  if (/beijing|asia\/shanghai/i.test(tz)) return "🐉";
  if (/delhi|india|kolkata|asia\/kolkata/i.test(tz)) return "🕌";
  return "🌐";
};

const initDateCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "date",
    description: "Show current date and time",
    flags: defineFlags([
      {
        name: 'timezone',
        aliases: ['tz', 't'],
        type: 'string',
        conflictsWith: ['utc'],
      },
      {
        name: 'iso',
        aliases: ['i'],
        type: 'boolean',
        conflictsWith: ['utc'],
      },
      {
        name: 'utc',
        aliases: ['u'],
        type: 'boolean',
        conflictsWith: ['iso', 'tz'],
      },
    ]),
    handler: (args, ctx) => {
      const now = new Date();
      const tz = args.flags.timezone;
      const formatIso = args.flags.iso;
      const formatUtc = args.flags.utc;

      const emoji = tz ? getTimezoneEmoji(tz as string) : "📆";

      if (formatIso) {
        try {
          const formatter = new Intl.DateTimeFormat("sv-SE", {
            timeZone: tz || undefined,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          const parts = Object.fromEntries(
            formatter.formatToParts(now)
              .filter((part) => part.type !== "literal")
              .map((part) => [part.type, part.value])
          );

          const isoLike = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
          ctx.io.print(`${emoji} ${isoLike} (${tz || "local"})`);
        } catch (err) {
          ctx.io.print(`❌ Invalid timezone: "${tz}"`);
        }
        return;
      }

      if (formatUtc) {
        ctx.io.print(`🌐 ${now.toUTCString()} (UTC)`);
        return;
      }

      if (tz) {
        try {
          const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: tz as string,
            dateStyle: "full",
            timeStyle: "long",
          });
          ctx.io.print(`${emoji} ${formatter.format(now)} (${tz})`);
        } catch (err) {
          ctx.io.print(`❌ Invalid timezone: "${tz}"`);
        }
        return;
      }

      ctx.io.print(`📆 ${now.toLocaleDateString()} 🕒 ${now.toLocaleTimeString()} (local)`);
    },
  });
};

export { initDateCommand };
