import { test } from 'node:test';
import * as assert from 'node:assert';
import {
  createTestCacheService,
  createTestDatabaseService,
  getAllIds,
  getOperationsCount,
  getOperations,
} from './test_helpers';

// ==================== ТЕСТЫ ДЛЯ getElement ====================

test('CacheService - getElement - должен вернуть элемент если он существует и не удален', () => {
  const service = createTestCacheService();

  const result = service.getElement('A1');

  assert.ok(result);
  assert.strictEqual(result.id, 'A1');
  assert.strictEqual(result.value, 'A1');
  assert.strictEqual(result.parentId, 'root');
  assert.strictEqual(result.isDeleted, false);
});

test('CacheService - getElement - должен вернуть null для несуществующего элемента', () => {
  const service = createTestCacheService();

  const result = service.getElement('nonexistent');

  assert.strictEqual(result, null);
});

test('CacheService - getElement - должен вернуть null для удаленного элемента', () => {
  const service = createTestCacheService();

  const result = service.getElement('deleted');

  assert.strictEqual(result, null);
});

// ==================== ТЕСТЫ ДЛЯ getCacheStructure ====================

test('CacheService - getCacheStructure - должен вернуть только корневые элементы', () => {
  const service = createTestCacheService();

  const result = service.getCacheStructure();

  assert.ok(Array.isArray(result));
  // Проверяем, что все возвращенные элементы являются корневыми (parentId = null)
  result.forEach((element) => {
    assert.strictEqual(element.parentId, null);
    assert.strictEqual(element.isDeleted, false);
  });
});

test('CacheService - getCacheStructure - не должен включать удаленные элементы', () => {
  const service = createTestCacheService();

  const result = service.getCacheStructure();

  const allIds = result.flatMap((element) => getAllIds(element));
  assert.ok(!allIds.includes('deleted'));
});

// ==================== ТЕСТЫ ДЛЯ createElement ====================

test('CacheService - createElement - должен создать новый элемент с корневым родителем', () => {
  const service = createTestCacheService();

  const newElement = service.createElement(null, 'New Root Element');

  assert.ok(newElement);
  assert.strictEqual(newElement.value, 'New Root Element');
  assert.strictEqual(newElement.parentId, null);
  assert.strictEqual(newElement.isDeleted, false);
  assert.strictEqual(newElement.children.length, 0);
  assert.ok(typeof newElement.id === 'string');
});

test('CacheService - createElement - должен создать новый элемент с родителем', () => {
  const service = createTestCacheService();

  const newElement = service.createElement('A1', 'New Child Element');

  assert.ok(newElement);
  assert.strictEqual(newElement.value, 'New Child Element');
  assert.strictEqual(newElement.parentId, 'A1');
  assert.strictEqual(newElement.isDeleted, false);
  assert.strictEqual(newElement.children.length, 0);
  assert.ok(typeof newElement.id === 'string');
});

test('CacheService - createElement - должен сохранить элемент в кэше', () => {
  const service = createTestCacheService();

  const newElement = service.createElement('A1', 'New Child Element');
  const retrieved = service.getElement(newElement.id);

  assert.ok(retrieved);
  assert.strictEqual(retrieved.value, 'New Child Element');
  assert.strictEqual(retrieved.parentId, 'A1');
});

test('CacheService - createElement - должен добавить операцию в список операций', () => {
  const service = createTestCacheService();
  const initialOperationsCount = getOperationsCount(service);

  service.createElement('A1', 'New Child Element');

  const finalOperationsCount = getOperationsCount(service);
  assert.strictEqual(finalOperationsCount, initialOperationsCount + 1);

  const operations = getOperations(service);
  const lastOperation = operations[operations.length - 1];
  assert.strictEqual(lastOperation.type, 'create');
  assert.strictEqual(lastOperation.value, 'New Child Element');
  assert.strictEqual(lastOperation.parentId, 'A1');
});

test('CacheService - createElement - должен обновить иерархию детей', () => {
  const service = createTestCacheService();

  const newElement = service.createElement('A1', 'New Child Element');
  const parent = service.getElement('A1');

  assert.ok(parent);
  assert.ok(parent.children.some((child) => child.id === newElement.id));
});

