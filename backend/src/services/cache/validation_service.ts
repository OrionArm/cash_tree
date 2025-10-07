import { TreeNode } from '../../dto/types';

export class ValidationService {
  private static readonly ERROR_MESSAGES = {
    EMPTY_VALUE: 'Значение элемента не может быть пустым',
    INVALID_PARENT_ID: 'ID родителя должен быть строкой или null',
    ELEMENT_NOT_FOUND: 'Элемент не найден в базе данных',
  } as const;

  static getErrorMessages() {
    return ValidationService.ERROR_MESSAGES;
  }

  static isValidElementId(elementId: string): boolean {
    return typeof elementId === 'string' && elementId.length > 0;
  }

  static isValidValue(value: string): boolean {
    return typeof value === 'string' && value.trim() !== '';
  }

  static isValidParentId(parentId: string | null): boolean {
    return (
      parentId === null ||
      (typeof parentId === 'string' && parentId.trim() !== '')
    );
  }

  static isElementValidAndNotDeleted(
    element: TreeNode | undefined,
  ): element is TreeNode {
    return element !== undefined && !element.isDeleted;
  }

  static validateCreateElement(parentId: string | null, value: string): void {
    if (!ValidationService.isValidValue(value)) {
      throw new Error(ValidationService.ERROR_MESSAGES.EMPTY_VALUE);
    }
    if (!ValidationService.isValidParentId(parentId)) {
      throw new Error(ValidationService.ERROR_MESSAGES.INVALID_PARENT_ID);
    }
  }

  static validateUpdateElement(elementId: string, value: string): boolean {
    return (
      ValidationService.isValidElementId(elementId) &&
      ValidationService.isValidValue(value)
    );
  }

  static validateDeleteElement(elementId: string): boolean {
    return ValidationService.isValidElementId(elementId);
  }
}
