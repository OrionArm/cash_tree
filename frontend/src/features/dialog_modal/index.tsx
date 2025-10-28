import Modal from '@/shared/ui/modal';
import styles from './dialog_modal.module.css';
import EffectsModal from './effects_modal';
import type { DialogNode, DialogOption, EncounterAction } from '@/services';
import type { EncounterInfo, HappenedEffects } from '@/services/events/type';

type Props = {
  showDialog: boolean;
  dialog: DialogNode | null;
  currentEncounter: EncounterInfo | null;
  effectsResult: HappenedEffects | undefined;
  onSelectOption: (optionId: string) => void;
  onSelect: (action: EncounterAction) => void;
  onClose: () => void;
  onCloseEffects: () => void;
};

export default function DialogModal({
  dialog,
  showDialog,
  currentEncounter,
  effectsResult,
  onSelectOption,
  onSelect,
  onClose,
  onCloseEffects,
}: Props) {
  const isEffectsOpen = Boolean(effectsResult);
  const isOpen = !isEffectsOpen && (Boolean(currentEncounter) || Boolean(dialog));
  const handleOptionClick = (option: DialogOption) => () => onSelectOption(option.id);
  const handleSelect = (action: EncounterAction) => () => onSelect(action);

  const getActionText = (action: EncounterAction): string => {
    const actionTexts: Record<EncounterAction, string> = {
      talk: 'Поговорить',
      fight: 'Сразиться',
      flee: 'Убежать',
      loot: 'Взять',
      trade: 'Торговать',
      ignore: 'Игнорировать',
    };
    return actionTexts[action] || action;
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
        <div className={styles.dialog}>
          {((dialog && showDialog) || (dialog && !currentEncounter)) && (
            <>
              <div className={styles.speaker}>{dialog.speaker}</div>
              <div className={styles.text}>{dialog.text}</div>
              <div className={styles.options}>
                {dialog.options.length > 0 ? (
                  dialog.options.map((option) => (
                    <button
                      key={option.id}
                      className={styles.option}
                      onClick={handleOptionClick(option)}
                    >
                      {option.text}
                    </button>
                  ))
                ) : (
                  <button className={styles.option} onClick={() => onSelectOption('ignore')}>
                    Игнорировать
                  </button>
                )}
              </div>
            </>
          )}

          {currentEncounter && !showDialog && (
            <>
              <div className={styles.speaker}>{currentEncounter.title}</div>
              <div className={styles.text}>{currentEncounter.description}</div>
              <div className={styles.actions}>
                {currentEncounter.type === 'npc_encounter' && (
                  <>
                    <button onClick={handleSelect('talk')} className={styles.option}>
                      {getActionText('talk')}
                    </button>
                    <button onClick={handleSelect('flee')} className={styles.option}>
                      {getActionText('ignore')}
                    </button>
                  </>
                )}
                {currentEncounter.type === 'shop' && (
                  <>
                    <button onClick={handleSelect('trade')} className={styles.option}>
                      {getActionText('trade')}
                    </button>
                    <button onClick={handleSelect('flee')} className={styles.option}>
                      {getActionText('ignore')}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>

      <EffectsModal isOpen={isEffectsOpen} effectsResult={effectsResult} onClose={onCloseEffects} />
    </>
  );
}
