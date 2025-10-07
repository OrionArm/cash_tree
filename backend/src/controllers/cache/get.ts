import { container } from 'tsyringe';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CacheService } from '../../services';
import { TreeNode } from '../../dto/types';
import { HTTP_STATUS } from '../../constants/http';

export const getCacheHandler = async (
  _req: FastifyRequest,
  res: FastifyReply,
): Promise<TreeNode[]> => {
  const cacheService = container.resolve(CacheService);
  const elements = cacheService.getCacheStructure();

  return res.code(HTTP_STATUS.OK).send(elements);
};
