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

export const addChildToNode = (
  nodes: TreeNode[],
  parentId: string,
  childNode: TreeNode,
): TreeNode[] => {
  return nodes.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...node.children, childNode],
      };
    }
    if (node.children.length) {
      return {
        ...node,
        children: addChildToNode(node.children, parentId, childNode),
      };
    }
    return node;
  });
};

export const updateNodeValue = (nodes: TreeNode[], nodeId: string, value: string): TreeNode[] => {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return { ...node, value };
    }
    return { ...node, children: updateNodeValue(node.children, nodeId, value) };
  });
};
