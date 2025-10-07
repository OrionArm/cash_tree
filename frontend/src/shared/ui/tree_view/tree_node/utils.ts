import type { TreeNode } from '@/entities/tree';

export const getNodeLabel = (node: TreeNode): string => {
  return node.value || node.name || 'Unnamed';
};
