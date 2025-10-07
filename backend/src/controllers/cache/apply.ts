import { container } from 'tsyringe';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CacheService, DatabaseService } from '../../services';
import { HTTP_STATUS } from '../../constants/http';

export const applyCacheHandler = async (
  _req: FastifyRequest,
  res: FastifyReply,
) => {
  const cacheService = container.resolve(CacheService);
  const databaseService = container.resolve(DatabaseService);
  const response = await cacheService.applyOperations(databaseService);
  res.code(HTTP_STATUS.OK).send(response);
};
