import { TreeNode } from '../../dto/types';
import { DatabaseService } from '../data_base';
import { IndexService } from './index_service';
import { HierarchyService } from './hierarchy_service';
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
  constructor(
    private indexService: IndexService,
    private hierarchyService: HierarchyService,
  ) {}

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

    if (!loadResult.success) return loadResult;

    // Создаем кэш-элемент и объединяем цепочки
    const element = loadResult.element!;
    const descendants = loadResult.descendants!;
    const cacheElement = this.createRootElement(element, descendants);
    this.mergeElementChains(cacheElement, elementId, cache);
    // Очищаем корневые элементы
    this.cleanupRootElements(cache);
    const loadedElements = [cacheElement, ...descendants];

    return {
      success: true,
      message: `Элемент и ${descendants.length} потомков успешно загружены в кэш`,
      descendantsCount: descendants.length,
      loadedElements,
    };
  }

  /**
   * Проверяет, есть ли элемент уже в кэше и возвращает результат, если элемент найден
   */
  private checkExistingElementInCache(
    elementId: string,
    cache: Map<string, TreeNode>,
  ): CacheLoadResult | null {
    const existingElement = cache.get(elementId);
    if (!ValidationService.isElementValidAndNotDeleted(existingElement)) {
      return null;
    }

    if (this.indexService.isRootElement(elementId)) {
      const descendants =
        this.hierarchyService.extractAllDescendants(existingElement);
      return {
        success: true,
        message: `Элемент и ${descendants.length} потомков уже в кэше`,
        descendantsCount: descendants.length,
        loadedElements: [existingElement, ...descendants],
      };
    }

    const isPartOfExistingChain =
      this.indexService.isElementPartOfExistingRootChain(elementId, cache);
    if (isPartOfExistingChain) {
      const descendants =
        this.hierarchyService.extractAllDescendants(existingElement);
      return {
        success: true,
        message: `Элемент и ${descendants.length} потомков уже в кэше`,
        descendantsCount: descendants.length,
        loadedElements: [existingElement, ...descendants],
      };
    }

    // Если элемент в кэше, но не является корневым и не является частью существующей цепочки,
    // очищаем кэш для загрузки элемента как корневого
    this.clearCache(cache);
    return null;
  }

  private createRootElement(
    element: TreeNode,
    descendants: TreeNode[],
  ): TreeNode {
    return { ...element, parentId: null, children: descendants };
  }

  /**
   * Объединяет цепочки элементов в кэше
   */
  private mergeElementChains(
    cacheElement: TreeNode,
    elementId: string,
    cache: Map<string, TreeNode>,
  ): void {
    const existingChildren = this.indexService.findExistingChildrenInCache(
      elementId,
      cache,
    );

    if (existingChildren.length > 0) {
      // Если есть существующие потомки, объединяем цепочки
      this.hierarchyService.mergeChains(cacheElement, existingChildren, cache);
    } else {
      // Если нет существующих потомков, добавляем как новую корневую цепочку
      this.hierarchyService.replaceAllWithNewChain(cacheElement, cache);
    }
  }

  /**
   * Удаляет из корневых элементов все элементы, которые теперь имеют родителя
   */
  private cleanupRootElements(cache: Map<string, TreeNode>): void {
    cache.forEach((element, elementId) => {
      if (
        element.parentId !== null &&
        this.indexService.isRootElement(elementId)
      ) {
        this.indexService.removeFromParentIndex(elementId, null);
      }
    });
  }

  private async loadElementFromDatabase(
    databaseService: DatabaseService,
    elementId: string,
  ): Promise<
    CacheLoadResult & { element?: TreeNode; descendants?: TreeNode[] }
  > {
    const { element, descendants } = await this.getElementFromDb(
      databaseService,
      elementId,
    );

    if (!element) {
      return {
        success: false,
        message: ValidationService.getErrorMessages().ELEMENT_NOT_FOUND,
        descendantsCount: 0,
        loadedElements: [],
      };
    }

    return {
      success: true,
      message: '',
      descendantsCount: descendants.length,
      loadedElements: [],
      element,
      descendants,
    };
  }

  private async getElementFromDb(
    databaseService: DatabaseService,
    elementId: string,
  ): Promise<CacheElementLoadResult> {
    const dbElement = await databaseService.getElement(elementId);
    if (!dbElement) return { element: null, descendants: [] };

    const descendants = this.hierarchyService.extractAllDescendants(dbElement);

    return { element: dbElement, descendants };
  }

  private clearCache(cache: Map<string, TreeNode>): void {
    cache.clear();
    this.indexService.clear();
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
}
