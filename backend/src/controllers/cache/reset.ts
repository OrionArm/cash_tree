import { container } from 'tsyringe';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CacheService, DatabaseService } from '../../services';
import { HTTP_STATUS } from '../../constants/http';

export const resetCacheHandler = async (
  _req: FastifyRequest,
  res: FastifyReply,
) => {
  const cacheService = container.resolve(CacheService);
  const databaseService = container.resolve(DatabaseService);

  cacheService.clear();
  await databaseService.reset();

  res.code(HTTP_STATUS.OK).send({
    success: true,
    message: 'Кэш и база данных успешно сброшены',
  });
};
