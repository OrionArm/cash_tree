import type { TreeNode } from '@/entities';

export const markNodesAsDeleted = (
  nodes: TreeNode[],
  shouldDelete: (node: TreeNode, parentDeleted: boolean) => boolean,
  parentDeleted = false,
): TreeNode[] => {
  return nodes.map((node) => {
    const isDeleted = node.isDeleted || shouldDelete(node, parentDeleted);
    return {
      ...node,
      isDeleted,
      children: markNodesAsDeleted(node.children, shouldDelete, isDeleted),
    };
  });
};
