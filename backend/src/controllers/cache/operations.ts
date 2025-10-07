import { container } from 'tsyringe';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CacheService } from '../../services';
import { HTTP_STATUS } from '../../constants/http';

export const getOperationsHandler = async (
  _req: FastifyRequest,
  res: FastifyReply,
) => {
  const cacheService = container.resolve(CacheService);
  const operations = cacheService.getOperations();

  const response = {
    operations,
    hasOperations: operations.length > 0,
  };

  return res.code(HTTP_STATUS.OK).send(response);
};
