import { FastifyReply, FastifyRequest } from 'fastify';
import { cacheService } from '../../services/cash';
import { databaseService } from '../../services/data_base';
import { LoadElementRequest } from '../../dto/request/element';
import {
  LoadToCacheResultResponse,
  OperationResultResponse,
} from '../../dto/response/note';

export const loadCashHandler = async (
  req: FastifyRequest<{ Body: LoadElementRequest }>,
  res: FastifyReply,
): Promise<LoadToCacheResultResponse> => {
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

    const result = await cacheService.loadElement(databaseService, elementId);

    if (!result.success) {
      const errorResponse: OperationResultResponse = {
        success: false,
        message: result.message,
        error: 'ELEMENT_NOT_FOUND',
      };
      return res.code(404).send(errorResponse);
    }

    const successResponse: LoadToCacheResultResponse = {
      success: true,
      message: result.message,
    };
    res.code(200).send(successResponse);
  } catch (err) {
    console.error('Ошибка загрузки элемента в кэш:', err);
    const errorResponse: OperationResultResponse = {
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: 'INTERNAL_SERVER_ERROR',
    };
    res.code(500).send(errorResponse);
  }
};
