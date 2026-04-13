import { useTerminalStore } from '@Apps/terminal/stores/useTerminal.store';
import { TerminalAPI } from '@nameless-os/sdk';

const initNextCommand = (terminalApi: TerminalAPI) => {
  terminalApi.registerCommand({
    name: 'next',
    hidden: true,
    description: 'Show next page from paginated output',
    handler: (_, ctx) => {
      const terminalData = useTerminalStore.getState().get(ctx.info.appId);
      const { setPager } = useTerminalStore.getState();

      if (!terminalData!.pager) {
        ctx.io.print('No active pager.');
        return;
      }

      const { lines, currentPage, pageSize } = terminalData!.pager;
      const start = currentPage * pageSize;
      const end = start + pageSize;

      const page = lines.slice(start, end);
      page.forEach(ctx.io.print);

      if (end >= lines.length) {
        ctx.io.print('-- End of output --');
        setPager(ctx.info.appId, null);
      } else {
        ctx.io.print(`-- More (type "next") --`);
        setPager(ctx.info.appId, {
          ...terminalData!.pager,
          currentPage: currentPage + 1,
        });
      }
    },
  });
};

export { initNextCommand };
