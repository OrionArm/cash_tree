import type {
  ClientPlayerService,
  PlayerStateResponseDto,
  DialogEffects,
} from '../client_player_service';

import type {
  DialogChoiceResponseDto,
  DialogNode,
  DialogOption,
  Encounter,
  EncounterEvent,
  StepEvent,
  WorldStateResponseDto,
  HappenedEffects,
} from './type';
import { stepData } from './mock/step_data';
import { dialogData } from './mock/dialog_data';
import { applyDialogEffectsToState, checkEventConditions, selectWeightedEvent } from './utils';
import { encounterData } from './mock/encounters_data';
import { mockItems } from './mock/item_data';
import type { ItemId, Item } from './mock/item_data';

export class EventService {
  private encounterEvents: EncounterEvent[] = [];
  // private completedEncounterEvents: EncounterEvent[] = [];
  private readonly WORLD_LENGTH = 50;
  private playerService: ClientPlayerService;
  private availableStepEvents: StepEvent[] = [];
  private completedStepEvents: StepEvent[] = [];
  private sessionId: string;

  constructor(playerService: ClientPlayerService) {
    this.playerService = playerService;
    this.sessionId = playerService.getSessionId();
    this.encounterEvents = [...encounterData];
    this.loadEventsFromStorage();
  }

  private getEventsStorageKey(): string {
    return `events_${this.sessionId}`;
  }

  private loadEventsFromStorage(): void {
    try {
      const savedData = localStorage.getItem(this.getEventsStorageKey());
      if (savedData) {
        const parsed = JSON.parse(savedData);
        this.availableStepEvents = parsed.availableStepEvents || [...stepData];
        this.completedStepEvents = parsed.completedStepEvents || [];
      } else {
        this.availableStepEvents = [...stepData];
        this.completedStepEvents = [];
      }
    } catch (error) {
      console.error('Ошибка загрузки событий из localStorage:', error);
      this.availableStepEvents = [...stepData];
      this.completedStepEvents = [];
    }
  }

