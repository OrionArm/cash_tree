import { FastifyInstance } from 'fastify';
import { getTreeHandler } from '../../../../controllers/tree';

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/',
    handler: getTreeHandler,
  });
}
