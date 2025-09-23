import { FastifyReply, FastifyRequest } from 'fastify';
import { MoveResponseDto } from '../../dto/response/player';
import { PlayerService, worldService, eventService } from '../../services';

export const movePlayerHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
): Promise<MoveResponseDto> => {
  try {
    const sessionId = req.sessionId;
    const playerService = new PlayerService(worldService, eventService);
    const result = await playerService.movePlayer(sessionId);

    return res.code(200).send(result);
  } catch (err) {
    console.error('Ошибка при перемещении игрока:', err);
    return res.code(500).send({
      message: 'Внутренняя ошибка сервера',
    } as any);
  }
};