// ==================== ТЕСТЫ ДЛЯ updateElement ====================

test('CacheService - updateElement - должен обновить значение существующего элемента', () => {
  const service = createTestCacheService();

  const result = service.updateElement('A1', 'Updated Value');

  assert.strictEqual(result, true);
  const updatedElement = service.getElement('A1');
  assert.ok(updatedElement);
  assert.strictEqual(updatedElement.value, 'Updated Value');
});

test('CacheService - updateElement - должен добавить операцию в список операций', () => {
  const service = createTestCacheService();
  const initialOperationsCount = getOperationsCount(service);

  service.updateElement('A1', 'Updated Value');

  const finalOperationsCount = getOperationsCount(service);
  assert.strictEqual(finalOperationsCount, initialOperationsCount + 1);

  const operations = getOperations(service);
  const lastOperation = operations[operations.length - 1];
  assert.strictEqual(lastOperation.type, 'update');
  assert.strictEqual(lastOperation.elementId, 'A1');
  assert.strictEqual(lastOperation.value, 'Updated Value');
});

test('CacheService - updateElement - должен вернуть false для несуществующего элемента', () => {
  const service = createTestCacheService();

  const result = service.updateElement('nonexistent', 'New Value');

  assert.strictEqual(result, false);
});

test('CacheService - updateElement - должен вернуть false для удаленного элемента', () => {
  const service = createTestCacheService();

  const result = service.updateElement('deleted', 'New Value');

  assert.strictEqual(result, false);
});

// ==================== ТЕСТЫ ДЛЯ deleteElement ====================

test('CacheService - deleteElement - должен удалить существующий элемент', () => {
  const service = createTestCacheService();

  const result = service.deleteElement('A1');

  assert.strictEqual(result, true);
  const deletedElement = service.getElement('A1');
  assert.strictEqual(deletedElement, null);
});

test('CacheService - deleteElement - должен добавить операцию в список операций', () => {
  const service = createTestCacheService();
  const initialOperationsCount = getOperationsCount(service);

  service.deleteElement('A1');

  const finalOperationsCount = getOperationsCount(service);
  assert.strictEqual(finalOperationsCount, initialOperationsCount + 1);

  const operations = getOperations(service);
  const lastOperation = operations[operations.length - 1];
  assert.strictEqual(lastOperation.type, 'delete');
  assert.strictEqual(lastOperation.elementId, 'A1');
});

test('CacheService - deleteElement - должен вернуть false для несуществующего элемента', () => {
  const service = createTestCacheService();

  const result = service.deleteElement('nonexistent');

  assert.strictEqual(result, false);
});

test('CacheService - deleteElement - должен удалить элемент и пометить его как удаленный', () => {
  const service = createTestCacheService();

  service.deleteElement('A1');

  // Проверяем, что A1 удален (недоступен через getElement)
  const a1 = service.getElement('A1');
  assert.strictEqual(a1, null);

  // Проверяем, что операция удаления добавлена
  const operations = service.getOperations();
  const deleteOperation = operations.find(
    (op) => op.type === 'delete' && op.elementId === 'A1',
  );
  assert.ok(deleteOperation);
  assert.strictEqual(deleteOperation.type, 'delete');
  assert.strictEqual(deleteOperation.elementId, 'A1');
});

test('CacheService - deleteElement - не должен влиять на других детей того же родителя', () => {
  const service = createTestCacheService();

  // Сначала создаем B1 в кэше, чтобы он был доступен
  const b1Element = service.createElement('root', 'B1');

  service.deleteElement('A1');

  const b1 = service.getElement('B1');
  const root = service.getElement('root');

  assert.ok(b1);
  assert.ok(root);
  // После удаления A1, root должен иметь только B1 как ребенка
  assert.strictEqual(root.children.length, 1);
  assert.strictEqual(root.children[0].id, b1Element.id); // Используем ID созданного элемента
});

// ==================== ТЕСТЫ ДЛЯ loadElement ====================

