export interface FSConfig {
  syncIntervalMs: number;
  maxCacheSize: number;
  indexedDBName: string;
  indexedDBVersion: number;
  defaultPermissions: {
    file: string;
    directory: string;
  };
  reservedPaths: string[];
  maxFileSize: number;
  allowedFileTypes: string[];
  maxTotalSize?: number;
}

export const defaultFSConfig: FSConfig = {
  syncIntervalMs: 5000,
  maxCacheSize: 1000,
  indexedDBName: 'NamelessOSFileSystem',
  indexedDBVersion: 1,
  defaultPermissions: {
    file: 'rw-r--r--',
    directory: 'rwxr-xr-x'
  },
  reservedPaths: ['/', '/bin', '/usr', '/var'],
  maxFileSize: 1024 * 1024 * 1024,
  allowedFileTypes: [
    '.txt', '.js', '.ts', '.json', '.md', '.html', '.css',
    '.xml', '.csv', '.log', '.conf', '.ini', '.yml', '.yaml'
  ]
};