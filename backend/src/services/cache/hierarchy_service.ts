import { singleton, inject } from 'tsyringe';
import { TreeNode } from '../../dto/types';
import { IndexService } from './index_service';

@singleton()
export class HierarchyService {
  constructor(
    @inject(IndexService) private readonly indexService: IndexService,
  ) {}

  /**
   * Добавляет дочерний элемент к родительскому
   * @param parent Родительский элемент
   * @param child Дочерний элемент
   * @param skipDuplicateCheck Пропустить проверку на дубликаты
   */
  addChildToParent(
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
      this.markElementAndChildrenAsDeleted(child);
    }
  }

  /**
   * Перемещает существующих детей из корня к родителю
   * @param parentElement Родительский элемент
   * @param cache Кэш элементов
   */
  moveExistingChildrenToParent(
    parentElement: TreeNode,
    cache: Map<string, TreeNode>,
    updateIndexes: (elementId: string, parentId: string) => void,
  ): void {
    // Ищем только корневые элементы в кэше, которые имеют parentId равный id загруженного элемента
    const childrenToMove: TreeNode[] = [];

    cache.forEach((element) => {
      if (
        element.parentId === parentElement.id &&
        element.id !== parentElement.id &&
        this.indexService.isRootElement(element.id)
      ) {
        childrenToMove.push(element);
      }
    });

    // Перемещаем найденные элементы
    childrenToMove.forEach((child) => {
      // Удаляем из корневых элементов
      this.indexService.removeFromParentIndex(child.id, null);

      // Добавляем к новому родителю
      updateIndexes(child.id, parentElement.id);

      // Добавляем существующих детей к загружаемому элементу
      this.addChildToParent(parentElement, child);
    });
  }

  /**
   * Помечает элемент и всех его детей как удаленные рекурсивно
   * @param element Элемент для пометки
   */
  markElementAndChildrenAsDeleted(element: TreeNode): void {
    element.isDeleted = true;
    element.children.forEach((child) =>
      this.markElementAndChildrenAsDeleted(child),
    );
  }

  /**
   * Строит структуру дерева из корневых элементов
   * @param cache Кэш элементов
   * @returns Массив корневых элементов
   */
  buildTreeStructure(cache: Map<string, TreeNode>): TreeNode[] {
    const result: TreeNode[] = [];
    this.indexService.getRootElements().forEach((id) => {
      const element = cache.get(id);
      if (element) {
        result.push(element);
      }
    });
    return result;
  }
}
