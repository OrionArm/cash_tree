import { FastifyReply, FastifyRequest } from 'fastify';
import { worldService } from '../../services';

export interface WorldStateResponseDto {
  events: Array<{
    position: number;
    eventId: string;
    type: string;
    title: string;
    description: string;
    imageUrl?: string;
    requiresAction: boolean;
    actions?: string[];
    rewards?: any;
  }>;
  worldLength: number;
}

export const getWorldStateHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
): Promise<WorldStateResponseDto> => {
  try {
    // Получаем все события мира
    const worldEvents = worldService.getAllEvents();

    const worldState: WorldStateResponseDto = {
      events: worldEvents.map((event, position) => ({
        position,
        eventId: event.eventId,
        type: event.type,
        title: event.title,
        description: event.description,
        imageUrl: event.imageUrl,
        requiresAction: event.requiresAction,
        actions: event.actions,
        rewards: event.rewards,
      })),
      worldLength: 200,
    };

    return res.code(200).send(worldState);
  } catch (err) {
    console.error('Ошибка при получении состояния мира:', err);
    console.error(
      'Stack trace:',
      err instanceof Error ? err.stack : 'No stack trace',
    );
    return res.code(500).send({
      message: 'Внутренняя ошибка сервера',
      error: err instanceof Error ? err.message : String(err),
    } as any);
  }
};
