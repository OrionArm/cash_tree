import 'reflect-metadata';
import { test } from 'node:test';
import * as assert from 'node:assert';
import { container } from 'tsyringe';
import {
  createTestCacheService,
  createTestDatabaseService,
  getAllIds,
  getOperationsCount,
  getOperations,
  checkChainElements,
} from './test_helpers';
import { CacheService } from '../../src/services/cache';

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
  assert.ok(Array.isArray(newElement.children));
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
  assert.ok(Array.isArray(newElement.children));
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

test('CacheService - createElement - созданный элемент должен быть добавлен в кэш без детей', () => {
  const service = createTestCacheService();

  const newElement = service.createElement('A1', 'New Child Element');

  // Проверяем, что элемент добавлен в кэш
  const cachedElement = service.getElement(newElement.id);
  assert.ok(cachedElement);

  // Проверяем, что элемент добавлен без детей
  assert.strictEqual(cachedElement.children.length, 0);
  assert.ok(Array.isArray(cachedElement.children));
  assert.strictEqual(cachedElement.value, 'New Child Element');
  assert.strictEqual(cachedElement.parentId, 'A1');
  assert.strictEqual(cachedElement.isDeleted, false);
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
  const firstChild = root.children[0];
  assert.ok(firstChild);
  assert.strictEqual(firstChild.id, b1Element.id); // Используем ID созданного элемента
});

// ==================== ТЕСТЫ ДЛЯ loadElement ====================

