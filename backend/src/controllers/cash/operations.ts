import { FastifyReply, FastifyRequest } from 'fastify';
import { cacheService } from '../../services/cash';
import { OperationResultResponse } from '../../dto/response/note';

export const getOperationsHandler = async (
  _req: FastifyRequest,
  res: FastifyReply,
): Promise<{ operations: any[]; hasOperations: boolean }> => {
  try {
    const operations = cacheService.getOperations();

    const response = {
      operations,
      hasOperations: operations.length > 0,
    };

    return res.code(200).send(response);
  } catch (err) {
    console.error('Ошибка получения операций кэша:', err);
    const errorResponse: OperationResultResponse = {
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: 'INTERNAL_SERVER_ERROR',
    };
    res.code(500).send(errorResponse);
  }
};
