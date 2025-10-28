import styles from './bottom_navigation.module.css';
import { FaHome, FaUser, FaGift, FaShoppingCart } from 'react-icons/fa';

type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
};

type Props = {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  gameStatus?: 'playing' | 'won' | 'lost' | null;
};

export default function BottomNavigation({ activeTab = 'home', onTabChange, gameStatus }: Props) {
  const isGameFinished = gameStatus === 'won' || gameStatus === 'lost';

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Главная',
      icon: FaHome,
      onClick: () => !isGameFinished && onTabChange?.('home'),
    },
    {
      id: 'profile',
      label: 'Профиль',
      icon: FaUser,
      onClick: () => onTabChange?.('profile'),
    },
    {
      id: 'rewards',
      label: 'Призы',
      icon: FaGift,
      onClick: () => {},
    },
    {
      id: 'shop',
      label: 'Лавка',
      icon: FaShoppingCart,
      onClick: () => onTabChange?.('shop'),
    },
  ];

  return (
    <nav className={styles.bottomNavigation}>
      {navItems.map((item) => {
        const isDisabled = (item.id === 'home' && isGameFinished) || item.id === 'rewards';
        return (
          <button
            key={item.id}
            className={`${styles.navButton} ${activeTab === item.id ? styles.active : ''} ${isDisabled ? styles.disabled : ''}`}
            onClick={item.onClick}
            disabled={isDisabled}
            aria-label={item.label}
            data-tab={item.id}
          >
            <span className={styles.icon}>
              <item.icon />
            </span>
            <span className={styles.label}>{item.label}</span>
            {activeTab === item.id && <span className={styles.activeIndicator} />}
          </button>
        );
      })}
    </nav>
  );
}
