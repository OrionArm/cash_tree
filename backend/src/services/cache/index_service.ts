import { singleton } from 'tsyringe';
import { TreeNode } from '../../dto/types';

@singleton()
export class IndexService {
  private readonly parentToChildrenIndex: Map<string, Set<string>> = new Map();
  private readonly rootElementsIndex: Set<string> = new Set();
  private readonly dirtyElements: Set<string> = new Set();

  addToParentIndex(elementId: string, parentId: string | null): void {
    if (parentId === null) {
      this.rootElementsIndex.add(elementId);
    } else {
      if (!this.parentToChildrenIndex.has(parentId)) {
        this.parentToChildrenIndex.set(parentId, new Set());
      }
      this.parentToChildrenIndex.get(parentId)!.add(elementId);
    }
  }

  removeFromParentIndex(elementId: string, parentId: string | null): void {
    if (parentId === null) {
      this.rootElementsIndex.delete(elementId);
    } else {
      const childrenSet = this.parentToChildrenIndex.get(parentId);
      if (childrenSet) {
        childrenSet.delete(elementId);
        if (childrenSet.size === 0) {
          this.parentToChildrenIndex.delete(parentId);
        }
      }
    }
  }

  markElementAsDirty(elementId: string, parentId: string | null): void {
    this.dirtyElements.add(elementId);
    if (parentId) {
      this.dirtyElements.add(parentId);
    }
  }

  getRootElements(): Set<string> {
    return this.rootElementsIndex;
  }

  isRootElement(elementId: string): boolean {
    return this.rootElementsIndex.has(elementId);
  }

  getDirtyElements(): Set<string> {
    return this.dirtyElements;
  }

  rebuildHierarchy(cache: Map<string, TreeNode>): void {
    this.dirtyElements.forEach((elementId) => {
      const element = cache.get(elementId);
      if (!element) return;

      element.children.length = 0;
      const childrenSet = this.parentToChildrenIndex.get(elementId);
      if (childrenSet) {
        childrenSet.forEach((childId) => {
          const child = cache.get(childId);
          if (child) element.children.push(child);
        });
      }
    });

    this.dirtyElements.clear();
  }

  clear(): void {
    this.parentToChildrenIndex.clear();
    this.rootElementsIndex.clear();
    this.dirtyElements.clear();
  }
}
