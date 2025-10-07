import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

/**
 * This plugins adds important security headers for Fastify.
 *
 * @see https://github.com/fastify/fastify-helmet
 */
export default fp(async function (fastify: FastifyInstance) {
  fastify.register(require('@fastify/helmet'), {
    crossOriginResourcePolicy: false,
  });
});
