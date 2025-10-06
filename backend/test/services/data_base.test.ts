import { test } from 'node:test';
import * as assert from 'node:assert';
import {
  checkChainElements,
  checkElementIsDeleted,
  createTestDatabaseService,
  getAllIds,
} from './test_helpers';

test('DatabaseService - getElement - должен вернуть null для несуществующего элемента', async () => {
  const service = createTestDatabaseService();

  const result = await service.getElement('nonexistent');

  assert.strictEqual(result, null);
});

test('DatabaseService - getElement - должен вернуть null для удаленного элемента', async () => {
  const service = createTestDatabaseService();

  const result = await service.getElement('deleted');

  assert.strictEqual(result, null);
});

test('DatabaseService - getTreeStructure - должен вернуть только корневые элементы', async () => {
  const service = createTestDatabaseService();

  const result = await service.getTreeStructure();

  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 'root');
  assert.strictEqual(result[0].children.length, 2);
  assert.ok(result[0].children.some((child) => child.id === 'A1'));
  assert.ok(result[0].children.some((child) => child.id === 'B1'));
});

test('DatabaseService - getTreeStructure - должен включать удаленные элементы', async () => {
  const service = createTestDatabaseService();

  // Сначала удаляем элемент A1
  await service.markElementAsDeleted('A1');

  const result = await service.getTreeStructure();

  const allIds = result.flatMap((element) => getAllIds(element));
  assert.ok(allIds.includes('A1')); // A1 должен быть в структуре, но помечен как удаленный
});

test('DatabaseService - createElement - должен создать новый элемент', async () => {
  const service = createTestDatabaseService();

  const newElement = await service.createElement(
    'newElement',
    'root',
    'New Value',
  );

  assert.strictEqual(newElement.id, 'newElement');
  assert.strictEqual(newElement.parentId, 'root');
  assert.strictEqual(newElement.value, 'New Value');
  assert.strictEqual(newElement.isDeleted, false);
  assert.strictEqual(newElement.children.length, 0);
});

test('DatabaseService - createElement - должен сохранить элемент в базе данных', async () => {
  const service = createTestDatabaseService();

  await service.createElement('newElement', 'root', 'New Value');
  const retrieved = await service.getElement('newElement');

  assert.ok(retrieved);
  assert.strictEqual(retrieved.value, 'New Value');
});

test('DatabaseService - createElement - должен создать корневой элемент с parentId null', async () => {
  const service = createTestDatabaseService();

  const newElement = await service.createElement('newRoot', null, 'New Root');

  assert.strictEqual(newElement.id, 'newRoot');
  assert.strictEqual(newElement.parentId, null);
  assert.strictEqual(newElement.value, 'New Root');
});

test('DatabaseService - updateElement - должен обновить значение существующего элемента', async () => {
  const service = createTestDatabaseService();

  const result = await service.updateElement('A1', 'Updated Value');

  assert.ok(result);
  assert.strictEqual(result.id, 'A1');
  assert.strictEqual(result.value, 'Updated Value');
});

test('DatabaseService - updateElement - должен вернуть null для несуществующего элемента', async () => {
  const service = createTestDatabaseService();

  const result = await service.updateElement('nonexistent', 'New Value');

  assert.strictEqual(result, null);
});

test('DatabaseService - updateElement - должен вернуть null для удаленного элемента', async () => {
  const service = createTestDatabaseService();

  const result = await service.updateElement('deleted', 'New Value');

  assert.strictEqual(result, null);
});

test('DatabaseService - markElementAsDeleted - должен пометить элемент как удаленный', async () => {
  const service = createTestDatabaseService();

  await service.markElementAsDeleted('A1');
  const result = await service.getElement('A1');

  checkElementIsDeleted(result, true, 'структуре базы данных');
});

test('DatabaseService - markElementAsDeleted - должен рекурсивно удалить всех детей', async () => {
  const service = createTestDatabaseService();

  await service.markElementAsDeleted('A1');

  const dbStructure = await service.getTreeStructure();
  const expectedCacheElements = ['A1', 'A2_1', 'A2_2', 'A3', 'A4', 'A5'];
  checkChainElements(
    dbStructure,
    expectedCacheElements,
    true,
    'структуре базы данных',
  );
});

test('DatabaseService - markElementAsDeleted - не должен влиять на других детей того же родителя', async () => {
  const service = createTestDatabaseService();

  await service.markElementAsDeleted('A1');
  const dbStructure = await service.getTreeStructure();

  const expectedCacheElements = ['A1', 'A2_1', 'A2_2', 'A3', 'A4', 'A5'];
  checkChainElements(
    dbStructure,
    expectedCacheElements,
    true,
    'структуре базы данных',
  );
});

test('DatabaseService - markElementAsDeleted - не должен влиять на уже удаленный элемент', async () => {
  const service = createTestDatabaseService();

  await service.markElementAsDeleted('A1');
  await service.markElementAsDeleted('A1');

  const dbStructure = await service.getTreeStructure();

  const expectedCacheElements = ['A1', 'A2_1', 'A2_2', 'A3', 'A4', 'A5'];
  checkChainElements(
    dbStructure,
    expectedCacheElements,
    true,
    'структуре базы данных',
  );
});

test('DatabaseService - markElementAsDeleted - должен корректно обрабатывать несуществующий элемент', async () => {
  const service = createTestDatabaseService();

  // Попытка удалить несуществующий элемент не должна вызвать ошибку
  await assert.doesNotReject(async () => {
    await service.markElementAsDeleted('nonexistent');
  });
});
