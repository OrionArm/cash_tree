import type { LoadToCacheResponse } from '../api/load_to_cache';

export interface TreeNode {
  id: string;
  name: string;
  value: string;
  children: TreeNode[];
  parentId: string | null;
  isDeleted: boolean;
}

export interface TreeApi {
  loadFromDb: () => Promise<TreeNode[]>;
  loadNodeFromDb: (nodeId: string) => Promise<TreeNode>;
  loadToCache: (elementId: string) => Promise<LoadToCacheResponse>;
  saveToDb: (nodes: TreeNode[]) => Promise<void>;
}

export type { LoadToCacheResponse };
