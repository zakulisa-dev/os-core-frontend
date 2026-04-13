import { AppId, Nullable } from '@nameless-os/sdk';

type FileExtension = string;

interface AppAssociation {
  appId: AppId;
  isDefault?: boolean;
  priority?: number;
}

class FileAssociationRegistry {
  private associations: Record<FileExtension, AppAssociation[]> = {};

  registerAssociation(extensions: string[], appId: AppId, isDefault = false, priority = 0) {
    const association: AppAssociation = { appId, isDefault, priority };

    extensions.forEach(ext => {
      if (!this.associations[ext]) {
        this.associations[ext] = [];
      }
      this.associations[ext].push(association);
      this.associations[ext].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    });
  }

  getDefaultAppForFile(filename: string): Nullable<AppId> {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext || !this.associations[ext]) return null;

    const apps = this.associations[ext];
    return apps.find(app => app.isDefault)?.appId || apps[0]?.appId || null;
  }

  getAppsForFile(filename: string): AppAssociation[] {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext ? (this.associations[ext] || []) : [];
  }

  setDefaultApp(extension: string, appId: AppId) {
    if (this.associations[extension]) {
      for (const app of this.associations[extension]) {
        app.isDefault = app.appId === appId;
      }
    }
  }
}

export const fileRegistry = new FileAssociationRegistry();
