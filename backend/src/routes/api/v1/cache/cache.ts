import { FastifyInstance } from 'fastify';
import {
  applyCashHandler,
  createCashHandler,
  deleteCashHandler,
  getCashHandler,
  getOperationsHandler,
  loadCashHandler,
  resetCashHandler,
  updateCashHandler,
} from '../../../../controllers/cash';

module.exports = async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'POST',
    url: '/load',
    schema: {
      body: {
        type: 'object',
        required: ['elementId'],
        properties: {
          elementId: { type: 'string' },
        },
      },
    },
    handler: loadCashHandler,
  });

  fastify.route({
    method: 'GET',
    url: '/tree',
    handler: getCashHandler,
  });

  fastify.route({
    method: 'GET',
    url: '/operations',
    handler: getOperationsHandler,
  });

  fastify.route({
    method: 'POST',
    url: '/create',
    schema: {
      body: {
        type: 'object',
        required: ['value'],
        properties: {
          parentId: { type: 'string', nullable: true },
          value: { type: 'string', minLength: 1 },
        },
      },
    },
    handler: createCashHandler,
  });

  fastify.route({
    method: 'PUT',
    url: '/update',
    schema: {
      body: {
        type: 'object',
        required: ['elementId', 'value'],
        properties: {
          elementId: { type: 'string' },
          value: { type: 'string', minLength: 1 },
        },
      },
    },
    handler: updateCashHandler,
  });

  fastify.route({
    method: 'DELETE',
    url: '/delete',
    schema: {
      body: {
        type: 'object',
        required: ['elementId'],
        properties: {
          elementId: { type: 'string' },
        },
      },
    },
    handler: deleteCashHandler,
  });

  fastify.route({
    method: 'POST',
    url: '/apply',
    handler: applyCashHandler,
  });

  fastify.route({
    method: 'POST',
    url: '/reset',
    handler: resetCashHandler,
  });
};
