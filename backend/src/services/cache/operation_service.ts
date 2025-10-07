import { singleton } from 'tsyringe';

export interface CacheOperation {
  type: 'create' | 'update' | 'delete';
  elementId: string;
  parentId?: string | null;
  value?: string;
}

@singleton()
export class OperationService {
  private readonly operations: CacheOperation[] = [];

  addCreateOperation(
    elementId: string,
    parentId: string | null,
    value: string,
  ): void {
    this.operations.push({
      type: 'create',
      elementId,
      parentId,
      value,
    });
  }

  addUpdateOperation(elementId: string, value: string): void {
    this.operations.push({
      type: 'update',
      elementId,
      value,
    });
  }

  addDeleteOperation(elementId: string): void {
    this.operations.push({
      type: 'delete',
      elementId,
    });
  }

  getOperations(): readonly CacheOperation[] {
    return this.operations;
  }

  clearOperations(): void {
    this.operations.length = 0;
  }
}
