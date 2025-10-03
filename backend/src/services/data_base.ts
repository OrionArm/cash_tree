import { TreeNode } from '../dto/types';
import { getInitialElements } from './mock';

const sleep = (ms: number = 1): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class DatabaseService {
  private database: Map<string, TreeNode> = new Map(
    getInitialElements().map((element) => [element.id, element]),
  );

  private buildHierarchy(): Map<string, TreeNode> {
    const elementMap = new Map(
      Array.from(this.database.values()).map((el) => [
        el.id,
        { ...el, children: [] },
      ]),
    );

    Array.from(elementMap.values()).forEach((el) => {
      if (el.parentId) {
        const parent = elementMap.get(el.parentId);
        if (parent) {
          parent.children.push(el);
        }
      }
    });

    return elementMap;
  }

  async getElement(id: string): Promise<TreeNode | null> {
    await sleep();

    const element = this.database.get(id);
    if (!element || element.isDeleted) return null;

    const elementMap = this.buildHierarchy();
    return elementMap.get(id) || null;
  }

  async getTreeStructure(): Promise<TreeNode[]> {
    await sleep();

    const elementMap = this.buildHierarchy();
    return Array.from(elementMap.values()).filter(
      (element) => element.parentId === null,
    );
  }

  async createElement(
    id: string,
    parentId: string | null,
    value: string,
  ): Promise<TreeNode> {
    await sleep();

    let isDeleted = false;
    if (parentId) {
      const parent = this.database.get(parentId);
      if (parent && parent.isDeleted) {
        isDeleted = true;
      }
    }

    const newElement: TreeNode = {
      id,
      parentId,
      value,
      isDeleted,
      children: [],
    };

    this.database.set(id, newElement);
    return newElement;
  }

  async updateElement(id: string, value: string): Promise<TreeNode | null> {
    await sleep();

    const element = this.database.get(id);
    if (element && !element.isDeleted) {
      element.value = value;
      return element;
    }
    return null;
  }

  async markElementAsDeleted(elementId: string): Promise<void> {
    await sleep();

    const element = this.database.get(elementId);
    if (element && !element.isDeleted) {
      element.isDeleted = true;

      const children = Array.from(this.database.values()).filter(
        (el) => el.parentId === elementId,
      );
      for (const child of children) {
        await this.markElementAsDeleted(child.id);
      }
    }
  }

  async reset(): Promise<void> {
    await sleep();

    this.database = new Map(
      getInitialElements().map((element) => [element.id, element]),
    );
  }
}

export const databaseService = new DatabaseService();
