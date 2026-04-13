export class PathUtils {
  static normalize(path: string): string {
    let newPath = path;

    if (!newPath.startsWith('/')) {
      newPath = '/' + newPath;
    }

    newPath = newPath.replace(/\/+/g, '/');
    if (newPath.length > 1 && newPath.endsWith('/')) {
      newPath = newPath.slice(0, -1);
    }

    return newPath || '/';
  }

  static join(...parts: string[]): string {
    const joined = parts
      .filter(part => part && part !== '/')
      .join('/')
      .replace(/\/+/g, '/');

    return this.normalize(joined);
  }

  static dirname(path: string): string {
    const normalized = this.normalize(path);
    if (normalized === '/') return '/';

    const lastSlash = normalized.lastIndexOf('/');
    return lastSlash <= 0 ? '/' : normalized.slice(0, lastSlash);
  }

  static basename(path: string): string {
    const normalized = this.normalize(path);
    if (normalized === '/') return '';

    const lastSlash = normalized.lastIndexOf('/');
    return normalized.slice(lastSlash + 1);
  }

  static isSubPath(childPath: string, parentPath: string): boolean {
    const normalizedChild = this.normalize(childPath);
    const normalizedParent = this.normalize(parentPath);

    if (normalizedParent === '/') return true;
    return normalizedChild.startsWith(normalizedParent + '/');
  }

  static getPathParts(path: string): string[] {
    const normalized = this.normalize(path);
    return normalized === '/' ? [] : normalized.slice(1).split('/');
  }
}

export function resolvePath(currentDir: string, targetPath: string): string {
  if (!targetPath) {
    return '/';
  }

  const newCurrentDir = normalize(currentDir);

  if (targetPath === '~') {
    return '/home';
  }

  if (targetPath.startsWith('~/')) {
    const relativePath = targetPath.substring(2);
    return normalize(`/home/${relativePath}`);
  }

  if (targetPath.startsWith('/')) {
    return normalize(targetPath);
  }

  let basePath: string;
  let relativePart: string;

  if (targetPath === '..') {
    basePath = dirname(newCurrentDir);
    relativePart = '';
  } else if (targetPath.startsWith('../')) {
    basePath = newCurrentDir;
    relativePart = targetPath;
  } else if (targetPath.startsWith('./')) {
    basePath = newCurrentDir;
    relativePart = targetPath.substring(2);
  } else {
    basePath = newCurrentDir;
    relativePart = targetPath;
  }

  return resolveRelativePath(basePath, relativePart);
}

function resolveRelativePath(basePath: string, relativePath: string): string {
  if (!relativePath) {
    return normalize(basePath);
  }

  const baseParts = basePath.split('/').filter(p => p && p !== '.');
  const relativeParts = relativePath.split('/').filter(p => p);

  for (const part of relativeParts) {
    if (part === '..') {
      baseParts.pop();
    } else if (part && part !== '.') {
      baseParts.push(part);
    }
  }

  const result = '/' + baseParts.join('/');
  return result === '//' ? '/' : result;
}

export function normalize(path: string): string {
  if (!path || path === '/') return '/';

  const parts = path.split('/').filter(part => part && part !== '.');

  const resolved: string[] = [];

  for (const part of parts) {
    if (part === '..') {
      resolved.pop();
    } else {
      resolved.push(part);
    }
  }

  const result = '/' + resolved.join('/');
  return result === '//' ? '/' : result;
}

export function isSubPath(path: string, parent: string): boolean {
  const normalizedPath = normalize(path);
  const normalizedParent = normalize(parent);

  if (normalizedParent === '/') {
    return normalizedPath !== '/';
  }

  return normalizedPath.startsWith(normalizedParent + '/');
}

export function relative(from: string, to: string): string {
  const fromParts = normalize(from).split('/').filter(p => p);
  const toParts = normalize(to).split('/').filter(p => p);

  let i = 0;
  while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
    i++;
  }

  const upLevels = fromParts.length - i;
  const downParts = toParts.slice(i);

  const relativeParts: string[] = [];

  for (let j = 0; j < upLevels; j++) {
    relativeParts.push('..');
  }

  relativeParts.push(...downParts);

  return relativeParts.length === 0 ? '.' : relativeParts.join('/');
}

export function getPathParts(path: string): string[] {
  return normalize(path).split('/').filter(p => p);
}

export function join(...parts: string[]): string {
  const filtered = parts.filter(p => p);
  if (filtered.length === 0) return '/';

  const joined = filtered.join('/');
  return normalize(joined.startsWith('/') ? joined : '/' + joined);
}

export function basename(path: string): string {
  const normalized = normalize(path);
  if (normalized === '/') return '';

  const parts = normalized.split('/');
  return parts[parts.length - 1] || '';
}

export function dirname(path: string): string {
  const normalized = normalize(path);
  if (normalized === '/') return '/';

  const parts = normalized.split('/').filter(p => p);
  parts.pop();

  return parts.length === 0 ? '/' : '/' + parts.join('/');
}

export function extname(path: string): string {
  const name = basename(path);
  const dotIndex = name.lastIndexOf('.');

  return dotIndex === -1 || dotIndex === 0 ? '' : name.substring(dotIndex);
}

export function isAbsolute(path: string): boolean {
  return path.startsWith('/');
}

export function getHomeDirectory(user?: string): string {
  return user ? `/home/${user}` : '/home';
}