test('CacheService - loadElement - должен загрузить элемент из базы данных', async () => {
  const cacheService = createTestCacheService();
  const databaseService = createTestDatabaseService();

  const result = await cacheService.loadElement(databaseService, 'A1');

  assert.strictEqual(result.success, true);
  assert.ok(result.message.includes('Элемент и'));
  assert.ok(result.message.includes('потомков успешно загружены в кэш'));
  assert.ok(result.descendantsCount >= 0);
  assert.ok(Array.isArray(result.loadedElements));
});

test('CacheService - loadElement - должен вернуть ошибку для несуществующего элемента', async () => {
  const cacheService = createTestCacheService();
  const databaseService = createTestDatabaseService();

  const result = await cacheService.loadElement(databaseService, 'nonexistent');

  assert.strictEqual(result.success, false);
  assert.strictEqual(result.message, 'Элемент не найден в базе данных');
  assert.strictEqual(result.descendantsCount, 0);
  assert.strictEqual(result.loadedElements?.length, 0);
});

test('CacheService - loadElement - должен загрузить элемент как корневой элемент кэша', async () => {
  const cacheService = createTestCacheService();
  const databaseService = createTestDatabaseService();

  const result = await cacheService.loadElement(databaseService, 'A1');

  assert.strictEqual(result.success, true);
  assert.ok(result.loadedElements);
  assert.ok(result.loadedElements.length > 0);

  // Первый элемент должен быть загруженным элементом с parentId = null
  const loadedElement = result.loadedElements[0];
  assert.strictEqual(loadedElement.parentId, null);
  assert.strictEqual(loadedElement.value, 'A1');
});

test('CacheService - loadElement - должен загрузить элемент в кэш', async () => {
  const cacheService = createTestCacheService();
  const databaseService = createTestDatabaseService();

  await cacheService.loadElement(databaseService, 'A1');

  // Проверяем, что элемент теперь доступен в кэше
  const cachedElement = cacheService.getElement('A1');
  assert.ok(cachedElement);
  assert.strictEqual(cachedElement.parentId, null); // Должен стать корневым в кэше
});

// ==================== ТЕСТЫ ДЛЯ ОПЕРАЦИЙ КЭША ====================

test('CacheService - clear - должен очистить весь кэш', () => {
  const service = createTestCacheService();

  service.clear();

  const structure = service.getCacheStructure();
  const operations = service.getOperations();

  assert.strictEqual(structure.length, 0);
  assert.strictEqual(operations.length, 0);
});

test('CacheService - getOperations - должен вернуть список всех операций', () => {
  const service = createTestCacheService();

  service.createElement('A1', 'Test Element');
  service.updateElement('A1', 'Updated Element');
  service.deleteElement('A1');

  const operations = service.getOperations();

  assert.strictEqual(operations.length, 3);
  assert.strictEqual(operations[0].type, 'create');
  assert.strictEqual(operations[1].type, 'update');
  assert.strictEqual(operations[2].type, 'delete');
});

test('CacheService - clearOperations - должен очистить список операций', () => {
  const service = createTestCacheService();

  service.createElement('A1', 'Test Element');
  service.updateElement('A1', 'Updated Element');

  assert.strictEqual(service.getOperations().length, 2);

  service.clearOperations();

  assert.strictEqual(service.getOperations().length, 0);
});

test('CacheService - clearOperations - не должен влиять на кэш', () => {
  const service = createTestCacheService();

  const newElement = service.createElement('A1', 'Test Element');
  service.clearOperations();

  // Элемент должен остаться в кэше
  const cachedElement = service.getElement(newElement.id);
  assert.ok(cachedElement);
  assert.strictEqual(cachedElement.value, 'Test Element');
});

test('CacheService - должен корректно обрабатывать множественные операции', () => {
  const service = createTestCacheService();

  // Создаем несколько элементов
  const element1 = service.createElement(null, 'Root 1');
  const element2 = service.createElement(element1.id, 'Child 1');
  const element3 = service.createElement(element2.id, 'Grandchild 1');

  // Обновляем один из элементов
  service.updateElement(element2.id, 'Updated Child 1');

  // Удаляем элемент
  service.deleteElement(element2.id);

  // Проверяем состояние
  const structure = service.getCacheStructure();
  const operations = service.getOperations();

  assert.strictEqual(structure.length, 1); // Только root элемент остался
  assert.strictEqual(operations.length, 5); // 3 create + 1 update + 1 delete

  // Проверяем, что удаленный элемент и его дети недоступны
  assert.strictEqual(service.getElement(element2.id), null);
  assert.strictEqual(service.getElement(element3.id), null);
});

