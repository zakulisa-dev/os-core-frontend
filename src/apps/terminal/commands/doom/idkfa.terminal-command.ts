import { defineFlags, Nullable, SoundAPI, TerminalAPI } from '@nameless-os/sdk';

interface State {
  enabled: boolean;
  soundInstance: Nullable<string>;
  enabledAt: Nullable<number>;
  sessionStats: {
    timesActivated: number;
    totalTimeActive: number;
    lastActivated: Nullable<string>;
  };
}

const godModeState: State = {
  enabled: false,
  soundInstance: null,
  enabledAt: null,
  sessionStats: {
    timesActivated: 0,
    totalTimeActive: 0,
    lastActivated: null,
  },
};

const flagsDef = defineFlags([
  {
    name: 'silent',
    aliases: ['s'],
    type: 'boolean',
    description: 'Enable god mode without sound',
    default: false,
  },
  {
    name: 'volume',
    aliases: ['v'],
    type: 'number',
    description: 'Sound volume (0.0-1.0)',
    default: 0.3,
  },
  {
    name: 'status',
    type: 'boolean',
    description: 'Show current god mode status',
    default: false,
  },
  {
    name: 'disable',
    aliases: ['off'],
    type: 'boolean',
    description: 'Disable god mode',
    default: false,
  },
  {
    name: 'stats',
    type: 'boolean',
    description: 'Show god mode statistics',
    default: false,
  },
  {
    name: 'reset-stats',
    type: 'boolean',
    description: 'Reset god mode statistics',
    default: false,
  },
  {
    name: 'classic',
    aliases: ['c'],
    type: 'boolean',
    description: 'Classic DOOM style output only',
    default: false,
  },
  {
    name: 'easter-egg',
    aliases: ['ee'],
    type: 'boolean',
    description: 'Show additional easter eggs',
    default: false,
    hidden: true,
  },
]);

function initIdkfaCommand(terminalApi: TerminalAPI, soundApi: SoundAPI) {
  terminalApi.registerCommand({
    name: 'idkfa',
    description: 'Enables god mode (DOOM cheat code style) with various options',
    hidden: true,
    flags: flagsDef,
    handler: ({ flags }, ctx) => {
      if (flags['reset-stats']) {
        godModeState.sessionStats = {
          timesActivated: 0,
          totalTimeActive: 0,
          lastActivated: null,
        };
        ctx.io.print('📊 God mode statistics have been reset.');
        return;
      }

      if (flags.stats) {
        const stats = godModeState.sessionStats;
        const currentStatus = godModeState.enabled ? 'ACTIVE' : 'INACTIVE';
        const activeTime = godModeState.enabled && godModeState.enabledAt
          ? Math.floor((Date.now() - godModeState.enabledAt) / 1000)
          : 0;

        ctx.io.print('📊 GOD MODE STATISTICS');
        ctx.io.print('─'.repeat(25));
        ctx.io.print(`Status: ${currentStatus}`);
        ctx.io.print(`Times activated: ${stats.timesActivated}`);
        ctx.io.print(`Total time active: ${Math.floor(stats.totalTimeActive / 1000)}s`);
        ctx.io.print(`Current session: ${activeTime}s`);
        ctx.io.print(`Last activated: ${stats.lastActivated || 'Never'}`);
        return;
      }

      if (flags.status) {
        if (godModeState.enabled) {
          const activeTime = Math.floor((Date.now() - (godModeState.enabledAt || 0)) / 1000);
          ctx.io.print(`🟢 God mode is ACTIVE (${activeTime}s)`);
          ctx.io.print('💥 Infinite ammo enabled');
          ctx.io.print('🔫 All weapons unlocked');
          ctx.io.print('🛡️ Invincibility active');
        } else {
          ctx.io.print('🔴 God mode is INACTIVE');
          ctx.io.print('💀 Mortality restored');
        }
        return;
      }

      if (flags.disable) {
        if (!godModeState.enabled) {
          ctx.io.print('⚠️ God mode is already disabled.');
          return;
        }

        if (godModeState.enabledAt) {
          const sessionTime = Date.now() - godModeState.enabledAt;
          godModeState.sessionStats.totalTimeActive += sessionTime;
        }

        if (godModeState.soundInstance) {
          try {
            soundApi.stop(godModeState.soundInstance);
          } catch (e) {
          }
          godModeState.soundInstance = null;
        }

        godModeState.enabled = false;
        godModeState.enabledAt = null;

        if (flags.classic) {
          ctx.io.print('🔴 God mode disabled.');
        } else {
          ctx.io.print('🔴 GOD MODE DISABLED');
          ctx.io.print('💀 Mortality restored. You are now vulnerable.');
          ctx.io.print('🔫 Weapons returned to normal state.');
          ctx.io.print('⚰️ May the RNG gods have mercy on your soul...');
        }
        return;
      }

      if (godModeState.enabled) {
        ctx.io.print('⚠️ God mode is already enabled! Use --disable to turn off.');
        return;
      }

      if (!flags.silent) {
        const volume = Math.max(0.0, Math.min(1.0, flags.volume));
        try {
          godModeState.soundInstance = soundApi.playUrl('/assets/sounds/doom.mp3', {
            loop: true,
            volume: volume,
            appId: ctx.info.appId,
          });
        } catch (e) {
          ctx.io.print('⚠️ Sound playback failed, but god mode still enabled.');
        }
      }

      godModeState.enabled = true;
      godModeState.enabledAt = Date.now();
      godModeState.sessionStats.timesActivated++;
      godModeState.sessionStats.lastActivated = new Date().toLocaleString();

      if (flags.classic) {
        ctx.io.print('🟥 God mode enabled.');
        ctx.io.print('💥 Infinite ammo. 🔫 All weapons unlocked.');
      } else {
        ctx.io.print('🟥 ═══════════════════════════════');
        ctx.io.print('🔥    GOD MODE ACTIVATED    🔥');
        ctx.io.print('🟥 ═══════════════════════════════');
        ctx.io.print('');
        ctx.io.print('💥 INFINITE AMMO ENABLED');
        ctx.io.print('🔫 ALL WEAPONS UNLOCKED');
        ctx.io.print('🛡️ INVINCIBILITY ACTIVE');
        ctx.io.print('⚡ UNLIMITED POWER');
        ctx.io.print('');

        if (flags['easter-egg']) {
          const easterEggs = [
            '👹 The demons fear you now...',
            '🔥 Rip and tear, until it is done!',
            '💀 Death becomes a mere inconvenience',
            '🎯 Every shot finds its mark',
            '⚔️ You are the Alpha and the Omega',
            '🌟 Ascended beyond mortal limitations',
          ];
          const randomEgg = easterEggs[Math.floor(Math.random() * easterEggs.length)];
          ctx.io.print(randomEgg);
          ctx.io.print('');
        }

        ctx.io.print('🎮 Type \'idkfa --disable\' to return to mortal realm');
        ctx.io.print('📊 Use \'idkfa --stats\' to view your divine statistics');
      }

      if (flags.silent) {
        ctx.io.print('🔇 (Silent mode - no background music)');
      }
    },
  });
}

export { initIdkfaCommand };