import { FastifyReply, FastifyRequest } from 'fastify';
import { cacheService } from '../../services/cash';
import { UpdateElementRequest } from '../../dto/request/element';
import { OperationResultResponse } from '../../dto/response/note';

export const updateCashHandler = async (
  req: FastifyRequest<{ Body: UpdateElementRequest }>,
  res: FastifyReply,
) => {
  try {
    const { elementId, value } = req.body;

    if (!elementId) {
      const errorResponse: OperationResultResponse = {
        success: false,
        message: 'ID элемента обязателен',
        error: 'MISSING_ELEMENT_ID',
      };
      return res.code(400).send(errorResponse);
    }

    if (!value || value.trim() === '') {
      const errorResponse: OperationResultResponse = {
        success: false,
        message: 'Значение элемента не может быть пустым',
        error: 'EMPTY_VALUE',
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
        message: 'Элемент удален и не может быть обновлен',
        error: 'ELEMENT_DELETED',
      };
      return res.code(400).send(errorResponse);
    }

    const success = cacheService.updateElement(elementId, value);

    if (!success) {
      const errorResponse: OperationResultResponse = {
        success: false,
        message: 'Не удалось обновить элемент',
        error: 'UPDATE_FAILED',
      };
      return res.code(500).send(errorResponse);
    }

    const updatedElement = cacheService.getElement(elementId);

    const successResponse: OperationResultResponse = {
      success: true,
      message: 'Элемент успешно обновлен в кэше',
      element: updatedElement || undefined,
    };
    res.code(200).send(successResponse);
  } catch (err) {
    console.error('Ошибка обновления элемента в кэше:', err);
    const errorResponse: OperationResultResponse = {
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: 'INTERNAL_SERVER_ERROR',
    };
    res.code(500).send(errorResponse);
  }
};
