import { Icon } from './Icon';
import { TopNav } from './TopNav';
import { UserMenu } from './UserMenu';
import emblemSrc from '../assets/emblem-icon.jpg';

const EMBLEM_SRC = emblemSrc;

interface AppHeaderProps {
  coupleName: string;
  hostRoleLabel: string;
}

/** Fixed translucent top header: brand, primary nav, quick actions, profile menu. */
export function AppHeader({ coupleName, hostRoleLabel }: AppHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[rgba(255,248,245,0.95)] backdrop-blur-xl shadow-[0_2px_12px_-2px_rgba(92,45,12,0.06)]">
      <div className="h-20 w-full px-gutter-mobile md:px-page-margin flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 shrink-0">
          <div className="h-14 w-14 overflow-hidden rounded-full">
            <img
              src={EMBLEM_SRC}
              alt="Band Baaja Baaraat Emblem"
              className="h-full w-full scale-150 object-cover object-[50%_38%]"
            />
          </div>
          <span className="text-headline-sm text-primary font-bold hidden md:inline">Band Baaja Baaraat</span>
        </div>

        <TopNav activePath="overview" />

        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            aria-label="Auspicious Notifications"
            className="relative w-10 h-10 rounded-full border-none bg-transparent flex items-center justify-center text-primary transition-colors duration-150 hover:bg-surface-container"
          >
            <Icon name="notifications_active" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary shadow-[0_0_0_2px_var(--color-surface)]" />
          </button>

          <button
            type="button"
            className="text-label-lg hidden sm:inline-flex items-center gap-1 bg-primary text-on-primary border-none px-4 py-2 rounded-lg font-semibold shadow-[0_4px_14px_rgba(164,55,0,0.3)] transition-[background-color,transform] duration-150 hover:bg-primary-container active:scale-95"
          >
            <Icon name="add" />
            <span>Quick Add</span>
          </button>

          <UserMenu
            coupleName={coupleName}
            roleLabel={hostRoleLabel}
            avatarSrc={EMBLEM_SRC}
            avatarAlt="Band Baaja Baaraat Emblem"
          />
        </div>
      </div>
    </header>
  );
}
