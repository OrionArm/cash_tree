import { TreeNode } from '../../dto/types';
import { DatabaseService } from '../data_base';
import { IndexService } from './index_service';
import { ValidationService } from './validation_service';
import { CacheOperation } from './operation_service';
import { ApplyChangesResponse } from '../../dto/response/note';

export interface CacheLoadResult {
  success: boolean;
  message: string;
  descendantsCount: number;
  loadedElements?: TreeNode[];
}

export interface CacheElementLoadResult {
  element: TreeNode | null;
  descendants: TreeNode[];
}

export class CacheLoaderService {
  async loadElement(
    databaseService: DatabaseService,
    elementId: string,
    cache: Map<string, TreeNode>,
  ): Promise<CacheLoadResult> {
    const existingElementResult = this.checkExistingElementInCache(
      elementId,
      cache,
    );
    if (existingElementResult) return existingElementResult;

    const loadResult = await this.loadElementFromDatabase(
      databaseService,
      elementId,
    );

    if (!loadResult.success) {
      return {
        success: false,
        message: loadResult.message,
        descendantsCount: 0,
        loadedElements: [],
      };
    }

    // Создаем кэш-элемент без потомков
    const element = loadResult.element!;
    cache.set(element.id, element);

    return {
      success: true,
      message: `Элемент успешно загружен в кэш`,
      descendantsCount: 0,
      loadedElements: [element],
    };
  }

  async applyOperations(
    operations: CacheOperation[],
    databaseService: DatabaseService,
  ): Promise<ApplyChangesResponse> {
    const errors: string[] = [];
    let appliedOperations = 0;

    if (operations.length === 0) {
      return {
        success: true,
        appliedOperations: 0,
        errors: [],
        message: 'Нет изменений для применения',
      };
    }

    for (const operation of operations) {
      try {
        switch (operation.type) {
          case 'create':
            await databaseService.createElement(
              operation.elementId,
              operation.parentId!,
              operation.value!,
            );
            break;
          case 'update':
            await databaseService.updateElement(
              operation.elementId,
              operation.value!,
            );
            break;
          case 'delete':
            await databaseService.markElementAsDeleted(operation.elementId);
            break;
        }
        appliedOperations++;
      } catch (error) {
        const errorMessage = `Ошибка применения операции ${operation.type} для элемента ${operation.elementId}: ${error}`;
        errors.push(errorMessage);
        console.error(errorMessage);
      }
    }

    return {
      success: errors.length === 0,
      appliedOperations,
      errors,
      message:
        errors.length === 0
          ? `Успешно применено ${appliedOperations} операций`
          : `Применено ${appliedOperations} из ${operations.length} операций с ошибками`,
    };
  }

  private checkExistingElementInCache(
    elementId: string,
    cache: Map<string, TreeNode>,
  ): CacheLoadResult | null {
    const existingElement = cache.get(elementId);
    if (!ValidationService.isElementValidAndNotDeleted(existingElement)) {
      return null;
    }

    // Если элемент уже в кэше, возвращаем его без потомков
    return {
      success: true,
      message: `Элемент уже в кэше`,
      descendantsCount: 0,
      loadedElements: [{ ...existingElement, children: [] }],
    };
  }

  private async loadElementFromDatabase(
    databaseService: DatabaseService,
    elementId: string,
  ): Promise<{ success: boolean; message: string; element?: TreeNode }> {
    const element = await databaseService.getElement(elementId);

    if (!element) {
      return {
        success: false,
        message: ValidationService.getErrorMessages().ELEMENT_NOT_FOUND,
      };
    }

    return {
      success: true,
      message: '',
      element,
    };
  }
}
