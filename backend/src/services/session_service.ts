import { randomBytes } from 'crypto';

export interface GameSession {
  sessionId: string;
  playerId: number | null; // null пока игрок не создан
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

export class SessionService {
  private sessions = new Map<string, GameSession>();
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 часа

  /**
   * Создает новую игровую сессию
   */
  createSession(): GameSession {
    const sessionId = this.generateSessionId();
    const now = new Date();

    const session: GameSession = {
      sessionId,
      playerId: null, // Будет установлен при создании игрока
      createdAt: now,
      lastActivity: now,
      isActive: true,
    };

    this.sessions.set(sessionId, session);
    this.cleanupExpiredSessions();

    return session;
  }

  /**
   * Получает сессию по ID
   */
  getSession(sessionId: string): GameSession | null {
    const session = this.sessions.get(sessionId);

    if (!session || !session.isActive) {
      return null;
    }

    // Проверяем, не истекла ли сессия
    const now = new Date();
    if (now.getTime() - session.lastActivity.getTime() > this.SESSION_TIMEOUT) {
      session.isActive = false;
      this.sessions.delete(sessionId);
      return null;
    }

    // Обновляем время последней активности
    session.lastActivity = now;
    return session;
  }

  /**
   * Обновляет сессию (например, при создании игрока)
   */
  updateSession(sessionId: string, updates: Partial<GameSession>): boolean {
    const session = this.sessions.get(sessionId);

    if (!session || !session.isActive) {
      return false;
    }

    Object.assign(session, updates);
    session.lastActivity = new Date();
    return true;
  }

  /**
   * Завершает сессию
   */
  endSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return false;
    }

    session.isActive = false;
    this.sessions.delete(sessionId);
    return true;
  }

  /**
   * Генерирует уникальный ID сессии
   */
  private generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Очищает истекшие сессии
   */
  private cleanupExpiredSessions(): void {
    const now = new Date();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of Array.from(this.sessions.entries())) {
      if (
        now.getTime() - session.lastActivity.getTime() >
        this.SESSION_TIMEOUT
      ) {
        expiredSessions.push(sessionId);
      }
    }

    expiredSessions.forEach((sessionId) => {
      this.sessions.delete(sessionId);
    });
  }

  /**
   * Получает статистику сессий (для отладки)
   */
  getStats() {
    return {
      totalSessions: this.sessions.size,
      activeSessions: Array.from(this.sessions.values()).filter(
        (s) => s.isActive,
      ).length,
    };
  }
}

// Создаем единственный экземпляр сервиса
export const sessionService = new SessionService();
