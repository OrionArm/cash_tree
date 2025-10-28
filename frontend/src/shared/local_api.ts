import type { DialogChoiceResponseDto, WorldStateResponseDto } from '@/services/events/type';
import { clientGameService } from '../services/client_game_service';
import type { MoveResponseDto, PlayerStateResponseDto } from '@/services/client_player_service';
import { RankingService } from '@/services/ranking_service';
import type { PlayerRanking } from './types';
import type { ShopItem } from '@/services/events/mock/shop_data';
import type { HappenedEffects } from '@/services/events/type';

// GET player/state
export async function fetchPlayerState(): Promise<PlayerStateResponseDto> {
  try {
    return await clientGameService.getPlayerState();
  } catch (error) {
    console.error('Ошибка получения состояния игрока:', error);
    throw new Error('Не удалось получить состояние игрока');
  }
}
// GET player/move
export async function movePlayer(): Promise<MoveResponseDto> {
  try {
    return await clientGameService.movePlayer();
  } catch (error) {
    console.error('Ошибка перемещения игрока:', error);
    throw new Error('Не удалось переместить игрока');
  }
}
// GET world/state
export async function fetchWorldState(): Promise<WorldStateResponseDto> {
  try {
    return await clientGameService.getWorldState();
  } catch (error) {
    console.error('Ошибка получения состояния мира:', error);
    throw new Error('Не удалось получить состояние мира');
  }
}

// POST event/dialog/encounter
export async function processEncounterDialogChoice(
  dialogId: string,
  optionId: string,
): Promise<DialogChoiceResponseDto> {
  try {
    return await clientGameService.processEncounterDialogChoice(dialogId, optionId);
  } catch (error) {
    console.error('Ошибка обработки диалога encounter:', error);
    throw new Error('Не удалось обработать выбор в диалоге encounter');
  }
}

// POST event/dialog/step
export async function processStepDialogChoice(
  dialogId: string,
  optionId: string,
): Promise<DialogChoiceResponseDto> {
  try {
    return await clientGameService.processStepDialogChoice(dialogId, optionId);
  } catch (error) {
    console.error('Ошибка обработки диалога step:', error);
    throw new Error('Не удалось обработать выбор в диалоге step');
  }
}

// GET ranking/players
export async function fetchRankedPlayers(
  currentPlayer?: PlayerStateResponseDto,
): Promise<PlayerRanking[]> {
  try {
    const playerRanking = currentPlayer
      ? {
          id: currentPlayer.id,
          name: currentPlayer.name,
          position: currentPlayer.position,
          gold: currentPlayer.gold,
          cristal: currentPlayer.cristal,
        }
      : undefined;

    return Promise.resolve(RankingService.getRankedPlayers(playerRanking));
  } catch (error) {
    console.error('Ошибка получения рейтинга игроков:', error);
    throw new Error('Не удалось получить рейтинг игроков');
  }
}

// GET ranking/player/rank
export async function fetchPlayerRank(currentPlayer: PlayerStateResponseDto): Promise<number> {
  try {
    const playerRanking = {
      id: currentPlayer.id,
      name: currentPlayer.name,
      position: currentPlayer.position,
      gold: currentPlayer.gold,
      cristal: currentPlayer.cristal,
    };

    const allPlayers = RankingService.getRankedPlayers(playerRanking);
    return Promise.resolve(RankingService.getPlayerRank(playerRanking, allPlayers));
  } catch (error) {
    console.error('Ошибка получения рейтинга игрока:', error);
    throw new Error('Не удалось получить рейтинг игрока');
  }
}

// GET ranking/player/nearby
export async function fetchNearbyPlayers(
  currentPlayer: PlayerStateResponseDto,
  count: number = 2,
): Promise<PlayerRanking[]> {
  try {
    const playerRanking = {
      id: currentPlayer.id,
      name: currentPlayer.name,
      position: currentPlayer.position,
      gold: currentPlayer.gold,
      cristal: currentPlayer.cristal,
    };

    const allPlayers = RankingService.getRankedPlayers(playerRanking);
    return Promise.resolve(RankingService.getNearbyPlayers(playerRanking, allPlayers, count));
  } catch (error) {
    console.error('Ошибка получения соседних игроков:', error);
    throw new Error('Не удалось получить соседних игроков');
  }
}

// Логи
export async function addLogMessage(message: string): Promise<void> {
  try {
    return await clientGameService.addLogMessage(message);
  } catch (error) {
    console.error('Ошибка добавления сообщения в лог:', error);
    throw new Error('Не удалось добавить сообщение в лог');
  }
}

export async function getLogs(
  limit?: number,
): Promise<Array<{ message: string; timestamp: string }>> {
  try {
    return await clientGameService.getLogs(limit);
  } catch (error) {
    console.error('Ошибка получения логов:', error);
    throw new Error('Не удалось получить логи');
  }
}

export async function clearLogs(): Promise<void> {
  try {
    return await clientGameService.clearLogs();
  } catch (error) {
    console.error('Ошибка очистки логов:', error);
    throw new Error('Не удалось очистить логи');
  }
}

// GET player/reset
export async function resetPlayerState(): Promise<void> {
  try {
    return await clientGameService.resetPlayerState();
  } catch (error) {
    console.error('Ошибка сброса состояния игрока:', error);
    throw new Error('Не удалось сбросить состояние игрока');
  }
}

// GET shop/items
export async function fetchShopItems(): Promise<ShopItem[]> {
  try {
    return await clientGameService.getShopItems();
  } catch (error) {
    console.error('Ошибка получения товаров магазина:', error);
    throw new Error('Не удалось получить список товаров магазина');
  }
}

// POST shop/purchase
export async function purchaseShopItem(itemId: string): Promise<{
  success: boolean;
  message: string;
  newState?: PlayerStateResponseDto;
  happenedEffects?: HappenedEffects;
}> {
  try {
    return await clientGameService.purchaseShopItem(itemId);
  } catch (error) {
    console.error('Ошибка покупки товара:', error);
    throw new Error('Не удалось купить товар');
  }
}
