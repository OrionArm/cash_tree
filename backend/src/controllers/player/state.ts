import { FastifyReply, FastifyRequest } from 'fastify';
import { PlayerStateResponseDto } from '../../dto/response/player';
import { PlayerService, worldService, eventService } from '../../services';

export const getPlayerStateHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
): Promise<PlayerStateResponseDto> => {
  try {
    const sessionId = req.sessionId;
    
    if (!sessionId) {
      return res.code(400).send({
        message: 'Сессия не найдена',
      } as any);
    }

    const playerService = new PlayerService(worldService, eventService);
    const playerState = await playerService.getPlayerState(sessionId);

    return res.code(200).send(playerState);
  } catch (err) {
    console.error('Ошибка при получении состояния игрока:', err);
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