test('CacheService - должен корректно поддерживать иерархию после операций', () => {
  const service = createTestCacheService();

  // Создаем иерархию
  const root = service.createElement(null, 'Root');
  const child1 = service.createElement(root.id, 'Child 1');
  const child2 = service.createElement(root.id, 'Child 2');
  const grandchild = service.createElement(child1.id, 'Grandchild');

  // Проверяем иерархию
  const rootElement = service.getElement(root.id);
  assert.ok(rootElement);
  assert.strictEqual(rootElement.children.length, 2);
  assert.ok(rootElement.children.some((c) => c.id === child1.id));
  assert.ok(rootElement.children.some((c) => c.id === child2.id));

  const child1Element = service.getElement(child1.id);
  assert.ok(child1Element);
  assert.strictEqual(child1Element.children.length, 1);
  assert.strictEqual(child1Element.children[0].id, grandchild.id);
});

test('CacheService - должен корректно обрабатывать загрузку элементов с потомками', async () => {
  const cacheService = createTestCacheService();
  const databaseService = createTestDatabaseService();

  // Загружаем элемент A1, который имеет потомков в тестовых данных
  const result = await cacheService.loadElement(databaseService, 'A1');

  assert.strictEqual(result.success, true);
  assert.ok(result.loadedElements);
  assert.ok(result.loadedElements.length > 1); // Должен загрузить элемент и его потомков

  // Проверяем, что все загруженные элементы доступны в кэше
  result.loadedElements!.forEach((element) => {
    const cachedElement = cacheService.getElement(element.id);
    assert.ok(cachedElement);
  });
});

test('CacheService - loadElement - загруженный элемент должен появиться в getCacheStructure', async () => {
  const cacheService = createTestCacheService();
  const databaseService = createTestDatabaseService();

  // Проверяем, что кэш изначально пустой
  const initialStructure = cacheService.getCacheStructure();
  assert.strictEqual(initialStructure.length, 0);

  // Загружаем элемент A1 с его потомками
  const result = await cacheService.loadElement(databaseService, 'A1');

  assert.strictEqual(result.success, true);
  assert.ok(result.loadedElements);
  assert.ok(result.loadedElements.length > 0);

  // Проверяем, что загруженный элемент появился в структуре кэша
  const structure = cacheService.getCacheStructure();
  assert.strictEqual(structure.length, 1);

  const loadedElement = structure[0];
  assert.strictEqual(loadedElement.id, 'A1');
  assert.strictEqual(loadedElement.parentId, null); // Должен стать корневым в кэше
  assert.strictEqual(loadedElement.value, 'A1');

  // Проверяем, что у загруженного элемента есть потомки
  assert.ok(loadedElement.children.length > 0);

  // Проверяем, что все потомки также доступны в кэше
  const checkDescendants = (node: any) => {
    node.children.forEach((child: any) => {
      const cachedChild = cacheService.getElement(child.id);
      assert.ok(cachedChild, `Потомок ${child.id} должен быть доступен в кэше`);
      checkDescendants(child);
    });
  };

  checkDescendants(loadedElement);
});