test('CacheService - loadElement - должен загрузить элемент из базы данных', async () => {
  const cacheService = createTestCacheService();
  const databaseService = createTestDatabaseService();

  const result = await cacheService.loadElement(databaseService, 'A1');

  assert.strictEqual(result.success, true);
  assert.ok(
    result.message.includes('Элемент уже в кэше') ||
      result.message.includes('Элемент успешно загружен в кэш'),
  );
  assert.strictEqual(result.descendantsCount, 0);
  assert.ok(Array.isArray(result.loadedElements));
  assert.strictEqual(result.loadedElements.length, 1);
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

test('CacheService - loadElement - должен загрузить элемент и добавить его в иерархию', async () => {
  const cacheService = createTestCacheService();
  const databaseService = createTestDatabaseService();

  const result = await cacheService.loadElement(databaseService, 'A1');

  assert.strictEqual(result.success, true);
  assert.ok(result.loadedElements);
  assert.strictEqual(result.loadedElements.length, 1);

  // Элемент должен быть загруженным с оригинальным parentId
  const loadedElement = result.loadedElements[0];
  assert.ok(loadedElement);
  assert.strictEqual(loadedElement.parentId, 'root'); // Оригинальный parentId из базы данных
  assert.strictEqual(loadedElement.value, 'A1');
  assert.strictEqual(loadedElement.children.length, 0);
  assert.ok(Array.isArray(loadedElement.children));

  // Проверяем, что элемент добавлен в иерархию
  const rootElement = cacheService.getElement('root');
  assert.ok(rootElement);
  assert.ok(rootElement.children.some((child) => child.id === 'A1'));
});

test('CacheService - loadElement - должен загрузить элемент в кэш', async () => {
  const cacheService = createTestCacheService();
  const databaseService = createTestDatabaseService();

  await cacheService.loadElement(databaseService, 'A1');

  // Проверяем, что элемент теперь доступен в кэше
  const cachedElement = cacheService.getElement('A1');
  assert.ok(cachedElement);
  assert.strictEqual(cachedElement.parentId, 'root'); // Оригинальный parentId
  assert.strictEqual(cachedElement.children.length, 0); // Должен быть без детей
  assert.ok(Array.isArray(cachedElement.children));

  // Проверяем, что элемент добавлен в иерархию
  const rootElement = cacheService.getElement('root');
  assert.ok(rootElement);
  assert.ok(rootElement.children.some((child) => child.id === 'A1'));
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
  const op0 = operations[0];
  const op1 = operations[1];
  const op2 = operations[2];
  assert.ok(op0);
  assert.ok(op1);
  assert.ok(op2);
  assert.strictEqual(op0.type, 'create');
  assert.strictEqual(op1.type, 'update');
  assert.strictEqual(op2.type, 'delete');
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

  // Проверяем, что созданные элементы присутствуют в структуре
  checkChainElements(structure, [element1.id], false, 'структуре кэша');

  // Проверяем, что удаленный элемент и его дети недоступны через getElement
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

  // Проверяем иерархию через структуру кэша
  const structure = service.getCacheStructure();
  checkChainElements(
    structure,
    [root.id, child1.id, child2.id, grandchild.id],
    false,
    'структуре кэша',
  );
});

test('CacheService - должен корректно обрабатывать загрузку элементов без потомков', async () => {
  const cacheService = createTestCacheService();
  const databaseService = createTestDatabaseService();

  // Загружаем элемент A1, который имеет потомков в тестовых данных
  const result = await cacheService.loadElement(databaseService, 'A1');

  assert.strictEqual(result.success, true);
  assert.ok(result.loadedElements);
  assert.strictEqual(result.loadedElements.length, 1); // Должен загрузить только сам элемент без потомков

  // Проверяем, что загруженный элемент доступен в кэше
  const loadedElement = result.loadedElements[0];
  assert.ok(loadedElement);
  const cachedElement = cacheService.getElement(loadedElement.id);
  assert.ok(cachedElement);

  // Проверяем, что элемент загружен без детей
  assert.strictEqual(cachedElement.children.length, 0);
  assert.ok(Array.isArray(cachedElement.children));
});

test('CacheService - loadElement - загруженный элемент должен появиться в getCacheStructure', async () => {
  const cacheService = createTestCacheService();
  const databaseService = createTestDatabaseService();

  // Проверяем, что кэш изначально пустой
  const initialStructure = cacheService.getCacheStructure();
  assert.strictEqual(initialStructure.length, 0);

  // Сначала загружаем элемент root
  await cacheService.loadElement(databaseService, 'root');

  // Теперь загружаем элемент A1 без его потомков
  const result = await cacheService.loadElement(databaseService, 'A1');

  assert.strictEqual(result.success, true);
  assert.ok(result.loadedElements);
  assert.strictEqual(result.loadedElements.length, 1);

  // Проверяем, что загруженный элемент появился в структуре кэша
  const structure = cacheService.getCacheStructure();
  assert.strictEqual(structure.length, 1); // Только root элемент

  // Проверяем, что root и A1 присутствуют в структуре
  checkChainElements(structure, ['root', 'A1'], false, 'структуре кэша');
});

test('CacheService - loadElement - должен загружать элементы по отдельности без потомков', async () => {
  const cacheService = createTestCacheService();
  const databaseService = createTestDatabaseService();

  // Сначала загружаем элемент root
  await cacheService.loadElement(databaseService, 'root');

  // Затем загружаем A2_1 без потомков
  const result1 = await cacheService.loadElement(databaseService, 'A2_1');

  assert.strictEqual(result1.success, true);
  assert.ok(result1.loadedElements);
  assert.strictEqual(result1.loadedElements.length, 1); // Только A2_1

  // Проверяем, что A2_1 загружен с правильным parentId
  const a2_1 = cacheService.getElement('A2_1');
  assert.ok(a2_1);
  assert.strictEqual(a2_1.parentId, 'A1'); // Оригинальный parentId
  assert.strictEqual(a2_1.children.length, 0);
  assert.ok(Array.isArray(a2_1.children));

  // Проверяем, что в кэше есть только один корневой элемент (root)
  const structure1 = cacheService.getCacheStructure();
  assert.strictEqual(structure1.length, 1);
  const root1 = structure1[0];
  assert.ok(root1);
  assert.strictEqual(root1.id, 'root');

  // Теперь загружаем родителя A1 без потомков
  const result2 = await cacheService.loadElement(databaseService, 'A1');

  assert.strictEqual(result2.success, true);
  assert.ok(result2.loadedElements);
  assert.strictEqual(result2.loadedElements.length, 1); // Только A1

  // Проверяем, что A1 загружен с правильным parentId
  const a1 = cacheService.getElement('A1');
  assert.ok(a1);
  assert.strictEqual(a1.parentId, 'root'); // Оригинальный parentId
  assert.ok(Array.isArray(a1.children));

  // Проверяем, что в кэше есть только один корневой элемент (root)
  const structure2 = cacheService.getCacheStructure();
  assert.strictEqual(structure2.length, 1);
  const root2 = structure2[0];
  assert.ok(root2);
  assert.strictEqual(root2.id, 'root');

  // Проверяем, что root и A1 присутствуют в структуре
  checkChainElements(structure2, ['root', 'A1'], false, 'структуре кэша');
});

test('CacheService - loadElement - должен загружать B2_1 и B1 по отдельности без потомков', async () => {
  const cacheService = createTestCacheService();
  const databaseService = createTestDatabaseService();

  // Сначала загружаем элемент root
  await cacheService.loadElement(databaseService, 'root');

  // Затем загружаем B2_1 без потомков
  const result1 = await cacheService.loadElement(databaseService, 'B2_1');

  assert.strictEqual(result1.success, true);
  assert.ok(result1.loadedElements);
  assert.strictEqual(result1.loadedElements.length, 1); // Только B2_1

  // Проверяем, что B2_1 загружен с правильным parentId
  const b2_1 = cacheService.getElement('B2_1');
  assert.ok(b2_1);
  assert.strictEqual(b2_1.parentId, 'B1'); // Оригинальный parentId
  assert.strictEqual(b2_1.children.length, 0);
  assert.ok(Array.isArray(b2_1.children));

  // Проверяем, что в кэше есть только один корневой элемент (root)
  const structure1 = cacheService.getCacheStructure();
  assert.strictEqual(structure1.length, 1);
  const root1 = structure1[0];
  assert.ok(root1);
  assert.strictEqual(root1.id, 'root');

  // Теперь загружаем родителя B1 без потомков
  const result2 = await cacheService.loadElement(databaseService, 'B1');

  assert.strictEqual(result2.success, true);
  assert.ok(result2.loadedElements);
  assert.strictEqual(result2.loadedElements.length, 1); // Только B1

  // Проверяем, что B1 загружен с правильным parentId
  const b1 = cacheService.getElement('B1');
  assert.ok(b1);
  assert.strictEqual(b1.parentId, 'root'); // Оригинальный parentId
  assert.ok(Array.isArray(b1.children));

  // Проверяем, что в кэше есть только один корневой элемент (root)
  const structure2 = cacheService.getCacheStructure();
  assert.strictEqual(structure2.length, 1);
  const root2 = structure2[0];
  assert.ok(root2);
  assert.strictEqual(root2.id, 'root');

  // Проверяем, что root и B1 присутствуют в структуре
  checkChainElements(structure2, ['root', 'B1'], false, 'структуре кэша');
});

test('CacheService - loadElement - должен загружать элементы независимо друг от друга', async () => {
  const cacheService = createTestCacheService();
  const databaseService = createTestDatabaseService();

  // Сначала загружаем элемент root
  await cacheService.loadElement(databaseService, 'root');

  // Затем загружаем A1 (родитель A2_1)
  await cacheService.loadElement(databaseService, 'A1');

  // Затем загружаем A2_1 без потомков
  const result1 = await cacheService.loadElement(databaseService, 'A2_1');

  assert.strictEqual(result1.success, true);
  assert.ok(result1.loadedElements);
  assert.strictEqual(result1.loadedElements.length, 1); // Только A2_1

  // Проверяем, что A2_1 загружен с правильным parentId
  const a2_1 = cacheService.getElement('A2_1');
  assert.ok(a2_1);
  assert.strictEqual(a2_1.parentId, 'A1'); // Оригинальный parentId
  assert.strictEqual(a2_1.children.length, 0);
  assert.ok(Array.isArray(a2_1.children));

  // Проверяем, что в кэше есть только один корневой элемент (root)
  const structure1 = cacheService.getCacheStructure();
  assert.strictEqual(structure1.length, 1);
  const root1 = structure1[0];
  assert.ok(root1);
  assert.strictEqual(root1.id, 'root');

  // Проверяем, что root и A2_1 присутствуют в структуре
  checkChainElements(structure1, ['root', 'A2_1'], false, 'структуре кэша');

  // Теперь загружаем A3 без потомков
  const result2 = await cacheService.loadElement(databaseService, 'A3');

  assert.strictEqual(result2.success, true);
  assert.ok(result2.loadedElements);
  assert.strictEqual(result2.loadedElements.length, 1); // Только A3

  // Проверяем, что A3 загружен с правильным parentId
  const a3 = cacheService.getElement('A3');
  assert.ok(a3);
  assert.strictEqual(a3.parentId, 'A2_1'); // Оригинальный parentId
  assert.strictEqual(a3.children.length, 0);
  assert.ok(Array.isArray(a3.children));

  // Проверяем, что в кэше есть только один корневой элемент (root)
  const structure2 = cacheService.getCacheStructure();
  assert.strictEqual(structure2.length, 1);
  const root2 = structure2[0];
  assert.ok(root2);
  assert.strictEqual(root2.id, 'root');

  // Проверяем, что root, A2_1 и A3 присутствуют в структуре
  checkChainElements(
    structure2,
    ['root', 'A2_1', 'A3'],
    false,
    'структуре кэша',
  );
});

test('CacheService - loadElement - должен переместить ранее загруженный элемент в иерархию при загрузке родителя', async () => {
  const cacheService = container.resolve(CacheService);
  cacheService.clear();
  const databaseService = createTestDatabaseService();

  // Сначала загружаем дочерний элемент A2_1 (родитель A1 не загружен)
  const result1 = await cacheService.loadElement(databaseService, 'A2_1');
  assert.strictEqual(result1.success, true);

  // Проверяем, что A2_1 стал корневым элементом (но сохраняет оригинальный parentId)
  const structure1 = cacheService.getCacheStructure();
  assert.strictEqual(structure1.length, 1);
  const root1 = structure1[0];
  assert.ok(root1);
  assert.strictEqual(root1.id, 'A2_1');

  const a2_1_before = cacheService.getElement('A2_1');
  assert.ok(a2_1_before);
  assert.strictEqual(a2_1_before.parentId, 'A1'); // Сохраняет оригинальный parentId

  // Теперь загружаем родительский элемент A1
  const result2 = await cacheService.loadElement(databaseService, 'A1');
  assert.strictEqual(result2.success, true);

  // Проверяем, что A1 стал корневым элементом
  const structure2 = cacheService.getCacheStructure();
  assert.strictEqual(structure2.length, 1);
  const root2 = structure2[0];
  assert.ok(root2);
  assert.strictEqual(root2.id, 'A1');

  // Проверяем, что A1 и A2_1 присутствуют в структуре
  checkChainElements(structure2, ['A1', 'A2_1'], false, 'структуре кэша');
});

test('CacheService - комплексный тест с загрузкой, созданием, удалением и применением операций', async () => {
  const cacheService = container.resolve(CacheService);
  cacheService.clear();
  const databaseService = createTestDatabaseService();

  // 1) Загрузить A6
  const loadA6Result = await cacheService.loadElement(databaseService, 'A6');
  assert.strictEqual(loadA6Result.success, true);

  // 2) Загрузить A1
  const loadA1Result = await cacheService.loadElement(databaseService, 'A1');
  assert.strictEqual(loadA1Result.success, true);

  // 3) Удалить A1
  cacheService.deleteElement('A1');

  // 4) К A6 добавить ноду "1"
  const node1 = cacheService.createElement('A6', '1');
  assert.ok(node1);

  // 5) К ноде "1" добавить новую ноду "11"
  const node11 = cacheService.createElement(node1.id, '11');
  assert.ok(node11);

  // 6) Применить операции
  const applyResult = await cacheService.applyOperations(databaseService);
  assert.strictEqual(applyResult.success, true);

  // 7) Проверяем состояние в кэше
  const cacheStructure = cacheService.getCacheStructure();

  // 8) Проверяем элементы в структуре кэша
  // A6, node1, node11 должны быть помечены как удалённые, т.к. A6 - потомок A1
  const expectedCacheElements = ['A6', node1.id, node11.id];
  checkChainElements(
    cacheStructure,
    expectedCacheElements,
    true,
    'структуре кэша',
  );

  // 9) Проверяем состояние в базе данных
  const dbStructure = await databaseService.getTreeStructure();

  // 10) Проверяем что A1, A6 и его дети (node1, node11) присутствуют в базе и помечены как удаленные
  const expectedDbElements = ['A1', 'A6', node1.id, node11.id];
  checkChainElements(dbStructure, expectedDbElements, true, 'базе данных');
});

test('CacheService - добавляем потомка к удаленному элементу', async () => {
  const cacheService = container.resolve(CacheService);
  cacheService.clear();
  const databaseService = createTestDatabaseService();

  // 1) Загрузить A3
  const loadA6Result = await cacheService.loadElement(databaseService, 'A3');
  assert.strictEqual(loadA6Result.success, true);
  // 2) Удалить A3
  cacheService.deleteElement('A3');

  // 2) Добавляем потомка
  const loadA4Result = await cacheService.loadElement(databaseService, 'A4');
  assert.strictEqual(loadA4Result.success, true);

  // 8) Проверяем элементы в структуре кэша
  const cacheStructure = cacheService.getCacheStructure();
  const expectedCacheElements = ['A3', 'A4'];
  checkChainElements(
    cacheStructure,
    expectedCacheElements,
    true,
    'структуре кэша',
  );
});

test('CacheService - добавляем потомка к удаленному элементу, при наличии потомка добавляемого элемента в кэше', async () => {
  const cacheService = container.resolve(CacheService);
  cacheService.clear();
  const databaseService = createTestDatabaseService();

  // 1) Загрузить A1
  const loadA1Result = await cacheService.loadElement(databaseService, 'A1');
  assert.strictEqual(loadA1Result.success, true);

  // 2) Добавляем внука
  const loadA4Result = await cacheService.loadElement(databaseService, 'A3');
  assert.strictEqual(loadA4Result.success, true);

  // 3) Удаляем корень A1
  cacheService.deleteElement('A1');

  // 4) Добавляем дочерний элемент
  await cacheService.loadElement(databaseService, 'A2_1');

  // 5) Проверяем элементы в структуре кэша
  const cacheStructure = cacheService.getCacheStructure();
  const expectedCacheElements = ['A1', 'A2_1', 'A3'];
  checkChainElements(
    cacheStructure,
    expectedCacheElements,
    true,
    'структуре кэша',
  );
});

test('CacheService - Повторно добавляем элемент в удалённой цепочке', async () => {
  const cacheService = container.resolve(CacheService);
  cacheService.clear();
  const databaseService = createTestDatabaseService();

  await cacheService.loadElement(databaseService, 'A1');
  await cacheService.loadElement(databaseService, 'A2_1');
  cacheService.deleteElement('A1');

  const cacheStructure = cacheService.getCacheStructure();
  const expectedCacheElements = ['A1', 'A2_1'];
  checkChainElements(
    cacheStructure,
    expectedCacheElements,
    true,
    'структуре кэша',
  );

  // повторно добавляем элемент в удалённой цепочке, она должна остаться удаленной
  await cacheService.loadElement(databaseService, 'A2_1');
  const cacheStructure2 = cacheService.getCacheStructure();
  const expectedCacheElements2 = ['A1', 'A2_1'];

  checkChainElements(
    cacheStructure2,
    expectedCacheElements2,
    true,
    'структуре кэша',
  );
});

test('CacheService - Загружаем A3, затем A1, удаляем A1, применяем - A3 должен быть удалён', async () => {
  const cacheService = container.resolve(CacheService);
  cacheService.clear();
  const databaseService = createTestDatabaseService();

  await cacheService.loadElement(databaseService, 'A3');
  await cacheService.loadElement(databaseService, 'A1');
  cacheService.deleteElement('A1');
  const applyResult = await cacheService.applyOperations(databaseService);
  assert.strictEqual(applyResult.success, true);

  const dbStructure = await databaseService.getTreeStructure();
  const cacheStructure = cacheService.getCacheStructure();

  // В БД: A1 и все его потомки (A2_1, A3) должны быть удалены
  checkChainElements(dbStructure, ['A1', 'A2_1', 'A3'], true, 'базе данных');

  // В кэше: A3 должен быть помечен как удалённый, чтобы не вводить пользователя в заблуждение
  checkChainElements(cacheStructure, ['A3'], true, 'структуре кэша');
});
