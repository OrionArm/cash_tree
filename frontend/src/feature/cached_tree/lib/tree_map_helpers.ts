import type { TreeNode } from '@/entities';

const traverseTree = (nodes: TreeNode[], callback: (node: TreeNode) => void): void => {
  nodes.forEach((node) => {
    callback(node);
    if (node.children.length > 0) {
      traverseTree(node.children, callback);
    }
  });
};

export const buildNodeMap = (nodes: TreeNode[]): Map<string, TreeNode> => {
  const map = new Map<string, TreeNode>();

  traverseTree(nodes, (node) => {
    map.set(node.id, node);
  });

  return map;
};
