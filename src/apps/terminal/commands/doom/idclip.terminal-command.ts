import { TerminalAPI } from '@nameless-os/sdk';

function initIdclipCommand(terminalApi: TerminalAPI) {
  terminalApi.registerCommand({
    name: "idclip",
    description: "Enables no-clip mode (cosmetic only)",
    hidden: true,
    handler: (_, ctx) => {
      ctx.io.print("👻 NO-CLIP MODE ENABLED");
      ctx.io.print("🚶‍♂️ You can now walk through walls... in theory.");
      ctx.io.print("⚠️ (This is just for show, actual no-clip not implemented)");
    }
  });
}

export { initIdclipCommand };