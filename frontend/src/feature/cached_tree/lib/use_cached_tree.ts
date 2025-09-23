import { useMemo, useEffect } from 'react';
import { useUnit } from 'effector-react';
import {
  $cacheStore,
  $selectedCacheNode,
  $isValueModalOpen,
  $isAddChildModalOpen,
  $isLoading,
  $hasOperations,
  fetchCashDataEv,
} from '../model';
import type { TreeNode } from '@/entities';

const findNode = (nodes: any[], id: string): TreeNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
};

export const useCachedTree = () => {
  const cacheNodes = useUnit($cacheStore);
  const selectedNodeId = useUnit($selectedCacheNode);
  const isValueModalOpen = useUnit($isValueModalOpen);
  const isAddChildModalOpen = useUnit($isAddChildModalOpen);
  const isLoading = useUnit($isLoading);
  const hasOperations = useUnit($hasOperations);

  useEffect(() => {
    fetchCashDataEv();
  }, []);

  const selectedNode = useMemo(
    () => (selectedNodeId ? findNode(cacheNodes, selectedNodeId) : null),
    [selectedNodeId, cacheNodes],
  );

  return {
    cacheNodes,
    selectedNodeId,
    selectedNode,
    isValueModalOpen,
    isAddChildModalOpen,
    isLoading,
    hasOperations,
  };
};
