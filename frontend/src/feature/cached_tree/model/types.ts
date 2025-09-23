import type { TreeNode } from '@/entities/tree';

export interface CacheState {
  nodes: TreeNode[];
  selectedNodeId: string | null;
}

export interface UpdateNodePayload {
  id: string;
  value: string;
}

export interface AddChildPayload {
  parentId: string;
  name: string;
}
