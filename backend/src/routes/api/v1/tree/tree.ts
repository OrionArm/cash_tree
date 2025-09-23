import { FastifyInstance } from 'fastify';
import { getTreeHandler } from '../../../../controllers/tree';

module.exports = async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/',
    handler: getTreeHandler,
  });
};
