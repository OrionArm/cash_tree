import { container } from 'tsyringe';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CacheService, DatabaseService } from '../../services';
import { LoadElementType } from '../../dto/request/cache.schemas';
import { NotFoundError } from '../../errors/http-errors';
import { HTTP_STATUS } from '../../constants/http';
import { ERROR_CODES } from '../../constants/error-codes';

export const loadCacheHandler = async (
  req: FastifyRequest<{ Body: LoadElementType }>,
  res: FastifyReply,
) => {
  const cacheService = container.resolve(CacheService);
  const databaseService = container.resolve(DatabaseService);
  const { elementId } = req.body;

  const result = await cacheService.loadElement(databaseService, elementId);

  if (!result.success) {
    throw new NotFoundError(result.message, ERROR_CODES.ELEMENT_NOT_FOUND);
  }

  return res.code(HTTP_STATUS.OK).send({
    success: true,
    message: result.message,
  });
};
