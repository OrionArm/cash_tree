import { EventService } from './events/event_service';
import { dialogData } from './events/mock/dialog_data';
import type { Item, ItemId } from './events/mock/item_data';
import { type DialogNode, type EncounterInfo } from './events/type';
import { ShopService } from './shop_service';

type PlayerFlags = Record<FlagName, boolean>;

export type PlayerStateResponseDto = Points & {
  id: number;
  name: string;
  maxHealth: number;
  position: number;
  updatedAt: string;
  items: Item[];
  flags: PlayerFlags;
};

export type FlagName =
  | 'friendFact'
  | 'friendContactVerified'
  | 'friendScamConfirmed'
  | 'friendScamSuspected'
  | 'friendScamBlockPrep';

export type Points = {
  cristal: number;
  gold: number;
  health: number;
  energy: number;
};

export type DialogEffects = Points & {
  note: string;
  prize: object;
  itemsGain: ItemId[];
  itemsLose: ItemId[];
  flagsSet: FlagName[];
  flagsUnset: FlagName[];
};

export interface MoveResponseDto {
  dialog: DialogNode;
  playerState: PlayerStateResponseDto;
  encounter?: EncounterInfo;
}

const MAX_POSITION = 36;
const ENERGY_COST_PER_STEP = 6;
const ENERGY_REGENERATION_RATE = 1;
const ENERGY_MAX = 200;

export class ClientPlayerService {
  private sessionId: string;
  private eventService: EventService;
  private shopService: ShopService;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.eventService = new EventService(this);
    this.shopService = new ShopService(this);
  }

  getSessionId(): string {
    return this.sessionId;
  }

  private calculateEnergyRegeneration(playerState: PlayerStateResponseDto): PlayerStateResponseDto {
    const lastUpdate = new Date(playerState.updatedAt);
    const now = new Date();
    const timeDiffMs = now.getTime() - lastUpdate.getTime();
    const timeDiffHours = Math.floor(timeDiffMs / (1000 * 60 * 60));

    if (timeDiffHours > 0) {
      const energyToAdd = Math.min(timeDiffHours * ENERGY_REGENERATION_RATE, ENERGY_MAX);
      return {
        ...playerState,
        energy: Math.min(playerState.energy + energyToAdd, ENERGY_MAX),
        updatedAt: now.toISOString(),
      };
    }

    return playerState;
  }

  async getPlayerState(): Promise<PlayerStateResponseDto> {
    const storedData = localStorage.getItem(`player_${this.sessionId}`);

    if (storedData) {
      const playerState = JSON.parse(storedData);
      const updatedState = this.calculateEnergyRegeneration(playerState);

      if (updatedState !== playerState) {
        this.savePlayerState(updatedState);
      }

      return updatedState;
    }

    const newPlayer: PlayerStateResponseDto = {
      id: Date.now(),
      name: `Player_${this.sessionId.slice(0, 8)}`,
      health: 10,
      maxHealth: 10,
      position: 0,
      gold: 100,
      cristal: 0,
      energy: 60,
      updatedAt: new Date().toISOString(),
      items: [],
      flags: {
        friendContactVerified: false,
        friendScamSuspected: false,
        friendScamConfirmed: false,
        friendScamBlockPrep: false,
        friendFact: false,
      },
    };

    this.savePlayerState(newPlayer);
    return newPlayer;
  }

  async getCurrentPosition(): Promise<number> {
    const playerState = await this.getPlayerState();
    return playerState.position;
  }

  private filterDialogOptions(
    dialog: DialogNode | null,
    currentState: PlayerStateResponseDto,
  ): DialogNode | null {
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

  async movePlayer(): Promise<MoveResponseDto> {
    const currentState = await this.getPlayerState();

    if (currentState.position >= MAX_POSITION) {
      throw new Error(
        `Достигнута максимальная позиция (${MAX_POSITION}). Дальше двигаться нельзя.`,
      );
    }

    const newPosition = currentState.position + 1;
    const encounterAtPosition = await this.eventService.getEncounterEvent(newPosition);
    const updatedState: PlayerStateResponseDto = {
      ...currentState,
      position: newPosition,
      energy: Math.max(0, currentState.energy - ENERGY_COST_PER_STEP),
      updatedAt: new Date().toISOString(),
    };
    this.savePlayerState(updatedState);

    let dialog: DialogNode | null = null;
    if (encounterAtPosition) {
      dialog = dialogData[encounterAtPosition.dialogId];
      dialog = this.filterDialogOptions(dialog, currentState);

      return {
        dialog: dialog!,
        playerState: updatedState,
        encounter: {
          type: encounterAtPosition.type,
          title: encounterAtPosition.title,
          description: encounterAtPosition.description,
        },
      };
    } else {
      const event = this.eventService.getStepEvent(currentState);
      const rawDialog = event?.dialog || null;
      dialog = this.filterDialogOptions(rawDialog, currentState);

      return {
        dialog: dialog!,
        playerState: updatedState,
      };
    }
  }

  savePlayerState(state: PlayerStateResponseDto): PlayerStateResponseDto {
    localStorage.setItem(`player_${this.sessionId}`, JSON.stringify(state));
    return state;
  }

  async getEncounterState() {
    return this.eventService.getEncounterState();
  }

  async processEncounterDialogChoice(dialogId: string, optionId: string) {
    return this.eventService.processEncounterDialogChoice(dialogId, optionId);
  }

  async processStepDialogChoice(dialogId: string, optionId: string) {
    return this.eventService.processStepDialogChoice(dialogId, optionId);
  }

  private getLogsKey(): string {
    return `player_logs_${this.sessionId}`;
  }

  async addLogMessage(message: string): Promise<void> {
    const logs = await this.getLogs();
    logs.push({
      message,
      timestamp: new Date().toISOString(),
    });

    const maxLogs = 100;
    if (logs.length > maxLogs) {
      logs.splice(0, logs.length - maxLogs);
    }

    localStorage.setItem(this.getLogsKey(), JSON.stringify(logs));
  }

  async getLogs(limit?: number): Promise<Array<{ message: string; timestamp: string }>> {
    const logsData = localStorage.getItem(this.getLogsKey());
    let logs: Array<{ message: string; timestamp: string }> = [];

    if (logsData) {
      try {
        logs = JSON.parse(logsData);
      } catch (error) {
        console.error('Ошибка парсинга логов:', error);
        logs = [];
      }
    }

    if (limit && limit > 0) {
      return logs.slice(-limit);
    }

    return logs;
  }

  async clearLogs(): Promise<void> {
    localStorage.removeItem(this.getLogsKey());
  }

  async resetPlayerState(): Promise<void> {
    localStorage.removeItem(`player_${this.sessionId}`);
    await this.clearLogs();
    this.eventService.resetEventStates();
    this.shopService.resetAvailableItems();
  }

  resetEventStates(): void {
    this.eventService.resetEventStates();
  }
}
