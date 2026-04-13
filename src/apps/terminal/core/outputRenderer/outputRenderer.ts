import { useTerminalStore } from '@Apps/terminal/stores/useTerminal.store';
import AnsiToHtml from 'ansi-to-html';


export class OutputRenderer {
  private ansiConverter = new AnsiToHtml();

  print(text: string, appId: string): string {
    const groupId = crypto.randomUUID();

    text.split('\n').forEach(line => {
      const html = this.ansiConverter.toHtml(line);
      useTerminalStore.getState().addOutput(appId, html, 'output', groupId);
    });

    return groupId;
  }

  printError(text: string, appId: string): string {
    const groupId = crypto.randomUUID();
    const RED = '\x1b[38;5;160m';
    const RESET = '\x1b[0m';

    text.split('\n').forEach(line => {
      const coloredLine = `${RED}${line}${RESET}`;
      const html = this.ansiConverter.toHtml(coloredLine);
      useTerminalStore.getState().addOutput(appId, html, 'error', groupId);
    });

    return groupId;
  }

  updateMessage(groupId: string, newContent: string, appId: string): void {
    const htmlContent = newContent.split('\n')
      .map(line => this.ansiConverter.toHtml(line))
      .join('\n');

    useTerminalStore.getState().updateGroup(appId, groupId, htmlContent);
  }

  deleteMessage(groupId: string, appId: string): void {
    useTerminalStore.getState().deleteGroup(appId, groupId);
  }

  clear(appId: string): void {
    useTerminalStore.getState().clearHistory(appId);
  }
}