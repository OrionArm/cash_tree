import { TreeNode } from '../dto/types';
import { elementsList } from './mock';

const sleep = (ms: number = 1): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class DatabaseService {
  private database: Map<string, TreeNode> = new Map(
    elementsList.map((element) => [element.id, element]),
  );

  private buildHierarchy(): Map<string, TreeNode> {
    const elementMap = new Map(
      Array.from(this.database.values())
        .filter((el) => !el.isDeleted)
        .map((el) => [el.id, { ...el, children: [] }]),
    );

    Array.from(elementMap.values()).forEach((el) => {
      if (el.parentId) {
        const parent = elementMap.get(el.parentId);
        parent?.children.push(el);
      }
    });

    return elementMap;
  }

  async getElement(id: string): Promise<TreeNode | null> {
    await sleep();

    const element = this.database.get(id);
    if (!element || element.isDeleted) {
      return null;
    }

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

  async getChildren(parentId: string): Promise<TreeNode[]> {
    await sleep();

    return Array.from(this.database.values()).filter(
      (element) => element.parentId === parentId && !element.isDeleted,
    );
  }

  async createElement(
    id: string,
    parentId: string | null,
    value: string,
  ): Promise<TreeNode> {
    await sleep();

    const newElement: TreeNode = {
      id,
      parentId,
      value,
      isDeleted: false,
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
}

export const databaseService = new DatabaseService();
