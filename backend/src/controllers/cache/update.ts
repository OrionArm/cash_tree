import { container } from 'tsyringe';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CacheService } from '../../services';
import { UpdateElementType } from '../../dto/request/cache.schemas';
import {
  BadRequestError,
  NotFoundError,
  InternalServerError,
} from '../../errors/http-errors';
import { HTTP_STATUS } from '../../constants/http';
import { ERROR_CODES } from '../../constants/error-codes';

export const updateCacheHandler = async (
  req: FastifyRequest<{ Body: UpdateElementType }>,
  res: FastifyReply,
) => {
  const cacheService = container.resolve(CacheService);
  const { elementId, value } = req.body;

  const element = cacheService.getElement(elementId);
  if (!element) {
    throw new NotFoundError(
      'Элемент не найден в кэше',
      ERROR_CODES.ELEMENT_NOT_FOUND,
    );
  }

  if (element.isDeleted) {
    throw new BadRequestError(
      'Элемент удален и не может быть обновлен',
      ERROR_CODES.ELEMENT_DELETED,
    );
  }

  const success = cacheService.updateElement(elementId, value);

  if (!success) {
    throw new InternalServerError(
      'Не удалось обновить элемент',
      ERROR_CODES.UPDATE_FAILED,
    );
  }

  const updatedElement = cacheService.getElement(elementId);

  res.code(HTTP_STATUS.OK).send({
    success: true,
    message: 'Элемент успешно обновлен в кэше',
    element: updatedElement || undefined,
  });
};
