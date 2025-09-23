export class PlayerStateResponseDto {
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

export class HouseDto {
  id: string;
  name: string;
  value: number;
  location?: string;
  rooms?: number;
}

export class VehicleDto {
  id: string;
  name: string;
  type: 'car' | 'motorcycle' | 'bicycle';
  value: number;
  speed?: number;
  fuel?: number;
}

export class InsuranceDto {
  id: string;
  name: string;
  type: 'property' | 'vehicle' | 'health';
  value: number;
  coverage: number;
  requiresItem?: string; // ID предмета, который страхуется
}

export class CardDto {
  id: string;
  name: string;
  type: 'credit' | 'debit';
  value: number;
  limit?: number;
  balance?: number;
}

export class DepositDto {
  id: string;
  name: string;
  value: number;
  interestRate: number;
  term: number; // в месяцах
  startDate: string;
}

export class LoanDto {
  id: string;
  name: string;
  value: number;
  interestRate: number;
  term: number; // в месяцах
  monthlyPayment: number;
  remainingBalance: number;
}

// Структура инвентаря
export class PlayerInventoryDto {
  house: HouseDto;
  vehicle: VehicleDto;
  insurance: InsuranceDto[];
  card: CardDto[];
  deposit: DepositDto[];
  loan: LoanDto[];
}

// Типы событий
export class GameEventDto {
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

export class MoveResponseDto {
  newPosition: number;
  events: GameEventDto[];
  playerState: PlayerStateResponseDto;
}
