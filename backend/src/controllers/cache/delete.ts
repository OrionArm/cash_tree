import { container } from 'tsyringe';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CacheService } from '../../services';
import { DeleteElementType } from '../../dto/request/cache.schemas';
import {
  BadRequestError,
  NotFoundError,
  InternalServerError,
} from '../../errors/http-errors';
import { HTTP_STATUS } from '../../constants/http';
import { ERROR_CODES } from '../../constants/error-codes';

export const deleteCacheHandler = async (
  req: FastifyRequest<{ Body: DeleteElementType }>,
  res: FastifyReply,
) => {
  const cacheService = container.resolve(CacheService);
  const { elementId } = req.body;

  const element = cacheService.getElement(elementId);
  if (!element) {
    throw new NotFoundError(
      'Элемент не найден в кэше',
      ERROR_CODES.ELEMENT_NOT_FOUND,
    );
  }

  if (element.isDeleted) {
    throw new BadRequestError(
      'Элемент уже удален',
      ERROR_CODES.ELEMENT_ALREADY_DELETED,
    );
  }

  const success = cacheService.deleteElement(elementId);

  if (!success) {
    throw new InternalServerError(
      'Не удалось удалить элемент',
      ERROR_CODES.DELETE_FAILED,
    );
  }

  res.code(HTTP_STATUS.OK).send({
    success: true,
    message: 'Элемент успешно удален из кэша',
  });
};
