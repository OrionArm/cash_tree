import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import {
  applyCacheHandler,
  createCacheHandler,
  deleteCacheHandler,
  getCacheHandler,
  getOperationsHandler,
  loadCacheHandler,
  resetCacheHandler,
  updateCacheHandler,
} from '../../../../controllers/cache';
import {
  CreateElementSchema,
  UpdateElementSchema,
  DeleteElementSchema,
  LoadElementSchema,
} from '../../../../dto/request/cache.schemas';
import {
  OperationResultSchema,
  LoadResultSchema,
  OperationsListSchema,
  ApplyChangesSchema,
  TreeNodeSchema,
} from '../../../../dto/response/cache.schemas';
import { Type } from '@sinclair/typebox';

export default async function (fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

  server.post('/load', {
    schema: {
      body: LoadElementSchema,
      response: {
        200: LoadResultSchema,
        400: OperationResultSchema,
        404: OperationResultSchema,
      },
    },
    handler: loadCacheHandler,
  });

  server.get('/tree', {
    schema: {
      response: {
        200: Type.Array(TreeNodeSchema),
      },
    },
    handler: getCacheHandler,
  });

  server.get('/operations', {
    schema: {
      response: {
        200: OperationsListSchema,
      },
    },
    handler: getOperationsHandler,
  });

  server.post('/create', {
    schema: {
      body: CreateElementSchema,
      response: {
        201: OperationResultSchema,
        400: OperationResultSchema,
      },
    },
    handler: createCacheHandler,
  });

  server.put('/update', {
    schema: {
      body: UpdateElementSchema,
      response: {
        200: OperationResultSchema,
        400: OperationResultSchema,
        404: OperationResultSchema,
      },
    },
    handler: updateCacheHandler,
  });

  server.delete('/delete', {
    schema: {
      body: DeleteElementSchema,
      response: {
        200: OperationResultSchema,
        400: OperationResultSchema,
        404: OperationResultSchema,
      },
    },
    handler: deleteCacheHandler,
  });

  server.post('/apply', {
    schema: {
      response: {
        200: ApplyChangesSchema,
      },
    },
    handler: applyCacheHandler,
  });

  server.post('/reset', {
    schema: {
      response: {
        200: OperationResultSchema,
      },
    },
    handler: resetCacheHandler,
  });
}
