import type { EncounterType } from '@/shared/use_game';
import Modal from '@/shared/ui/modal';
import styles from './encounter_modal.module.css';
import Chest from '../chest';

type Encounter = {
  title: string;
  description: string;
  type: EncounterType;
};

type Props = {
  encounter: Encounter | null;
  onSelect: (action: 'talk' | 'fight' | 'open' | 'ignore') => void;
};

export default function EncounterModal({ encounter, onSelect }: Props) {
  if (!encounter) return null;

  const handleSelect = (action: 'talk' | 'fight' | 'open' | 'ignore') => () => onSelect(action);

  const handleIgnore = () => onSelect('ignore');

  if (encounter.type === 'chest')
    return (
      <Modal isOpen onClose={handleIgnore}>
        <Chest onClose={() => handleIgnore()} description={encounter.description} />
      </Modal>
    );

  return (
    <Modal isOpen>
      <div className={styles.title}>{encounter.title}</div>
      <div className={styles.desc}>{encounter.description}</div>
      <div className={styles.actions}>
        {encounter.type === 'npc' && (
          <>
            <button onClick={handleSelect('talk')}>Поговорить</button>
            <button onClick={handleIgnore}>Игнорировать</button>
          </>
        )}
        {encounter.type === 'monster' && (
          <>
            <button onClick={handleSelect('fight')}>Сразиться</button>
            <button onClick={handleIgnore}>Отойти</button>
          </>
        )}
      </div>
    </Modal>
  );
}
