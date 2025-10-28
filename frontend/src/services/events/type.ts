import type { DialogEffects, FlagName, PlayerStateResponseDto } from '../client_player_service';
import type { Item, ItemId } from './mock/item_data';

export type { Item, ItemId };

export type EncounterAction = 'talk' | 'fight' | 'flee' | 'loot' | 'trade' | 'ignore';

export interface DialogOption {
  id: string;
  nextDialogId?: string;
  text: string;
  requires?: string;
  effects?: Partial<DialogEffects>;
}

export interface DialogNode {
  id: string;
  speaker: string;
  text: string;
  options: DialogOption[];
}

export type HappenedEffects = {
  health: number;
  gold: number;
  cristal: number;
  note: string;
  itemsGain: Item[];
  itemsLose: Item[];
};

export interface DialogChoiceResponseDto {
  nextDialog?: DialogNode;
  newState?: PlayerStateResponseDto;
  isDialogComplete: boolean;
  happenedEffects?: HappenedEffects;
}

export type Encounter = EncounterCoordinates & EncounterInfo;

type EncounterCoordinates = {
  id: string;
  x: number;
  resolved: boolean;
  imageUrl: string;
};
export type EncounterInfo = {
  type: EncounterEventType;
  title: string;
  description: string;
};

type EncounterTopic =
  | 'Соц.инжиниринг/друг'
  | 'Подписки/долгосрочные цели'
  | 'Бюджет/антифрод'
  | 'Партнёры/страхование'
  | 'Платежи/валюта/страховка'
  | 'Партнёры/штрафы/QR';

export type Topic =
  | EncounterTopic
  | 'Антифрод/платежи'
  | 'Подписки/контроль'
  | 'Антифрод/соц.инжиниринг'
  | 'Партнёры/кэшбэк'
  | 'Привычки/энергия'
  | 'Покупки/права'
  | 'Покупки/техника'
  | 'Обучение/дисциплина'
  | 'Досуг/гибкость'
  | 'Антифрод/фишинг'
  | 'Покупки/безопасность'
  | 'Здоровье/ритм'
  | 'Обучение/финансы'
  | 'Маршрут/экономия'
  | 'Бюджет/самоконтроль'
  | 'Цели/сбережения'
  | 'Техника/уход'
  | 'Антифрод/соцсети'
  | 'Привычки/сезоны'
  | 'Права потребителя'
  | 'Энергия/ритм'
  | 'Путешествия/права'
  | 'Навыки/фокус'
  | 'Антифрод/доставка'
  | 'Баланс/ритм'
  | 'Энергия/организация'
  | 'Знания/финансы'
  | 'Путешествия/импульс'
  | 'Покупки/лояльность';

export interface BaseEvent {
  eventId: string;
  title: string;
  description: string;
  imageUrl?: string;
  topic: Topic;
}
export type EncounterEventType = 'npc_encounter' | 'treasure' | 'shop';
export interface EncounterEvent extends BaseEvent {
  type: EncounterEventType;
  position: number;
  dialogId: string;
  imageUrl: string;
}

export type WorldEventType = 'news' | 'disaster' | 'celebration' | 'mystery' | 'opportunity';
export interface WorldEvent extends BaseEvent {
  type: WorldEventType;
}

export type StepEventType = 'StepEvent';

export interface EventConditions {
  requiresFlags?: FlagName[];
  requiresItems?: ItemId[];
  boostIf?: string; // это влияет только на вес
  afterEvents?: string[];
}

export interface StepEvent extends BaseEvent {
  type: StepEventType;
  conditions?: EventConditions;
  weight: number;
  dialog?: DialogNode;
}

export interface WorldStateResponseDto {
  encounters: Encounter[];
  worldLength: number;
}
export type GameEvent = EncounterEvent | WorldEvent | StepEvent;
