import { GamePage, LoadingScreen, ProfilePage, ShopPage } from '@/pages';
import BottomNavigation from '@/features/bottom_navigation';
import type { PageType } from '../shared/types';
import { useGameContext } from '@/entities/game/use_game_context';
import { useState } from 'react';
import { GameProvider } from '@/entities/game/game_provider';

function AppContent() {
  const { loading, loadingProgress, loadingText, gameStatus } = useGameContext();
  const [currentPage, setCurrentPage] = useState<PageType>('loading');

  const getCurrentPage = (): PageType => {
    if (loading) return 'loading';
    if (gameStatus === 'won' || gameStatus === 'lost') {
      return 'profile';
    }
    return currentPage === 'loading' ? 'game' : currentPage;
  };

  const actualCurrentPage = getCurrentPage();

  const handleTabChange = (tabId: string) => {
    if (tabId === 'profile') {
      setCurrentPage('profile');
    } else if (tabId === 'shop') {
      setCurrentPage('shop');
    } else if (tabId === 'home' && gameStatus !== 'won' && gameStatus !== 'lost') {
      setCurrentPage('game');
    }
  };

  const getActiveTab = (): string => {
    switch (actualCurrentPage) {
      case 'profile':
        return 'profile';
      case 'shop':
        return 'shop';
      case 'game':
        return 'home';
      default:
        return 'home';
    }
  };

  const getPageStyle = (pageType: PageType) => {
    const isVisible = actualCurrentPage === pageType;
    return {
      display: isVisible ? 'block' : 'none',
      width: '100%',
      height: '100%',
    };
  };

  return (
    <>
      {loading && <LoadingScreen progress={loadingProgress} loadingText={loadingText} />}

      {!loading && (
        <div style={getPageStyle('game')}>
          <GamePage />
        </div>
      )}

      {!loading && (
        <div style={getPageStyle('profile')}>
          <ProfilePage />
        </div>
      )}

      {!loading && (
        <div style={getPageStyle('shop')}>
          <ShopPage />
        </div>
      )}

      {!loading && (
        <BottomNavigation
          activeTab={getActiveTab()}
          onTabChange={handleTabChange}
          gameStatus={gameStatus}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
