import { type ReactNode } from 'react';
import { useGame } from './use_game';
import { GameContext } from './game_context';

type Props = {
  children: ReactNode;
};

export function GameProvider({ children }: Props) {
  const gameData = useGame();

  return <GameContext.Provider value={gameData}>{children}</GameContext.Provider>;
}
