import 'reflect-metadata';
import { container } from 'tsyringe';
import { DatabaseService } from '../../src/services/data_base';
import { CacheService } from '../../src/services/cache';
import type { TreeNode } from '../../src/dto/types';
import { createTestData } from './test_data';
import * as assert from 'node:assert';

// Хелпер для создания нового экземпляра DatabaseService с тестовыми данными
export const createTestDatabaseService = (
  testData?: TreeNode[],
): DatabaseService => {
  const service = container.resolve(DatabaseService);
  (service as any).database.clear();
  const data = testData || createTestData();
  data.forEach((element) => {
    (service as any).database.set(element.id, element);
  });
  return service;
};

// Хелпер для создания нового экземпляра CacheService с тестовыми данными
export const createTestCacheService = (testData?: TreeNode[]): CacheService => {
  const service = container.resolve(CacheService);
  (service as any).cache.clear();
  (service as any).operationService.clearOperations();
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

// Хелпер для подсчета операций в CacheService
export const getOperationsCount = (service: CacheService): number => {
  return service.getOperations().length;
};

// Хелпер для получения списка операций из CacheService
export const getOperations = (service: CacheService): readonly any[] => {
  return service.getOperations();
};

// Проверяем флаг isDeleted
export function checkElementIsDeleted(
  element: any,
  shouldBeDeleted: boolean,
  context: string,
) {
  assert.strictEqual(
    element.isDeleted,
    shouldBeDeleted,
    `Элемент ${element.id} должен быть ${shouldBeDeleted ? 'помечен как удаленный' : 'не удален'} в ${context}`,
  );
}

export function checkChainElements(
  structure: TreeNode[],
  expectedElements: string[],
  shouldBeDeleted: boolean = false,
  context: string = 'структуре',
): void {
  const allElements = new Set<string>();

  function collectElementIds(element: any) {
    allElements.add(element.id);
    if (element.children) {
      element.children.forEach(collectElementIds);
    }
  }

  structure.forEach(collectElementIds);

  // Проверяем что все элементы присутствуют
  expectedElements.forEach((elementId) => {
    assert.ok(
      allElements.has(elementId),
      `Элемент ${elementId} должен быть в ${context}`,
    );
  });

  function findAndCheckElement(rootElements: any[], elementId: string) {
    for (const element of rootElements) {
      if (element.id === elementId) {
        checkElementIsDeleted(element, shouldBeDeleted, context);
        return;
      }
      if (element.children) {
        findAndCheckElement(element.children, elementId);
      }
    }
  }

  // Проверяем флаги для всех элементов
  expectedElements.forEach((elementId) => {
    findAndCheckElement(structure, elementId);
  });
}
