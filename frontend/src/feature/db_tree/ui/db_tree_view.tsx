import React, { useEffect, useMemo } from 'react';
import { useUnit } from 'effector-react';
import { $dbStore, $selectedDbNode, $isLoading, fetchDbData, selectDbNode } from '../model';
import { loadToCache } from '@/entities/tree';
import styles from './db_tree_view.module.css';
import { ActionBar, type ActionBarAction } from '@/shared/ui/action_bar';
import { TreeView } from '@/shared/ui/tree_view';

export const DBTreeView: React.FC = () => {
  const { selectedNodeId, dbNodes, isLoading } = useUnit({
    selectedNodeId: $selectedDbNode,
    dbNodes: $dbStore,
    isLoading: $isLoading,
  });

  useEffect(() => {
    fetchDbData();
  }, []);

  const toolbarActions: ActionBarAction[] = useMemo(
    () => [
      {
        id: 'load',
        label: 'Загрузить в кэш',
        icon: '⬇️',
        disabled: !selectedNodeId,
        onClick: () => selectedNodeId && loadToCache(selectedNodeId),
      },
    ],
    [selectedNodeId],
  );

  return (
    <div className={styles.container}>
      <TreeView
        title="База данных"
        nodes={dbNodes}
        selectedNodeId={selectedNodeId}
        onNodeSelect={selectDbNode}
        emptyMessage="База данных пуста"
        isLoading={isLoading}
      >
        <ActionBar actions={toolbarActions} />
      </TreeView>
    </div>
  );
};
