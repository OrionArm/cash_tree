import { TreeNode } from '../../dto/types';
import { DatabaseService } from '../data_base';
import { v4 } from 'uuid';
import { ValidationService } from './validation_service';
import { IndexService } from './index_service';
import { OperationService, CacheOperation } from './operation_service';
import { HierarchyService } from './hierarchy_service';
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
  private hierarchyService: HierarchyService;
  private cacheLoaderService: CacheLoaderService;
  private cachedStructure: TreeNode[] | null = null;

  constructor() {
    this.indexService = new IndexService();
    this.operationService = new OperationService();
    this.hierarchyService = new HierarchyService(this.indexService);
    this.cacheLoaderService = new CacheLoaderService(
      this.indexService,
      this.hierarchyService,
    );

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

    this.cachedStructure = this.hierarchyService.buildCacheStructure(
      this.cache,
    );
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

    this.markElementAsDeleted(element);
    this.operationService.addDeleteOperation(elementId);
    this.indexService.removeFromParentIndex(elementId, element.parentId);
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

  clearOperations(): void {
    this.operationService.clearOperations();
  }

  async applyOperations(
    databaseService: DatabaseService,
  ): Promise<ApplyChangesResponse> {
    const operations = this.getOperations();
    const result = await this.cacheLoaderService.applyOperations(
      operations,
      databaseService,
    );

    // Очищаем операции только если все операции были успешно применены
    if (result.success) {
      this.clearOperations();
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
    this.indexService.addToParentIndex(element.id, element.parentId);
    this.indexService.markElementAsDirty(element.id, element.parentId);

    if (element.children && element.children.length > 0) {
      element.children.forEach((child) => {
        if (!this.cache.has(child.id)) {
          this.cache.set(child.id, child);
          this.indexService.addToParentIndex(child.id, child.parentId);
          this.indexService.markElementAsDirty(child.id, child.parentId);
        }
      });
    }
  }

  private invalidateCache(): void {
    this.cachedStructure = null;
    this.indexService.rebuildHierarchy(this.cache);
  }

  private markElementAsDeleted(element: TreeNode): void {
    element.isDeleted = true;
    element.children.forEach((child) => this.markElementAsDeleted(child));
  }
}

export const cacheService = new CacheService();