test('CacheService - loadElement - должен объединить цепочки при загрузке родителя после дочернего элемента', async () => {
  const cacheService = createTestCacheService();
  const databaseService = createTestDatabaseService();

  // Сначала загружаем A2_1, который должен создать цепочку A2_1 => A3 => A4
  const result1 = await cacheService.loadElement(databaseService, 'A2_1');

  assert.strictEqual(result1.success, true);
  assert.ok(result1.loadedElements);
  assert.ok(result1.loadedElements.length >= 3); // A2_1, A3, A4

  // Проверяем, что в кэше есть только одна корневая цепочка A2_1 => A3 => A4
  const structure1 = cacheService.getCacheStructure();
  assert.strictEqual(structure1.length, 1);
  assert.strictEqual(structure1[0].id, 'A2_1');
  assert.strictEqual(structure1[0].parentId, null);

  // Проверяем, что цепочка A2_1 => A3 => A4 существует
  const a2_1 = cacheService.getElement('A2_1');
  const a3 = cacheService.getElement('A3');
  const a4 = cacheService.getElement('A4');

  assert.ok(a2_1);
  assert.ok(a3);
  assert.ok(a4);
  assert.strictEqual(a2_1.parentId, null);
  assert.strictEqual(a3.parentId, 'A2_1');
  assert.strictEqual(a4.parentId, 'A3');

  // Теперь загружаем родителя A1, который должен объединить цепочки
  const result2 = await cacheService.loadElement(databaseService, 'A1');

  assert.strictEqual(result2.success, true);
  assert.ok(result2.loadedElements);
  assert.ok(result2.loadedElements.length >= 4); // A1, A2_1, A3, A4

  // Проверяем, что в кэше теперь есть только одна корневая цепочка A1 => A2_1 => A3 => A4
  const structure2 = cacheService.getCacheStructure();
  assert.strictEqual(structure2.length, 1);
  assert.strictEqual(structure2[0].id, 'A1');
  assert.strictEqual(structure2[0].parentId, null);

  // Проверяем, что цепочка A1 => A2_1 => A3 => A4 существует
  const a1 = cacheService.getElement('A1');
  const a2_1_updated = cacheService.getElement('A2_1');
  const a3_updated = cacheService.getElement('A3');
  const a4_updated = cacheService.getElement('A4');

  assert.ok(a1);
  assert.ok(a2_1_updated);
  assert.ok(a3_updated);
  assert.ok(a4_updated);

  // Проверяем правильную иерархию
  assert.strictEqual(a1.parentId, null);
  assert.strictEqual(a2_1_updated.parentId, 'A1');
  assert.strictEqual(a3_updated.parentId, 'A2_1');
  assert.strictEqual(a4_updated.parentId, 'A3');

  // Проверяем, что A1 имеет A2_1 как дочерний элемент
  assert.ok(a1.children.some((child) => child.id === 'A2_1'));

  // Проверяем, что A2_1 имеет A3 как дочерний элемент
  assert.ok(a2_1_updated.children.some((child) => child.id === 'A3'));

  // Проверяем, что A3 имеет A4 как дочерний элемент
  assert.ok(a3_updated.children.some((child) => child.id === 'A4'));
});

test('CacheService - loadElement - должен объединить цепочки для B2 -> B1', async () => {
  const cacheService = createTestCacheService();
  const databaseService = createTestDatabaseService();

  // Сначала загружаем B2, который должен создать цепочку B2 => B3
  const result1 = await cacheService.loadElement(databaseService, 'B2');

  assert.strictEqual(result1.success, true);
  assert.ok(result1.loadedElements);
  assert.ok(result1.loadedElements.length >= 2); // B2, B3

  // Проверяем, что в кэше есть только одна корневая цепочка B2 => B3
  const structure1 = cacheService.getCacheStructure();
  assert.strictEqual(structure1.length, 1);
  assert.strictEqual(structure1[0].id, 'B2');
  assert.strictEqual(structure1[0].parentId, null);

  // Проверяем, что цепочка B2 => B3 существует
  const b2 = cacheService.getElement('B2');
  const b3 = cacheService.getElement('B3');

  assert.ok(b2);
  assert.ok(b3);
  assert.strictEqual(b2.parentId, null);
  assert.strictEqual(b3.parentId, 'B2');

  // Теперь загружаем родителя B1, который должен объединить цепочки
  const result2 = await cacheService.loadElement(databaseService, 'B1');

  assert.strictEqual(result2.success, true);
  assert.ok(result2.loadedElements);
  assert.ok(result2.loadedElements.length >= 3); // B1, B2, B3

  // Проверяем, что в кэше теперь есть только одна корневая цепочка B1 => B2 => B3
  const structure2 = cacheService.getCacheStructure();
  assert.strictEqual(structure2.length, 1);
  assert.strictEqual(structure2[0].id, 'B1');
  assert.strictEqual(structure2[0].parentId, null);

  // Проверяем, что цепочка B1 => B2 => B3 существует
  const b1 = cacheService.getElement('B1');
  const b2_updated = cacheService.getElement('B2');
  const b3_updated = cacheService.getElement('B3');

  assert.ok(b1);
  assert.ok(b2_updated);
  assert.ok(b3_updated);

  // Проверяем правильную иерархию
  assert.strictEqual(b1.parentId, null);
  assert.strictEqual(b2_updated.parentId, 'B1');
  assert.strictEqual(b3_updated.parentId, 'B2');

  // Проверяем, что B1 имеет B2 как дочерний элемент
  assert.ok(b1.children.some((child) => child.id === 'B2'));

  // Проверяем, что B2 имеет B3 как дочерний элемент
  assert.ok(b2_updated.children.some((child) => child.id === 'B3'));
});

