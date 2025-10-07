import { container } from 'tsyringe';
import { FastifyReply, FastifyRequest } from 'fastify';
import { DatabaseService } from '../services';
import { TreeNode } from '../dto/types';
import { HTTP_STATUS } from '../constants/http';

export const getTreeHandler = async (
  _req: FastifyRequest,
  res: FastifyReply,
): Promise<TreeNode[]> => {
  const databaseService = container.resolve(DatabaseService);
  const data = await databaseService.getTreeStructure();

  return res.code(HTTP_STATUS.OK).send(data);
};
