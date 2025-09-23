const { sessionService } = require('./dist/src/services/session_service.js');

console.log('Testing sessionService...');

try {
  // Создаем сессию
  const session = sessionService.createSession();
  console.log('Created session:', session.sessionId);

  // Получаем сессию
  const retrievedSession = sessionService.getSession(session.sessionId);
  console.log('Retrieved session:', retrievedSession ? 'OK' : 'FAILED');

  // Обновляем сессию
  const updated = sessionService.updateSession(session.sessionId, {
    playerId: 123,
  });
  console.log('Updated session:', updated ? 'OK' : 'FAILED');

  // Получаем статистику
  const stats = sessionService.getStats();
  console.log('Stats:', stats);

  console.log('All tests passed!');
} catch (error) {
  console.error('Error:', error);
}
