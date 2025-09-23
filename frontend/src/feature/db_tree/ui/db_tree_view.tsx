import React, { useEffect, useMemo, useCallback } from 'react';
import { useUnit } from 'effector-react';
import { $dbStore, $selectedDbNode, $isLoading, fetchDbData, selectDbNode } from '../model';
import { loadToCacheEv } from '@/entities/tree';
import styles from './db_tree_view.module.css';
import { ActionBar, type ActionBarAction } from '@/shared/ui/action_bar';
import { TreeView } from '@/shared/ui/tree_view';

export const DBTreeView: React.FC = () => {
  const selectedNodeId = useUnit($selectedDbNode);
  const dbNodes = useUnit($dbStore);
  const isLoading = useUnit($isLoading);

  useEffect(() => {
    fetchDbData();
  }, []);

  const handleNodeSelect = useCallback(
    (nodeId: string | null) => {
      selectDbNode(nodeId);
    },
    [selectDbNode],
  );

  const handleLoadToCache = useCallback(() => {
    if (selectedNodeId) {
      loadToCacheEv(selectedNodeId);
    }
  }, [selectedNodeId, loadToCacheEv]);

  const toolbarActions: ActionBarAction[] = useMemo(
    () => [
      {
        id: 'load',
        label: 'Загрузить в кэш',
        icon: '⬇️',
        disabled: !selectedNodeId,
        onClick: handleLoadToCache,
      },
    ],
    [selectedNodeId, handleLoadToCache],
  );

  return (
    <div className={styles.container}>
      <TreeView
        title="База данных"
        nodes={dbNodes}
        selectedNodeId={selectedNodeId}
        onNodeSelect={handleNodeSelect}
        emptyMessage="База данных пуста"
        isLoading={isLoading}
      >
        <ActionBar actions={toolbarActions} />
      </TreeView>
    </div>
  );
};