test('CacheService - loadElement - не должен изменять структуру при загрузке элемента, который уже в цепочке', async () => {
  const cacheService = createTestCacheService();
  const databaseService = createTestDatabaseService();

  // Сначала загружаем A2_1, который должен создать цепочку A2_1 => A3 => A4 => A5
  const result1 = await cacheService.loadElement(databaseService, 'A2_1');

  assert.strictEqual(result1.success, true);
  assert.ok(result1.loadedElements);
  assert.ok(result1.loadedElements.length >= 4); // A2_1, A3, A4, A5

  // Проверяем, что в кэше есть только одна корневая цепочка A2_1 => A3 => A4 => A5
  const structure1 = cacheService.getCacheStructure();
  assert.strictEqual(structure1.length, 1);
  assert.strictEqual(structure1[0].id, 'A2_1');
  assert.strictEqual(structure1[0].parentId, null);

  // Проверяем, что цепочка A2_1 => A3 => A4 => A5 существует
  const a2_1 = cacheService.getElement('A2_1');
  const a3 = cacheService.getElement('A3');
  const a4 = cacheService.getElement('A4');
  const a5 = cacheService.getElement('A5');

  assert.ok(a2_1);
  assert.ok(a3);
  assert.ok(a4);
  assert.ok(a5);
  assert.strictEqual(a2_1.parentId, null);
  assert.strictEqual(a3.parentId, 'A2_1');
  assert.strictEqual(a4.parentId, 'A3');
  assert.strictEqual(a5.parentId, 'A4');

  // Теперь загружаем A3, который уже является частью цепочки
  const result2 = await cacheService.loadElement(databaseService, 'A3');

  assert.strictEqual(result2.success, true);
  assert.ok(result2.loadedElements);
  assert.ok(result2.loadedElements.length >= 3); // A3, A4, A5

  // Проверяем, что структура кэша НЕ изменилась - должна остаться одна корневая цепочка
  const structure2 = cacheService.getCacheStructure();
  assert.strictEqual(structure2.length, 1);
  assert.strictEqual(structure2[0].id, 'A2_1');
  assert.strictEqual(structure2[0].parentId, null);

  // Проверяем, что цепочка A2_1 => A3 => A4 => A5 по-прежнему существует
  const a2_1_updated = cacheService.getElement('A2_1');
  const a3_updated = cacheService.getElement('A3');
  const a4_updated = cacheService.getElement('A4');
  const a5_updated = cacheService.getElement('A5');

  assert.ok(a2_1_updated);
  assert.ok(a3_updated);
  assert.ok(a4_updated);
  assert.ok(a5_updated);

  // Проверяем, что иерархия не изменилась
  assert.strictEqual(a2_1_updated.parentId, null);
  assert.strictEqual(a3_updated.parentId, 'A2_1'); // A3 остается дочерним элементом A2_1
  assert.strictEqual(a4_updated.parentId, 'A3');
  assert.strictEqual(a5_updated.parentId, 'A4');

  // Проверяем, что A2_1 имеет A3 как дочерний элемент
  assert.ok(a2_1_updated.children.some((child) => child.id === 'A3'));

  // Проверяем, что A3 имеет A4 как дочерний элемент
  assert.ok(a3_updated.children.some((child) => child.id === 'A4'));

  // Проверяем, что A4 имеет A5 как дочерний элемент
  assert.ok(a4_updated.children.some((child) => child.id === 'A5'));
});
