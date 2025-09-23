import React from 'react';
import type { TreeNode } from '@/entities/tree';
import { TreeNodeView } from './tree_node';
import { Spinner } from '@/shared/ui/spinner';
import styles from './tree_view.module.css';

type Props = {
  title: string;
  nodes: TreeNode[];
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
};

export const TreeView: React.FC<Props> = ({
  title,
  nodes,
  selectedNodeId,
  onNodeSelect,
  emptyMessage = 'Нет данных',
  isLoading = false,
  children,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <h3 className={styles.toolbarTitle}>{title}</h3>
        {children && <div className={styles.toolbarActions}>{children}</div>}
      </div>
      <div className={styles.treeContainer}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <Spinner size="medium" />
            <span>Загрузка...</span>
          </div>
        ) : nodes.length === 0 ? (
          <div className={styles.emptyState}>{emptyMessage}</div>
        ) : (
          nodes.map((node) => (
            <TreeNodeView
              key={node.id}
              node={node}
              level={0}
              selectedNodeId={selectedNodeId}
              onNodeSelect={onNodeSelect}
            />
          ))
        )}
      </div>
    </div>
  );
};
