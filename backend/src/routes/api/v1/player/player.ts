import { FastifyInstance } from 'fastify';
import {
  movePlayerHandler,
  getPlayerStateHandler,
} from '../../../../controllers/player';

module.exports = async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/move',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            newPosition: { type: 'number' },
            events: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
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
            playerState: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                health: { type: 'number' },
                maxHealth: { type: 'number' },
                gold: { type: 'number' },
                position: { type: 'number' },
                cristal: { type: 'number' },
                steps: { type: 'number' },
                updatedAt: { type: 'string' },
              },
            },
          },
        },
        400: {
          type: 'object',
          properties: {
            message: { type: 'string' },
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
    handler: movePlayerHandler,
  });

  fastify.route({
    method: 'GET',
    url: '/state',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            health: { type: 'number' },
            maxHealth: { type: 'number' },
            gold: { type: 'number' },
            position: { type: 'number' },
            cristal: { type: 'number' },
            steps: { type: 'number' },
            updatedAt: { type: 'string' },
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
    handler: getPlayerStateHandler,
  });
};
