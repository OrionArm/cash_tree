import { createContext } from 'react';
import { useGame } from './use_game';

type GameContextType = ReturnType<typeof useGame>;

export const GameContext = createContext<GameContextType | undefined>(undefined);
