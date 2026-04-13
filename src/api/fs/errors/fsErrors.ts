export class FSError extends Error {
  constructor(
    message: string,
    public code: string,
    public path?: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'FSError';
  }
}

export class FSPathError extends FSError {
  constructor(message: string, path: string, cause?: Error) {
    super(message, 'PATH_ERROR', path, cause);
    this.name = 'FSPathError';
  }
}

export class FSPermissionError extends FSError {
  constructor(message: string, path: string, cause?: Error) {
    super(message, 'PERMISSION_ERROR', path, cause);
    this.name = 'FSPermissionError';
  }
}

export class FSNotFoundError extends FSError {
  constructor(path: string, cause?: Error) {
    super(`No such file or directory: ${path}`, 'NOT_FOUND', path, cause);
    this.name = 'FSNotFoundError';
  }
}

export class FSExistsError extends FSError {
  constructor(path: string, cause?: Error) {
    super(`File exists: ${path}`, 'EXISTS', path, cause);
    this.name = 'FSExistsError';
  }
}

export class FSQuotaError extends FSError {
  constructor(message: string, cause?: Error) {
    super(message, 'QUOTA_EXCEEDED', undefined, cause);
    this.name = 'FSQuotaError';
  }
}
