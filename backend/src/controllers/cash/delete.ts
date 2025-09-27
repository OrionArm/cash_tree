import { FastifyReply, FastifyRequest } from 'fastify';
import { cacheService } from '../../services/cash';
import { DeleteElementRequest } from '../../dto/request/element';
import { OperationResultResponse } from '../../dto/response/note';

export const deleteCashHandler = async (
  req: FastifyRequest<{ Body: DeleteElementRequest }>,
  res: FastifyReply,
) => {
  try {
    const { elementId } = req.body;

    if (!elementId) {
      const errorResponse: OperationResultResponse = {
        success: false,
        message: 'ID элемента обязателен',
        error: 'MISSING_ELEMENT_ID',
      };
      return res.code(400).send(errorResponse);
    }

    const element = cacheService.getElement(elementId);
    if (!element) {
      const errorResponse: OperationResultResponse = {
        success: false,
        message: 'Элемент не найден в кэше',
        error: 'ELEMENT_NOT_FOUND',
      };
      return res.code(404).send(errorResponse);
    }

    if (element.isDeleted) {
      const errorResponse: OperationResultResponse = {
        success: false,
        message: 'Элемент уже удален',
        error: 'ELEMENT_ALREADY_DELETED',
      };
      return res.code(400).send(errorResponse);
    }

    const success = cacheService.deleteElement(elementId);

    if (!success) {
      const errorResponse: OperationResultResponse = {
        success: false,
        message: 'Не удалось удалить элемент',
        error: 'DELETE_FAILED',
      };
      return res.code(500).send(errorResponse);
    }

    const successResponse: OperationResultResponse = {
      success: true,
      message: 'Элемент успешно удален из кэша',
    };
    res.code(200).send(successResponse);
  } catch (err) {
    console.error('Ошибка удаления элемента из кэша:', err);
    const errorResponse: OperationResultResponse = {
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: 'INTERNAL_SERVER_ERROR',
    };
    res.code(500).send(errorResponse);
  }
};
