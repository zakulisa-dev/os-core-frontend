import { ImprovedWebOSFileSystem } from './fs.api-implementation';

export async function initFsAPI() {
  const fs = new ImprovedWebOSFileSystem()
  await fs.init();
  return fs;
}