  private saveEventsToStorage(): void {
    try {
      const dataToSave = {
        availableStepEvents: this.availableStepEvents,
        completedStepEvents: this.completedStepEvents,
      };
      localStorage.setItem(this.getEventsStorageKey(), JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Ошибка сохранения событий в localStorage:', error);
    }
  }

  private filterDialogOptions(
    dialog: DialogNode,
    currentState: PlayerStateResponseDto,
  ): DialogNode {
    if (!dialog || !dialog.options) {
      return dialog;
    }

    const playerItemIds = currentState.items.map((item) => item.id);

    const filteredOptions = dialog.options.filter((option) => {
      if (!option.requires) return true;

      return playerItemIds.includes(option.requires as ItemId);
    });

    return {
      ...dialog,
      options: filteredOptions,
    };
  }

  private async applyDialogEffects(
    effects: Partial<DialogEffects>,
    playerState: PlayerStateResponseDto,
  ): Promise<PlayerStateResponseDto> {
    try {
      const state = applyDialogEffectsToState(playerState, effects);
      const newState = await this.playerService.savePlayerState(state);
      console.log('Эффекты диалога применены:', effects);
      return newState;
    } catch (error) {
      console.error('Ошибка применения эффектов диалога:', error);
      return playerState;
    }
  }

  private convertItemIdsToItems(itemIds: ItemId[] | undefined): Item[] {
    if (!itemIds) return [];
    return itemIds
      .map((id) => mockItems.find((item) => item.id === id))
      .filter((item): item is Item => item !== undefined);
  }

  private createHappenedEffects(
    effects: Partial<DialogEffects> | undefined,
  ): HappenedEffects | undefined {
    if (!effects) return undefined;

    const health = effects.health || 0;
    const gold = effects.gold || 0;
    const cristal = effects.cristal || 0;
    const note = effects.note || '';
    const itemsGain = this.convertItemIdsToItems(effects.itemsGain);
    const itemsLose = this.convertItemIdsToItems(effects.itemsLose);

    if (
      health === 0 &&
      gold === 0 &&
      cristal === 0 &&
      note === '' &&
      itemsGain.length === 0 &&
      itemsLose.length === 0
    ) {
      return undefined;
    }

    return {
      health,
      gold,
      cristal,
      note,
      itemsGain,
      itemsLose,
    };
  }

  private async processDialogChoice(
    dialogId: string,
    optionId: string,
    eventType: 'encounter' | 'step',
  ): Promise<DialogChoiceResponseDto> {
    const playerState = await this.playerService.getPlayerState();
    let event: EncounterEvent | StepEvent | undefined;
    if (eventType === 'encounter') {
      event = this.encounterEvents.find((e) => e.position === playerState.position);
    } else {
      event = this.completedStepEvents.find((e) => e.eventId === dialogId);
    }

    if (eventType === 'encounter') {
      const dialog = dialogData[dialogId];
      if (!dialog) {
        return { isDialogComplete: true };
      }

      const option = dialog.options.find((o: DialogOption) => o.id === optionId);
      if (!option) {
        return { isDialogComplete: true };
      }

      let newState: PlayerStateResponseDto | undefined;
      if (option.effects) {
        newState = await this.applyDialogEffects(option.effects, playerState);
      }

      const happenedEffects = this.createHappenedEffects(option.effects);

      if (option.nextDialogId) {
        const nextDialog = dialogData[option.nextDialogId];
        if (nextDialog) {
          const filteredNextDialog = this.filterDialogOptions(nextDialog, newState || playerState);
          return {
            nextDialog: filteredNextDialog,
            newState,
            isDialogComplete: false,
            happenedEffects,
          };
        }
      }

      return {
        newState,
        isDialogComplete: true,
        happenedEffects,
      };
    }

    const stepEvent = event as StepEvent;
    if (!stepEvent?.dialog) {
      return { isDialogComplete: true };
    }

    const dialog = stepEvent.dialog;
    if (!dialog) {
      return { isDialogComplete: true };
    }

    const option = dialog.options.find((o: DialogOption) => o.id === optionId);
    if (!option) {
      return { isDialogComplete: true };
    }

    let newState: PlayerStateResponseDto | undefined;
    if (option.effects) {
      newState = await this.applyDialogEffects(option.effects, playerState);
    }

    const happenedEffects = this.createHappenedEffects(option.effects);

    if (option.nextDialogId) {
      const nextDialog = dialogData[option.nextDialogId];
      if (nextDialog) {
        const filteredNextDialog = this.filterDialogOptions(nextDialog, newState || playerState);
        return {
          nextDialog: filteredNextDialog,
          newState,
          isDialogComplete: false,
          happenedEffects,
        };
      }
    }

    return {
      newState,
      isDialogComplete: true,
      happenedEffects,
    };
  }

  async processEncounterDialogChoice(
    dialogId: string,
    optionId: string,
  ): Promise<DialogChoiceResponseDto> {
    return this.processDialogChoice(dialogId, optionId, 'encounter');
  }

  async processStepDialogChoice(
    dialogId: string,
    optionId: string,
  ): Promise<DialogChoiceResponseDto> {
    return this.processDialogChoice(dialogId, optionId, 'step');
  }

  async getEncounterEvent(position: number): Promise<EncounterEvent | null> {
    const encounterEvent = this.encounterEvents.find((event) => event.position === position);
    if (!encounterEvent) return null;

    // this.moveEncounterEventToCompleted(encounterEvent);

    return encounterEvent;
  }

  async getEncounterState(): Promise<WorldStateResponseDto> {
    const encounters: Encounter[] = this.encounterEvents.map((event) => ({
      id: event.eventId,
      x: event.position,
      type: event.type,
      resolved: false,
      title: event.title,
      description: event.description,
      imageUrl: event.imageUrl,
    }));

    return {
      encounters,
      worldLength: this.WORLD_LENGTH,
    };
  }

  getStepEvent(playerState: PlayerStateResponseDto): StepEvent | null {
    const eligibleEvents = this.availableStepEvents.filter((event) =>
      checkEventConditions(
        event.conditions,
        playerState,
        this.completedStepEvents.map((e) => e.eventId),
      ),
    );

    if (eligibleEvents.length === 0) return null;

    const selectedEvent = selectWeightedEvent(eligibleEvents);

    if (!selectedEvent) return null;

    this.moveStepEventToCompleted(selectedEvent);

    return selectedEvent;
  }

  private moveStepEventToCompleted(event: StepEvent): void {
    const availableIndex = this.availableStepEvents.findIndex((e) => e.eventId === event.eventId);
    if (availableIndex !== -1) {
      this.availableStepEvents.splice(availableIndex, 1);
    }

    this.completedStepEvents.push(event);
    this.saveEventsToStorage();
  }

  // private moveEncounterEventToCompleted(event: EncounterEvent): void {
  //   const availableIndex = this.encounterEvents.findIndex((e) => e.eventId === event.eventId);
  //   if (availableIndex !== -1) {
  //     this.encounterEvents.splice(availableIndex, 1);
  //   }

  //   this.completedEncounterEvents.push(event);
  // }

  resetEventStates(): void {
    this.encounterEvents = [...encounterData];
    // this.completedEncounterEvents = [];
    this.availableStepEvents = [...stepData];
    this.completedStepEvents = [];
    localStorage.removeItem(this.getEventsStorageKey());
  }
}
