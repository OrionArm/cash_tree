import React, { useEffect, useMemo } from 'react';
import { useUnit } from 'effector-react';
import { FormModal } from '@/shared/ui/form_modal';
import { ActionBar, type ActionBarAction } from '@/shared/ui/action_bar';
import styles from './cached_tree_view.module.css';
import { TreeView } from '@/shared/ui/tree_view';
import {
  $cache,
  $selectedCacheNode,
  $selectedNode,
  $isValueModalOpen,
  $isAddChildModalOpen,
  $isLoading,
  $hasOperations,
  fetchCacheData,
  applyCache,
  closeAddChildModal,
  closeValueModal,
  openAddChildModal,
  openValueModal,
  removeFromCache,
  resetCacheData,
  saveChildNode,
  saveNodeValue,
  selectCacheNode,
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
  } = useUnit({
    cacheNodes: $cache,
    selectedNodeId: $selectedCacheNode,
    selectedNode: $selectedNode,
    isValueModalOpen: $isValueModalOpen,
    isAddChildModalOpen: $isAddChildModalOpen,
    isLoading: $isLoading,
    hasOperations: $hasOperations,
  });

  useEffect(() => {
    fetchCacheData();
  }, []);

  const toolbarActions: ActionBarAction[] = useMemo(
    () => [
      {
        id: 'delete',
        label: 'Удалить',
        icon: '🗑️',
        disabled: !selectedNodeId,
        onClick: () => selectedNodeId && removeFromCache(selectedNodeId),
      },
      {
        id: 'setValue',
        label: 'Задать значение',
        icon: '✏️',
        disabled: !selectedNodeId,
        onClick: openValueModal,
      },
      {
        id: 'addChild',
        label: 'Добавить дочерний',
        icon: '➕',
        disabled: !selectedNodeId,
        onClick: openAddChildModal,
      },
      {
        id: 'save',
        label: 'Сохранить в БД',
        icon: '💾',
        disabled: !hasOperations,
        onClick: applyCache,
      },
      {
        id: 'reset',
        label: 'Сбросить',
        icon: '🔄',
        onClick: resetCacheData,
      },
    ],
    [selectedNodeId, hasOperations],
  );

  return (
    <div className={styles.container}>
      <TreeView
        title="Кэш (с асинхронной загрузкой)"
        nodes={cacheNodes}
        selectedNodeId={selectedNodeId}
        onNodeSelect={selectCacheNode}
        emptyMessage="Кэш пуст"
        isLoading={isLoading}
      >
        <ActionBar actions={toolbarActions} />
      </TreeView>

      <FormModal
        isOpen={isValueModalOpen}
        onClose={closeValueModal}
        onSave={saveNodeValue}
        title={`Задать значение для "${selectedNode?.value || ''}"`}
        inputLabel="Значение:"
        initialValue={selectedNode?.value || ''}
        saveButtonText="Сохранить"
      />

      <FormModal
        isOpen={isAddChildModalOpen}
        onClose={closeAddChildModal}
        onSave={saveChildNode}
        title={`Добавить дочерний элемент в "${selectedNode?.value || ''}"`}
        inputLabel="Название:"
        initialValue=""
        saveButtonText="Добавить"
      />
    </div>
  );
};
