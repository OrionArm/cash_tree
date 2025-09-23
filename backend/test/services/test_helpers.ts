import { DatabaseService } from '../../src/services/data_base';
import { CacheService } from '../../src/services/cash';
import type { TreeNode } from '../../src/dto/types';
import { createTestData } from './test_data';

// Хелпер для создания нового экземпляра DatabaseService с тестовыми данными
export const createTestDatabaseService = (
  testData?: TreeNode[],
): DatabaseService => {
  const service = new DatabaseService();
  (service as any).database.clear();
  const data = testData || createTestData();
  data.forEach((element) => {
    (service as any).database.set(element.id, element);
  });
  return service;
};

// Хелпер для создания нового экземпляра CacheService с тестовыми данными
export const createTestCacheService = (testData?: TreeNode[]): CacheService => {
  const service = new CacheService();
  (service as any).cache.clear();
  (service as any).operations = [];
  const data = testData || createTestData();
  data.forEach((element) => {
    (service as any).cache.set(element.id, element);
  });
  return service;
};

// Хелпер для получения всех ID в дереве
export const getAllIds = (node: TreeNode): string[] => {
  const ids = [node.id];
  for (const child of node.children) {
    ids.push(...getAllIds(child));
  }
  return ids;
};

// Хелпер для создания простого элемента для тестов
export const createSimpleElement = (
  id: string,
  parentId: string | null,
  value: string,
  isDeleted: boolean = false,
): TreeNode => ({
  id,
  parentId,
  value,
  isDeleted,
  children: [],
});

// Хелпер для проверки, что элемент находится в кэше
export const isElementInCache = (
  service: CacheService,
  elementId: string,
): boolean => {
  const element = service.getElement(elementId);
  return element !== null;
};

// Хелпер для проверки, что элемент находится в базе данных
export const isElementInDatabase = (
  service: DatabaseService,
  elementId: string,
): boolean => {
  const element = service.getElement(elementId);
  return element !== null;
};

// Хелпер для подсчета операций в CacheService
export const getOperationsCount = (service: CacheService): number => {
  return service.getOperations().length;
};

// Хелпер для получения списка операций из CacheService
export const getOperations = (service: CacheService): any[] => {
  return service.getOperations();
};
