import { TreeNode } from '../../dto/types';
import { DatabaseService } from '../data_base';
import { v4 } from 'uuid';
import { ValidationService } from './validation_service';
import { IndexService } from './index_service';
import { OperationService, CacheOperation } from './operation_service';
import { CacheLoaderService, CacheLoadResult } from './cache_loader_service';
import { ApplyChangesResponse } from '../../dto/response/note';

export interface CacheElementLoadResult {
  element: TreeNode | null;
  descendants: TreeNode[];
}

export class CacheService {
  private cache: Map<string, TreeNode> = new Map();
  private indexService: IndexService;
  private operationService: OperationService;
  private cacheLoaderService: CacheLoaderService;
  private cachedStructure: TreeNode[] | null = null;

  constructor() {
    this.indexService = new IndexService();
    this.operationService = new OperationService();
    this.cacheLoaderService = new CacheLoaderService();

    this.initializeIndexes();
  }

  getElement(elementId: string): TreeNode | null {
    if (!ValidationService.isValidElementId(elementId)) return null;

    const element = this.cache.get(elementId);
    return ValidationService.isElementValidAndNotDeleted(element)
      ? element
      : null;
  }

  getCacheStructure(): TreeNode[] {
    if (
      this.cachedStructure !== null &&
      this.indexService.getDirtyElements().size === 0
    ) {
      return this.cachedStructure;
    }

    this.cachedStructure = this.buildCacheStructure();
    return this.cachedStructure;
  }

  createElement(parentId: string | null, value: string): TreeNode {
    ValidationService.validateCreateElement(parentId, value);

    const elementId = v4();
    const newElement: TreeNode = {
      id: elementId,
      parentId,
      value: value.trim(),
      isDeleted: false,
      children: [],
    };

    this.addElementToCache(newElement);
    this.operationService.addCreateOperation(newElement.id, parentId, value);
    this.invalidateCache();

    return newElement;
  }

  updateElement(elementId: string, value: string): boolean {
    if (!ValidationService.validateUpdateElement(elementId, value)) {
      return false;
    }

    const element = this.cache.get(elementId);
    if (!ValidationService.isElementValidAndNotDeleted(element)) return false;

    element.value = value.trim();
    this.operationService.addUpdateOperation(elementId, value);
    this.invalidateCache();

    return true;
  }

  deleteElement(elementId: string): boolean {
    if (!ValidationService.validateDeleteElement(elementId)) return false;

    const element = this.cache.get(elementId);
    if (!ValidationService.isElementValidAndNotDeleted(element)) return false;

    this.markElementAndChildAsDeleted(element);
    this.operationService.addDeleteOperation(elementId);
    this.indexService.markElementAsDirty(elementId, element.parentId);
    this.invalidateCache();

    return true;
  }

  async loadElement(
    databaseService: DatabaseService,
    elementId: string,
  ): Promise<CacheLoadResult> {
    const result = await this.cacheLoaderService.loadElement(
      databaseService,
      elementId,
      this.cache,
    );

    if (
      result.success &&
      result.loadedElements &&
      result.loadedElements.length > 0
    ) {
      // Обновляем элемент в кэше и индекс
      const loadedElement = result.loadedElements[0];
      this.cache.set(loadedElement.id, loadedElement);
      this.updateElementIndexes(loadedElement.id, loadedElement.parentId);

      // Этап 1: Прикрепляем загружаемый элемент к родителю
      // Если у элемента есть родитель, добавляем его в children родителя
      if (loadedElement.parentId) {
        const parent = this.cache.get(loadedElement.parentId);
        if (parent) {
          this.addChildToParent(parent, loadedElement);
        } else {
          // Если родитель не загружен в кэш, делаем элемент корневым, но сохраняем оригинальный parentId
          // Оригинальный parentId уже сохранен в loadedElement.parentId из базы данных
          // Обновляем индекс для корневого элемента
          this.updateElementIndexes(loadedElement.id, null);
        }
      }

      // Этап 2: Обрабатываем существующих детей в кэше
      // Ищем элементы в кэше, которые должны стать дочерними для загруженного элемента
      this.moveExistingChildrenToParent(loadedElement);
    }

    this.invalidateCache();
    return result;
  }

