import { FastifyReply, FastifyRequest } from 'fastify';
import { cacheService } from '../../services/cash';
import { databaseService } from '../../services/data_base';
import { OperationResultResponse } from '../../dto/response/note';

export const resetCashHandler = async (
  _req: FastifyRequest,
  res: FastifyReply,
) => {
  try {
    cacheService.clear();

    await databaseService.reset();

    const successResponse: OperationResultResponse = {
      success: true,
      message: 'Кэш и база данных успешно сброшены',
    };
    res.code(200).send(successResponse);
  } catch (err) {
    console.error('Ошибка сброса кэша и базы данных:', err);
    const errorResponse: OperationResultResponse = {
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: 'INTERNAL_SERVER_ERROR',
    };
    res.code(500).send(errorResponse);
  }
};
