'use strict';

import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

module.exports = fp(async function (fastify: FastifyInstance) {
  fastify.register(require('@fastify/cors'), {
    origin: (origin, callback) => {
      if (process.env.NODE_ENV === 'development' || !origin) {
        return callback(null, true);
      }

      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
      ];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
});
