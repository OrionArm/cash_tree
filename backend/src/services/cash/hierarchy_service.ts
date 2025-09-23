import { TreeNode } from '../../dto/types';
import { IndexService } from './index_service';

export class HierarchyService {
  constructor(private indexService: IndexService) {}

  extractAllDescendants(element: TreeNode): TreeNode[] {
    const allDescendants: TreeNode[] = [];
    const stack: TreeNode[] = [...element.children];

    while (stack.length > 0) {
      const node = stack.pop()!;
      allDescendants.push(node);
      stack.push(...node.children);
    }

    return allDescendants;
  }

  mergeChains(
    parentElement: TreeNode,
    existingChildren: TreeNode[],
    cache: Map<string, TreeNode>,
  ): void {
    this.addElementToCache(parentElement, cache);

    // Обновляем parentId для существующих дочерних элементов
    existingChildren.forEach((child) => {
      const cachedChild = cache.get(child.id);
      if (cachedChild) {
        // Удаляем из корневых элементов, если элемент был корневым
        if (this.indexService.isRootElement(child.id)) {
          this.indexService.removeFromParentIndex(child.id, null);
        } else {
          this.indexService.removeFromParentIndex(
            child.id,
            cachedChild.parentId,
          );
        }

        // Обновляем parentId
        cachedChild.parentId = parentElement.id;

        // Добавляем к новому родителю
        this.indexService.addToParentIndex(child.id, parentElement.id);
        this.indexService.markElementAsDirty(child.id, parentElement.id);
      }
    });

    // Убеждаемся, что родительский элемент добавлен в корневые элементы
    this.indexService.addToParentIndex(parentElement.id, null);
  }

  replaceAllWithNewChain(
    newElement: TreeNode,
    cache: Map<string, TreeNode>,
  ): void {
    // Удаляем все существующие цепочки
    const rootElements = Array.from(this.indexService.getRootElements());
    rootElements.forEach((rootId) => {
      this.removeChain(rootId, cache);
    });

    // Добавляем новую цепочку
    this.addElementToCache(newElement, cache);
  }

  buildCacheStructure(cache: Map<string, TreeNode>): TreeNode[] {
    const result: TreeNode[] = [];
    this.indexService.getRootElements().forEach((id) => {
      const element = cache.get(id);
      if (element && !element.isDeleted) {
        result.push(element);
      }
    });
    return result;
  }

  private addElementToCache(
    element: TreeNode,
    cache: Map<string, TreeNode>,
  ): void {
    cache.set(element.id, element);
    this.indexService.addToParentIndex(element.id, element.parentId);
    this.indexService.markElementAsDirty(element.id, element.parentId);

    if (element.children?.length) {
      element.children.forEach((child) => {
        if (!cache.has(child.id)) {
          cache.set(child.id, child);
          this.indexService.addToParentIndex(child.id, child.parentId);
          this.indexService.markElementAsDirty(child.id, child.parentId);
        }
      });
    }
  }

  private removeChain(elementId: string, cache: Map<string, TreeNode>): void {
    const element = cache.get(elementId);
    if (!element) return;

    this.indexService.removeFromParentIndex(elementId, null);
    this.indexService.removeFromParentIndex(elementId, element.parentId);
    cache.delete(elementId);
    element.children.forEach((child) => {
      this.removeChain(child.id, cache);
    });
  }
}
