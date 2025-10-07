import {
  FastifyInstance,
  FastifyError,
  FastifyRequest,
  FastifyReply,
} from 'fastify';
import fp from 'fastify-plugin';
import { HttpError } from '../errors/http-errors';
import { HTTP_STATUS } from '../constants/http';
import { ERROR_CODES } from '../constants/error-codes';

export default fp(async function (fastify: FastifyInstance) {
  fastify.setErrorHandler(
    (
      error: FastifyError | HttpError | Error,
      request: FastifyRequest,
      reply: FastifyReply,
    ) => {
      // Логируем ошибку
      request.log.error(
        {
          err: error,
          url: request.url,
          method: request.method,
        },
        'Необработанная ошибка',
      );

      // Обрабатываем кастомные HTTP ошибки
      if (error instanceof HttpError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
          error: error.code || 'HTTP_ERROR',
        });
      }

      // Обрабатываем ошибки валидации Fastify
      if ('validation' in error && error.validation) {
        return reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          message: 'Ошибка валидации данных',
          error: ERROR_CODES.VALIDATION_ERROR,
          details: error.validation,
        });
      }

      // Обрабатываем стандартные Fastify ошибки
      if ('statusCode' in error && error.statusCode) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
          error: error.code || ERROR_CODES.FASTIFY_ERROR,
        });
      }

      // Обрабатываем все остальные ошибки как внутренние
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      });
    },
  );
});
