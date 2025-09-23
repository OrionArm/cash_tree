import { FastifyReply, FastifyRequest } from 'fastify';
import { databaseService } from '../services';
import { TreeNode } from '../dto/types';

export const getTreeHandler = async (
  _req: FastifyRequest,
  res: FastifyReply,
): Promise<TreeNode[]> => {
  try {
    const data = await databaseService.getTreeStructure();

    return res.code(201).send(data);
  } catch (err) {
    res.code(500).send({
      message: 'Internal Server Error',
    });
  }
};
