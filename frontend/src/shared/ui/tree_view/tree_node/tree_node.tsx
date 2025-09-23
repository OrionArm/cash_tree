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
    onNodeSelect(node.id);
  };

  const isSelected = selectedNodeId === node.id;
  const hasChildren = node.children.length > 0;

  return (
    <div className={styles.treeNode}>
      <div
        className={clsx(styles.treeNodeContent, { [styles.selected]: isSelected })}
        onClick={handleNodeClick}
        style={{ '--level': level } as React.CSSProperties}
      >
        {hasChildren && <ToggleButton isExpanded={isExpanded} onClick={handleToggle} />}
        {!hasChildren && <div className={styles.spacer} />}
        <span className={styles.nodeName}>{node.value || node.name || 'Unnamed'}</span>
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
