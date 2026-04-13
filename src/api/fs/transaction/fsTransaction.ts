export interface FSOperation {
  type: 'create' | 'delete' | 'modify' | 'move';
  path: string;
  execute: () => Promise<void>;
  rollback: () => Promise<void>;
}

export class FSTransaction {
  private operations: FSOperation[] = [];
  private executed: FSOperation[] = [];
  private isExecuting = false;

  add(operation: FSOperation): void {
    if (this.isExecuting) {
      throw new Error('Cannot add operations to executing transaction');
    }
    this.operations.push(operation);
  }

  async execute(): Promise<void> {
    if (this.isExecuting) {
      throw new Error('Transaction is already executing');
    }

    this.isExecuting = true;
    this.executed = [];

    try {
      for (const operation of this.operations) {
        await operation.execute();
        this.executed.push(operation);
      }
    } catch (error) {
      await this.rollback();
      throw error;
    } finally {
      this.isExecuting = false;
    }
  }

  private async rollback(): Promise<void> {
    const rollbackErrors: Error[] = [];

    for (const operation of this.executed.reverse()) {
      try {
        await operation.rollback();
      } catch (error) {
        rollbackErrors.push(error instanceof Error ? error : new Error(String(error)));
      }
    }

    if (rollbackErrors.length > 0) {
      console.error('Rollback errors:', rollbackErrors);
    }
  }

  clear(): void {
    if (this.isExecuting) {
      throw new Error('Cannot clear executing transaction');
    }
    this.operations = [];
    this.executed = [];
  }

  isEmpty(): boolean {
    return this.operations.length === 0;
  }

  size(): number {
    return this.operations.length;
  }
}