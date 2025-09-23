import { FastifyReply, FastifyRequest } from 'fastify';
import { cacheService } from '../../services/cash';
import { OperationResultResponse } from '../../dto/response/note';

export const resetCashHandler = async (
  _req: FastifyRequest,
  res: FastifyReply,
) => {
  try {
    cacheService.clear();

    const successResponse: OperationResultResponse = {
      success: true,
      message: 'Кэш успешно сброшен',
    };
    res.code(200).send(successResponse);
  } catch (err) {
    console.error('Ошибка сброса кэша:', err);
    const errorResponse: OperationResultResponse = {
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: 'INTERNAL_SERVER_ERROR',
    };
    res.code(500).send(errorResponse);
  }
};
