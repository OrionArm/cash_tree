import { FastifyInstance } from 'fastify';
import { getWorldStateHandler } from '../../../../controllers/world';

module.exports = async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/state',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            events: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  position: { type: 'number' },
                  eventId: { type: 'string' },
                  type: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  imageUrl: { type: 'string' },
                  requiresAction: { type: 'boolean' },
                  actions: { type: 'array', items: { type: 'string' } },
                  rewards: { type: 'object' },
                },
              },
            },
            worldLength: { type: 'number' },
          },
        },
        500: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    handler: getWorldStateHandler,
  });
};
