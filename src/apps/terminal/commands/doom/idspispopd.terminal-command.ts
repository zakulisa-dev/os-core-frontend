import { TerminalAPI } from '@nameless-os/sdk';

function initIdspispopdCommand(terminalApi: TerminalAPI) {
  terminalApi.registerCommand({
    name: "idspispopd",
    description: "Original no-clip cheat code",
    hidden: true,
    handler: (_, ctx) => {
      ctx.io.print("🎮 Classic cheat detected!");
      ctx.io.print("🔄 Redirecting to modern no-clip...");
      setTimeout(() => {
        terminalApi.executeCommand("idclip", ctx.info.appId);
      }, 1000);
    }
  });
}

export { initIdspispopdCommand };