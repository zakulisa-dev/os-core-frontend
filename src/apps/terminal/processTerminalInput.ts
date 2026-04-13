import { useTerminalStore } from '@Apps/terminal/stores/useTerminal.store';
import { systemApi } from '../../index';
import { AppInstanceId } from '@nameless-os/sdk';

export const processTerminalInput = async (input: string, appId: AppInstanceId): Promise<void> => {
  const { addOutput } = useTerminalStore.getState();

  try {
    await systemApi.terminal.executeCommand(input, appId);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[processTerminalInput] Error processing input "${input}":`, error);
    addOutput(appId, `❌ Error: ${errorMessage}`);
  }
};