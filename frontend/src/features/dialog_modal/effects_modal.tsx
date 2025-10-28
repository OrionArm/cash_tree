import Modal from '@/shared/ui/modal';
import styles from './dialog_modal.module.css';
import type { HappenedEffects } from '@/services/events/type';
import ResourceChanges from './resource_changes';
import ItemsSection from './items_section';

type Props = {
  isOpen: boolean;
  effectsResult: HappenedEffects | undefined;
  onClose: () => void;
};

export default function EffectsModal({ isOpen, effectsResult, onClose }: Props) {
  if (!isOpen || !effectsResult) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <div className={styles.dialog}>
        <div className={styles.speaker}>Результат</div>
        {effectsResult.note && <div className={styles.text}>{effectsResult.note}</div>}

        <div className={styles.effectsDetails}>
          <ItemsSection items={effectsResult.itemsGain} title="Получены предметы:" />

          <ItemsSection items={effectsResult.itemsLose} title="Потеряны предметы:" />
        </div>

        <ResourceChanges
          health={effectsResult.health}
          gold={effectsResult.gold}
          cristal={effectsResult.cristal}
        />

        <div className={styles.options}>
          <button className={`${styles.option} ${styles.okButton}`} onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </Modal>
  );
}
