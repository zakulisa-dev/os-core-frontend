import { v4 as uuidv4 } from "uuid";
import { TerminalAPI } from '@nameless-os/sdk';

const initUuidCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: "uuid",
    description: "Generate a UUID v4",
    handler: (_, ctx) => {
      ctx.io.print(uuidv4());
    },
  });
};

export { initUuidCommand };
