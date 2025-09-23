import { FastifyReply, FastifyRequest } from 'fastify';
import { cacheService } from '../../services/cash';
import { databaseService } from '../../services/data_base';
import { ApplyChangesResponse } from '../../dto/response/note';

export const applyCashHandler = async (
  _req: FastifyRequest,
  res: FastifyReply,
) => {
  try {
    const response = await cacheService.applyOperations(databaseService);
    res.code(200).send(response);
  } catch (err) {
    console.error('Ошибка применения изменений:', err);
    const errorResponse: ApplyChangesResponse = {
      success: false,
      appliedOperations: 0,
      errors: ['Внутренняя ошибка сервера'],
      message: 'Внутренняя ошибка сервера',
    };
    res.code(500).send(errorResponse);
  }
};
