import { FastifyReply, FastifyRequest } from 'fastify';
import { cacheService } from '../../services/cash';
import { CreateElementRequest } from '../../dto/request/element';
import { OperationResultResponse } from '../../dto/response/note';

export const createCashHandler = async (
  req: FastifyRequest<{ Body: CreateElementRequest }>,
  res: FastifyReply,
) => {
  try {
    const { parentId, value } = req.body;

    if (!value || value.trim() === '') {
      const errorResponse: OperationResultResponse = {
        success: false,
        message: 'Значение элемента не может быть пустым',
        error: 'EMPTY_VALUE',
      };
      return res.code(400).send(errorResponse);
    }

    if (parentId) {
      const parentElement = cacheService.getElement(parentId);
      if (!parentElement) {
        const errorResponse: OperationResultResponse = {
          success: false,
          message: 'Родительский элемент не найден в кэше',
          error: 'PARENT_NOT_IN_CACHE',
        };
        return res.code(400).send(errorResponse);
      }
    }

    const newElement = cacheService.createElement(parentId, value);

    const successResponse: OperationResultResponse = {
      success: true,
      message: 'Элемент успешно создан в кэше',
      element: newElement,
    };
    res.code(201).send(successResponse);
  } catch (err) {
    console.error('Ошибка создания элемента в кэше:', err);
    const errorResponse: OperationResultResponse = {
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: 'INTERNAL_SERVER_ERROR',
    };
    res.code(500).send(errorResponse);
  }
};
