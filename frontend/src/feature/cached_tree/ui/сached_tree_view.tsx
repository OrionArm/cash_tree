import React, { useMemo } from 'react';
import { ValueModal } from './value_modal';
import { AddChildModal } from './add_child_modal';
import { ActionBar, type ActionBarAction } from '@/shared/ui/action_bar';
import { useCachedTree } from '../lib/use_cached_tree';
import styles from './cached_tree_view.module.css';
import { TreeView } from '@/shared/ui/tree_view';
import {
  applyCacheEv,
  closeAddChildModalEv,
  closeValueModalEv,
  openAddChildModalEv,
  openValueModalEv,
  removeFromCacheEv,
  resetCacheDataEv,
  saveChildNodeEv,
  saveNodeValueEv,
  selectCacheNodeEv,
} from '../model';

export const CachedTreeView: React.FC = () => {
  const {
    cacheNodes,
    selectedNodeId,
    selectedNode,
    isValueModalOpen,
    isAddChildModalOpen,
    isLoading,
    hasOperations,
  } = useCachedTree();

  const toolbarActions: ActionBarAction[] = useMemo(
    () => [
      {
        id: 'delete',
        label: 'Удалить',
        icon: '🗑️',
        disabled: !selectedNodeId,
        onClick: () => selectedNodeId && removeFromCacheEv(selectedNodeId),
      },
      {
        id: 'setValue',
        label: 'Задать значение',
        icon: '✏️',
        disabled: !selectedNodeId,
        onClick: openValueModalEv,
      },
      {
        id: 'addChild',
        label: 'Добавить дочерний',
        icon: '➕',
        disabled: !selectedNodeId,
        onClick: openAddChildModalEv,
      },
      {
        id: 'save',
        label: 'Сохранить в БД',
        icon: '💾',
        disabled: !hasOperations,
        onClick: applyCacheEv,
      },
      {
        id: 'reset',
        label: 'Сбросить кэш',
        icon: '🔄',
        disabled: cacheNodes.length === 0,
        onClick: resetCacheDataEv,
      },
    ],
    [selectedNodeId, hasOperations, cacheNodes.length],
  );

  return (
    <div className={styles.container}>
      <TreeView
        title="Кэш (с асинхронной загрузкой)"
        nodes={cacheNodes}
        selectedNodeId={selectedNodeId}
        onNodeSelect={selectCacheNodeEv}
        emptyMessage="Кэш пуст"
        isLoading={isLoading}
      >
        <ActionBar actions={toolbarActions} />
      </TreeView>

      <ValueModal
        isOpen={isValueModalOpen}
        onClose={closeValueModalEv}
        onSave={saveNodeValueEv}
        initialValue={selectedNode?.value || ''}
        nodeName={selectedNode?.value || ''}
      />

      <AddChildModal
        isOpen={isAddChildModalOpen}
        onClose={closeAddChildModalEv}
        onSave={saveChildNodeEv}
        parentName={selectedNode?.value || ''}
      />
    </div>
  );
};
