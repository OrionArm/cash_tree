import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { sessionService } from '../../services';

// Расширяем типы FastifyRequest для сессии
declare module 'fastify' {
  interface FastifyRequest {
    sessionId: string;
    session: {
      sessionId: string;
      playerId: number | null;
      isActive: boolean;
    };
  }
}

// Плагин для всех API маршрутов с обработкой сессии
module.exports = async function (fastify: FastifyInstance) {
  // Добавляем хук сессии для всех API маршрутов
  fastify.addHook(
    'preHandler',
    async (request: FastifyRequest, reply: FastifyReply) => {
      let sessionId = (request as any).cookies?.sessionId;
      let session = sessionService.getSession(sessionId);
      let needNewCookie = false;

      if (!sessionId || !session) {
        const newSession = sessionService.createSession();
        sessionId = newSession.sessionId;
        session = newSession;
        needNewCookie = true;
      }

      if (needNewCookie) {
        (reply as any).setCookie('sessionId', sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000, // 24 часа
          path: '/',
        });
      }

      request.sessionId = sessionId;
      request.session = {
        sessionId,
        playerId: session?.playerId || null,
        isActive: session?.isActive || false,
      };
    },
  );

  // Регистрируем подмаршруты
  await fastify.register(require('./v1/player/player'), {
    prefix: '/v1/player',
  });
  await fastify.register(require('./v1/world/world'), { prefix: '/v1/world' });
};
