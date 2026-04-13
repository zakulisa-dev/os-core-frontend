export class PathValidator {
  private static readonly MAX_PATH_LENGTH = 4096;
  private static readonly MAX_FILENAME_LENGTH = 255;
  private static readonly MAX_DEPTH = 100;
  private static readonly RESERVED_NAMES = new Set([
    'CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5',
    'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4',
    'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ]);

  static validatePath(path: string): void {
    if (!path) {
      throw new Error('Path must be a non-empty string');
    }

    if (path.length > this.MAX_PATH_LENGTH) {
      throw new Error(`Path too long: maximum ${this.MAX_PATH_LENGTH} characters`);
    }

    if (path.includes('..') || path.includes('//')) {
      throw new Error('Invalid path: path traversal patterns detected');
    }

    if (!path.startsWith('/')) {
      throw new Error('Path must be absolute (start with /)');
    }

    const depth = path.split('/').length - 1;
    if (depth > this.MAX_DEPTH) {
      throw new Error(`Path too deep: maximum ${this.MAX_DEPTH} levels`);
    }

    const parts = path.split('/').filter(part => part !== '');
    for (const part of parts) {
      this.validateFilename(part);
    }
  }

  static validateFilename(filename: string): void {
    if (!filename) {
      throw new Error('Filename cannot be empty');
    }

    if (filename.length > this.MAX_FILENAME_LENGTH) {
      throw new Error(`Filename too long: maximum ${this.MAX_FILENAME_LENGTH} characters`);
    }

    const invalidChars = /[<>:"|?*\x00-\x1f]/;
    if (invalidChars.test(filename)) {
      throw new Error('Filename contains invalid characters');
    }

    const upperName = filename.toUpperCase();
    if (this.RESERVED_NAMES.has(upperName)) {
      throw new Error(`Filename "${filename}" is reserved`);
    }

    if (filename.startsWith('.') && filename.length > 1) {
      if (filename === '.' || filename === '..') {
        throw new Error('Invalid filename: "." and ".." are not allowed');
      }
    }

    if (filename.endsWith('.') || filename.endsWith(' ')) {
      throw new Error('Filename cannot end with dot or space');
    }
  }

  static sanitizePath(path: string): string {
    return path
      .replace(/\/+/g, '/')
      .replace(/\/$/, '') || '/';
  }
}