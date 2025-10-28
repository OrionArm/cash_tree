export type PageType = 'loading' | 'game' | 'menu' | 'settings' | 'profile' | 'shop';

export interface AppState {
  currentPage: PageType;
  isLoading: boolean;
  loadingProgress: number;
  loadingText: string;
}

export type PlayerRanking = {
  id: number;
  name: string;
  position: number;
  gold: number;
  cristal: number;
};