  clear(): void {
    this.cache.clear();
    this.operationService.clearOperations();
    this.indexService.clear();
    this.cachedStructure = null;
  }

  getOperations(): CacheOperation[] {
    return this.operationService.getOperations();
  }

  async applyOperations(
    databaseService: DatabaseService,
  ): Promise<ApplyChangesResponse> {
    const operations = this.getOperations();
    const result = await this.cacheLoaderService.applyOperations(
      operations,
      databaseService,
      this.cache,
    );

    // Очищаем операции только если все операции были успешно применены
    if (result.success) {
      this.operationService.clearOperations();

      if (result.deletedElementIds && result.deletedElementIds.length) {
        this.syncDeletedElements(result.deletedElementIds);
      }
    }

    return result;
  }

  private initializeIndexes(): void {
    this.cache.forEach((element) => {
      this.indexService.addToParentIndex(element.id, element.parentId);
    });
  }

  private addElementToCache(element: TreeNode): void {
    this.cache.set(element.id, element);
    this.updateElementIndexes(element.id, element.parentId);

    // Если у элемента есть родитель, добавляем его в children родителя
    if (element.parentId) {
      const parent = this.cache.get(element.parentId);
      if (parent) this.addChildToParent(parent, element);
    }

    if (element.children && element.children.length > 0) {
      element.children.forEach((child) => {
        if (!this.cache.has(child.id)) {
          this.cache.set(child.id, child);
          this.updateElementIndexes(child.id, child.parentId);
        }
      });
    }
  }

  private moveExistingChildrenToParent(parentElement: TreeNode): void {
    // Ищем только корневые элементы в кэше, которые имеют parentId равный id загруженного элемента
    const childrenToMove: TreeNode[] = [];

    for (const [_elementId, element] of Array.from(this.cache.entries())) {
      if (
        element.parentId === parentElement.id &&
        element.id !== parentElement.id &&
        this.indexService.isRootElement(element.id)
      ) {
        childrenToMove.push(element);
      }
    }

    // Перемещаем найденные элементы
    childrenToMove.forEach((child) => {
      // Удаляем из корневых элементов
      this.indexService.removeFromParentIndex(child.id, null);

      // Добавляем к новому родителю
      this.updateElementIndexes(child.id, parentElement.id);

      // 3. Добавляем существующих детей к загружаемому элементу
      this.addChildToParent(parentElement, child);
    });
  }

  private updateElementIndexes(
    elementId: string,
    parentId: string | null,
  ): void {
    this.indexService.addToParentIndex(elementId, parentId);
    this.indexService.markElementAsDirty(elementId, parentId);
  }

  private addChildToParent(
    parent: TreeNode,
    child: TreeNode,
    skipDuplicateCheck: boolean = false,
  ): void {
    const shouldAdd =
      skipDuplicateCheck ||
      !parent.children.some((existingChild) => existingChild.id === child.id);

    if (shouldAdd) {
      parent.children.push(child);
    }

    // Если родитель удален, помечаем дочерний элемент как удаленный
    // независимо от того, добавляли ли мы его в children
    if (parent.isDeleted) {
      this.markElementAndChildAsDeleted(child);
    }
  }

  private invalidateCache(): void {
    this.cachedStructure = null;
    this.indexService.rebuildHierarchy(this.cache);
  }

  private markElementAndChildAsDeleted(element: TreeNode): void {
    element.isDeleted = true;
    element.children.forEach((child) =>
      this.markElementAndChildAsDeleted(child),
    );
  }

  private buildCacheStructure(): TreeNode[] {
    const result: TreeNode[] = [];
    this.indexService.getRootElements().forEach((id) => {
      const element = this.cache.get(id);
      if (element) {
        result.push(element);
      }
    });
    return result;
  }

  private syncDeletedElements(deletedElementIds: string[]): void {
    // Помечаем все элементы из списка удалённых как удалённые в кэше
    // НЕ удаляем рекурсивно children, т.к. БД уже вернула полный список удалённых
    deletedElementIds.forEach((elementId) => {
      const element = this.cache.get(elementId);
      if (element && !element.isDeleted) {
        element.isDeleted = true;
        this.indexService.markElementAsDirty(elementId, element.parentId);
      }
    });

    this.invalidateCache();
  }
}

export const cacheService = new CacheService();
