import type { LoadToCacheResponse } from '../api/load_to_cache';
import type { TreeNode } from './api_types';

export interface TreeApi {
  loadFromDb: () => Promise<TreeNode[]>;
  loadNodeFromDb: (nodeId: string) => Promise<TreeNode>;
  loadToCache: (elementId: string) => Promise<LoadToCacheResponse>;
  saveToDb: (nodes: TreeNode[]) => Promise<void>;
}

export type { TreeNode, LoadToCacheResponse };
