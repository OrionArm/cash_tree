export interface CacheOperation {
  type: 'create' | 'update' | 'delete';
  elementId: string;
  parentId?: string | null;
  value?: string;
}

export class OperationService {
  private operations: CacheOperation[] = [];

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

  getOperations(): CacheOperation[] {
    return [...this.operations];
  }

  clearOperations(): void {
    this.operations = [];
  }
}
