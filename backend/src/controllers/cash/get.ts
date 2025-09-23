import { FastifyReply, FastifyRequest } from 'fastify';
import { cacheService } from '../../services/cash';
import { OperationResultResponse } from '../../dto/response/note';
import { TreeNode } from '../../dto/types';

export const getCashHandler = async (
  _req: FastifyRequest,
  res: FastifyReply,
): Promise<TreeNode[]> => {
  try {
    const elements = cacheService.getCacheStructure();

    return res.code(200).send(elements);
  } catch (err) {
    console.error('Ошибка получения структуры кэша:', err);
    const errorResponse: OperationResultResponse = {
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: 'INTERNAL_SERVER_ERROR',
    };
    res.code(500).send(errorResponse);
  }
};
