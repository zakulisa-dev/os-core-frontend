import { AppManagerAPI } from './appManager';
import { registerTerminalApp } from '@Apps/terminal/registerTerminalApp';
import { registerSettingsApp } from '@Settings/registerSettingsApp';
import { registerCalculatorApp } from '@Calculator/registerCalculator';
import { registerAchievementsApp } from '@Apps/achievements/registerAchievements';
import { registerExplorerApp } from '@Apps/explorer/registerExplorer';
import { registerBrowserApp } from '@Apps/browser/registerBrowser';
import { registerBullsAndCowsApp } from '@Apps/bullsAndCows/initBullsAndCows';
import { registerMinesweeperApp } from '@nameless-os/minesweeper';
import { CoreAPI, EventBusAPI } from '@nameless-os/sdk';
import { initTerminalAchievements } from '@Apps/terminal/initTerminalAchievements';
import { registerToDoApp } from '@ToDo/registerToDoApp';
import { registerTranslateApp } from '@Translate/registerTranslateApp';
import { registerSimonApp } from '@Simon/registerSimonApp';
import { registerTextEditorApp } from '@Apps/textEditor/registerTextEditorApp';
import { registerMediaViewerApp } from '@Apps/mediaViewer/registerMediaViewerApp';
import { registerJSDosApp } from '@Apps/js-dos/registerJsDos';

export function registerBaseApps(systemApi: CoreAPI) {
  registerTerminalApp(systemApi);
  registerSettingsApp(systemApi);
  registerCalculatorApp(systemApi);
  registerAchievementsApp(systemApi);
  registerExplorerApp(systemApi);
  registerBrowserApp();
  registerBullsAndCowsApp(systemApi);
  registerMinesweeperApp();
  registerToDoApp(systemApi);
  registerTranslateApp(systemApi);
  registerSimonApp(systemApi);
  registerTextEditorApp(systemApi);
  registerMediaViewerApp(systemApi);
  registerJSDosApp(systemApi);
  initTerminalAchievements(systemApi);
}

export function initAppAPI(eventBus: EventBusAPI) {
  return new AppManagerAPI(eventBus);
}
