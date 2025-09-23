// Типы данных для API
export interface PlayerStateResponseDto {
  id: number;
  name: string;
  health: number;
  maxHealth: number;
  gold: number;
  position: number;
  cristal: number;
  steps: number;
  updatedAt: string;
}

export interface GameEventDto {
  id: string;
  type: 'npc_encounter' | 'treasure' | 'monster' | 'shop' | 'random_event';
  title: string;
  description: string;
  imageUrl?: string;
  requiresAction: boolean;
  actions?: string[];
  rewards?: {
    gold?: number;
    experience?: number;
    items?: any[];
  };
}

export interface MoveResponseDto {
  newPosition: number;
  events: GameEventDto[];
  playerState: PlayerStateResponseDto;
}

export interface WorldEventDto {
  position: number;
  eventId: string;
  type: string;
  title: string;
  description: string;
  imageUrl?: string;
  requiresAction: boolean;
  actions?: string[];
  rewards?: any;
}

export interface WorldStateResponseDto {
  events: WorldEventDto[];
  worldLength: number;
}

// Конфигурация API
const API_BASE_URL = 'http://localhost:3001';

// Функции для работы с API
export async function fetchPlayerState(): Promise<PlayerStateResponseDto> {
  const response = await fetch(`${API_BASE_URL}/api/v1/player/state`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      // TODO: Добавить авторизацию когда будет готова
      // 'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    throw new Error(`Ошибка загрузки состояния игрока: ${response.status}`);
  }

  return response.json();
}

export async function movePlayer(): Promise<MoveResponseDto> {
  const response = await fetch(`${API_BASE_URL}/api/v1/player/move`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      // TODO: Добавить авторизацию когда будет готова
      // 'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    throw new Error(`Ошибка перемещения игрока: ${response.status}`);
  }

  return response.json();
}

export async function fetchWorldState(): Promise<WorldStateResponseDto> {
  const response = await fetch(`${API_BASE_URL}/api/v1/world/state`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      // TODO: Добавить авторизацию когда будет готова
      // 'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    throw new Error(`Ошибка загрузки состояния мира: ${response.status}`);
  }

  return response.json();
}
