import { eq } from 'drizzle-orm';
import { players } from '../db/schema';
import { db } from '../db';
import { WorldService } from './world_service';
import { EventService } from './event_service';
import { sessionService } from './session_service';
import { NotFoundException } from '../exceptions';
import {
  PlayerStateResponseDto,
  MoveResponseDto,
  GameEventDto,
  PlayerInventoryDto,
} from '../dto/response/player';

export class PlayerService {
  constructor(
    private readonly worldService: WorldService,
    private readonly eventService: EventService,
  ) {}

  async getPlayerState(sessionId: string): Promise<PlayerStateResponseDto> {
    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.sessionId, sessionId))
      .limit(1);

    if (!player) {
      // Создаем нового игрока для сессии
      const session = sessionService.getSession(sessionId);
      if (!session) {
        throw new NotFoundException('Сессия не найдена');
      }

      const newPlayer = {
        sessionId,
        name: `Player_${sessionId.slice(0, 8)}`, // Используем первые 8 символов sessionId
        health: 100,
        maxHealth: 100,
        gold: 100, // Начальное золото
        position: 0,
        cristal: 0,
        steps: 0,
      };

      const [createdPlayer] = await db
        .insert(players)
        .values(newPlayer)
        .returning();

      // Обновляем сессию с ID игрока
      sessionService.updateSession(sessionId, { playerId: createdPlayer.id });

      return this.mapPlayerToResponse(createdPlayer);
    }

    return this.mapPlayerToResponse(player);
  }

  async movePlayer(sessionId: string): Promise<MoveResponseDto> {
    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.sessionId, sessionId))
      .limit(1);

    if (!player) {
      throw new NotFoundException('Игрок не найден');
    }

    const newPosition = player.position + 1;

    // Проверяем, есть ли событие на новой позиции
    const worldEvent = await this.worldService.getEventAtPosition(newPosition);
    const events: GameEventDto[] = [];

    if (worldEvent) {
      // Преобразуем событие мира в GameEventDto
      events.push({
        id: worldEvent.eventId,
        type: worldEvent.type as any,
        title: worldEvent.title,
        description: worldEvent.description,
        imageUrl: worldEvent.imageUrl,
        requiresAction: worldEvent.requiresAction,
        actions: worldEvent.actions as string[],
        rewards: worldEvent.rewards,
      });
    } else {
      // Если нет события на позиции, генерируем случайное событие
      const randomEvents = this.eventService.generateEvents(newPosition);
      events.push(...randomEvents);
    }

    // Обновляем позицию игрока
    await db
      .update(players)
      .set({
        position: newPosition,
        steps: player.steps + 1,
        updatedAt: new Date(),
      })
      .where(eq(players.id, player.id));

    // Получаем обновленное состояние игрока
    const [updatedPlayer] = await db
      .select()
      .from(players)
      .where(eq(players.id, player.id))
      .limit(1);

    return {
      newPosition,
      events,
      playerState: this.mapPlayerToResponse(updatedPlayer),
    };
  }

  async getPlayerInventory(sessionId: string): Promise<PlayerInventoryDto> {
    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.sessionId, sessionId))
      .limit(1);

    if (!player) {
      throw new NotFoundException('Игрок не найден');
    }

    // Возвращаем инвентарь из JSON поля или пустой объект
    return (
      (player.inventory as PlayerInventoryDto) || {
        house: null,
        vehicle: null,
        insurance: [],
        card: [],
        deposit: [],
        loan: [],
      }
    );
  }

  async addItemToInventory(
    sessionId: string,
    category: keyof PlayerInventoryDto,
    item: any,
  ): Promise<void> {
    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.sessionId, sessionId))
      .limit(1);

    if (!player) {
      throw new NotFoundException('Игрок не найден');
    }

    const currentInventory = (player.inventory as PlayerInventoryDto) || {};

    // Инициализируем категорию если её нет
    if (!currentInventory[category]) {
      currentInventory[category] = [];
    }

    // Добавляем предмет в категорию
    currentInventory[category]!.push(item);

    // Обновляем инвентарь в базе данных
    await db
      .update(players)
      .set({
        inventory: currentInventory,
        updatedAt: new Date(),
      })
      .where(eq(players.id, player.id));
  }

  async removeItemFromInventory(
    sessionId: string,
    category: keyof PlayerInventoryDto,
    itemId: string,
  ): Promise<void> {
    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.sessionId, sessionId))
      .limit(1);

    if (!player) {
      throw new NotFoundException('Игрок не найден');
    }

    const currentInventory = (player.inventory as PlayerInventoryDto) || {};

    if (currentInventory[category]) {
      // Удаляем предмет по ID
      (currentInventory[category] as any[]) = currentInventory[
        category
      ]!.filter((item) => item.id !== itemId);
    }

    // Обновляем инвентарь в базе данных
    await db
      .update(players)
      .set({
        inventory: currentInventory,
        updatedAt: new Date(),
      })
      .where(eq(players.id, player.id));
  }

  private mapPlayerToResponse(player: any): PlayerStateResponseDto {
    return {
      id: player.id,
      name: player.name,
      health: player.health,
      maxHealth: player.maxHealth,
      gold: player.gold,
      position: player.position,
      cristal: player.cristal,
      steps: player.steps,
      updatedAt: player.updatedAt.toISOString(),
    };
  }
}
