import { useState, useCallback } from 'react';
import type { DialogNode } from '@/services';
import type { PlayerStateResponseDto } from '@/services/client_player_service';
import {
  processEncounterDialogChoice,
  processStepDialogChoice,
  addLogMessage,
} from '../../shared/local_api';
import type {
  DialogChoiceResponseDto,
  EncounterAction,
  EncounterInfo,
  HappenedEffects,
} from '@/services/events/type';
import { formatRewardsMessageWithNames } from '@/services/events/utils';

type Props = {
  currentEncounter: EncounterInfo | null;
  currentDialog: DialogNode | null;
  setCurrentDialog: (dialog: DialogNode | null) => void;
  setCurrentEncounter: (encounter: EncounterInfo | null) => void;
  setLog: React.Dispatch<React.SetStateAction<string[]>>;
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerStateResponseDto | null>>;
  setEffectsResult: React.Dispatch<React.SetStateAction<HappenedEffects | undefined>>;
};

export function useDialog({
  currentEncounter,
  currentDialog,
  setCurrentDialog,
  setCurrentEncounter,
  setLog,
  setPlayerState,
  setEffectsResult,
}: Props) {
  const [showDialog, setShowDialog] = useState(false);
  const [pendingNextDialog, setPendingNextDialog] = useState<DialogNode | null>(null);

  const closeDialog = useCallback(() => {
    setCurrentDialog(null);
    setCurrentEncounter(null);
    setShowDialog(false);
    setPendingNextDialog(null);
  }, [setCurrentDialog, setCurrentEncounter]);

  const selectDialogOption = useCallback(
    async (optionId: string, onDialogComplete: () => void) => {
      if (!currentDialog) return;

      try {
        let result: DialogChoiceResponseDto | undefined = undefined;

        if (currentEncounter) {
          result = await processEncounterDialogChoice(currentDialog.id, optionId);
        } else {
          result = await processStepDialogChoice(currentDialog.id, optionId);
        }
        if (result) {
          if (result.happenedEffects) {
            const dialogEffects = {
              ...result.happenedEffects,
              itemsGain: result.happenedEffects.itemsGain.map((item) => item.name),
              itemsLose: result.happenedEffects.itemsLose.map((item) => item.name),
            };

            const effectsMessage = formatRewardsMessageWithNames(dialogEffects);
            setLog((prev) => [...prev, effectsMessage]);
            setEffectsResult(result.happenedEffects);
            addLogMessage(effectsMessage);
          }

          if (result.newState) {
            setPlayerState(result.newState);
          }

          if (result.nextDialog) {
            if (result.happenedEffects) {
              setPendingNextDialog(result.nextDialog);
            } else {
              setCurrentDialog(result.nextDialog);
            }
          } else {
            closeDialog();
            onDialogComplete();
          }
        } else {
          closeDialog();
          onDialogComplete();
        }
      } catch (error) {
        const message = `Ошибка обработки диалога: ${error}`;
        setLog((prev) => [...prev, message]);
        closeDialog();
        onDialogComplete();
      }
    },
    [
      currentDialog,
      currentEncounter,
      setLog,
      setPlayerState,
      closeDialog,
      setCurrentDialog,
      setEffectsResult,
    ],
  );

  const handleDialogOption = useCallback(
    async (optionId: string) => {
      await selectDialogOption(optionId, () => {});
    },
    [selectDialogOption],
  );

  const handleCloseDialog = useCallback(() => {
    closeDialog();
  }, [closeDialog]);

  const handleCloseEffectsModal = useCallback(() => {
    setEffectsResult(undefined);

    if (pendingNextDialog) {
      setCurrentDialog(pendingNextDialog);
      setPendingNextDialog(null);
    }
  }, [pendingNextDialog, setCurrentDialog, setEffectsResult]);

  const resolveEncounter = useCallback(
    async (action: EncounterAction) => {
      if (action === 'talk') {
        setShowDialog(true);
      } else {
        setCurrentDialog(null);
        setCurrentEncounter(null);
        setShowDialog(false);
      }
    },
    [setCurrentDialog, setCurrentEncounter],
  );

  return {
    currentDialog,
    showDialog,
    handleDialogOption,
    handleCloseDialog,
    handleCloseEffectsModal,
    resolveEncounter,
  };
}
