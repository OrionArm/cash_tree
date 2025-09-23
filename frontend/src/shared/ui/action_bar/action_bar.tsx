import React from 'react';
import clsx from 'clsx';
import styles from './action_bar.module.css';
import { Button } from '@/shared/ui/button';

export type ActionBarAction = {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
};

type Props = {
  actions: ActionBarAction[];
};

export const ActionBar: React.FC<Props> = ({ actions }) => {
  return (
    <div className={styles.toolbarActions}>
      {actions.map((action) => {
        let variant: 'primary' | 'secondary' | 'danger' = 'secondary';
        if (action.id === 'load') {
          variant = 'primary';
        } else if (action.id === 'delete') {
          variant = 'danger';
        } else if (action.variant) {
          variant = action.variant;
        }

        return (
          <Button
            key={action.id}
            onClick={action.onClick}
            disabled={action.disabled}
            variant={variant}
            mode="compact"
            icon={action.icon}
            className={clsx(styles.compact, { [styles.disabled]: action.disabled })}
            title={action.label}
          >
            {action.label}
          </Button>
        );
      })}
    </div>
  );
};
