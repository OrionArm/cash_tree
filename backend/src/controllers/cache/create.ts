import { container } from 'tsyringe';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CacheService } from '../../services';
import { CreateElementType } from '../../dto/request/cache.schemas';
import { BadRequestError } from '../../errors/http-errors';
import { HTTP_STATUS } from '../../constants/http';
import { ERROR_CODES } from '../../constants/error-codes';

export const createCacheHandler = async (
  req: FastifyRequest<{ Body: CreateElementType }>,
  res: FastifyReply,
) => {
  const cacheService = container.resolve(CacheService);
  const { parentId, value } = req.body;

  if (parentId) {
    const parentElement = cacheService.getElement(parentId);
    if (!parentElement) {
      throw new BadRequestError(
        'Родительский элемент не найден в кэше',
        ERROR_CODES.PARENT_NOT_IN_CACHE,
      );
    }
  }

  const newElement = cacheService.createElement(parentId ?? null, value);

  res.code(HTTP_STATUS.CREATED).send({
    success: true,
    message: 'Элемент успешно создан в кэше',
    element: newElement,
  });
};
