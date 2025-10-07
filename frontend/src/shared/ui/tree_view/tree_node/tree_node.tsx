import type { TreeNode } from '@/entities/tree';
import clsx from 'clsx';
import styles from './tree_node.module.css';
import { useState } from 'react';
import { ToggleButton } from '@/shared/ui/toggle_button';

type Props = {
  node: TreeNode;
  level: number;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
};

export const TreeNodeView: React.FC<Props> = ({ node, level, selectedNodeId, onNodeSelect }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleNodeClick = () => {
    if (!node.isDeleted) {
      onNodeSelect(node.id);
    }
  };

  const isSelected = selectedNodeId === node.id;
  const hasChildren = node.children.length > 0;
  const isDeleted = node.isDeleted;

  return (
    <div className={styles.treeNode}>
      <div
        className={clsx(styles.treeNodeContent, {
          [styles.selected]: isSelected,
          [styles.deleted]: isDeleted,
        })}
        onClick={handleNodeClick}
        style={{ '--level': level } as React.CSSProperties}
      >
        {hasChildren && !isDeleted && (
          <ToggleButton isExpanded={isExpanded} onClick={handleToggle} />
        )}
        {(!hasChildren || isDeleted) && <div className={styles.spacer} />}
        <span className={clsx(styles.nodeName, { [styles.deleted]: isDeleted })}>
          {node.value || 'Unnamed'}
        </span>
      </div>
      {hasChildren && isExpanded && (
        <div className={styles.children}>
          {node.children.map((child) => (
            <TreeNodeView
              key={child.id}
              node={child}
              level={level + 1}
              selectedNodeId={selectedNodeId}
              onNodeSelect={onNodeSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};
