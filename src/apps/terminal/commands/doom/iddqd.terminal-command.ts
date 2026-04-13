import { TerminalAPI } from '@nameless-os/sdk';

function initIddqdCommand(terminalApi: TerminalAPI) {
  terminalApi.registerCommand({
    name: 'iddqd',
    description: 'Alternative god mode activation (DOOM cheat)',
    hidden: true,
    handler: (_, ctx) => {
      ctx.io.print('🔄 Redirecting to IDKFA...');
      setTimeout(() => {
        terminalApi.executeCommand('idkfa', ctx.info.appId);
      }, 500);
    },
  });
}

export { initIddqdCommand };