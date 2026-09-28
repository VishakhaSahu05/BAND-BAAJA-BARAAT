import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { LogoutConfirmModal } from './LogoutConfirmModal';

interface UserMenuProps {
  coupleName: string;
  roleLabel: string;
  avatarSrc: string;
  avatarAlt: string;
}

/**
 * Header profile dropdown + logout confirmation. Local UI state only (open/closed) —
 * "Log Out" does not call any API in this step; identity data is passed in as props.
 */
export function UserMenu({ coupleName, roleLabel, avatarSrc, avatarAlt }: UserMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setIsLogoutModalOpen(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="relative pl-1 border-l border-outline-variant" ref={containerRef}>
      <button
        type="button"
        className="flex items-center gap-1 border-none bg-transparent rounded-full p-0.5 shadow-[0_0_0_1px_rgba(143,112,102,0.4)] transition-[box-shadow,background-color] duration-150 hover:bg-surface-container hover:shadow-[0_0_0_1px_var(--color-primary)]"
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
        aria-label="User Profile Menu"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <img src={avatarSrc} alt={avatarAlt} className="h-9 w-auto object-contain rounded-full" referrerPolicy="no-referrer" />
        <Icon name="expand_more" className="hidden sm:inline-block text-on-surface-variant text-lg" />
      </button>

      {isMenuOpen && (
        <div
          className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-[0_12px_24px_-8px_rgba(50,10,15,0.18)] border border-[rgba(143,112,102,0.15)] py-1 z-50"
          role="menu"
        >
          <div className="px-4 pb-1 pt-4 border-b border-[rgba(143,112,102,0.15)]">
            <p className="text-title-md text-on-surface font-bold leading-tight">{coupleName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-label-sm text-on-surface-variant uppercase font-semibold">{roleLabel}</span>
            </div>
          </div>
          <div className="py-1">
            <a href="#" className="text-label-md flex items-center gap-1 py-1.5 px-4 text-on-surface transition-colors duration-150 hover:bg-surface-container">
              <Icon name="manage_accounts" className="text-on-surface-variant text-base" />
              <span>Celebration Settings</span>
            </a>
            <a href="#" className="text-label-md flex items-center gap-1 py-1.5 px-4 text-on-surface transition-colors duration-150 hover:bg-surface-container">
              <Icon name="help_outline" className="text-on-surface-variant text-base" />
              <span>Concierge Support</span>
            </a>
          </div>
          <div className="border-t border-[rgba(143,112,102,0.15)] pt-1 mt-1">
            <button
              type="button"
              className="text-label-md w-full flex items-center gap-1 py-1.5 px-4 bg-transparent border-none text-secondary font-semibold text-left transition-colors duration-150 hover:bg-secondary-soft"
              onClick={() => {
                setIsMenuOpen(false);
                setIsLogoutModalOpen(true);
              }}
            >
              <Icon name="logout" className="text-secondary text-base" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {isLogoutModalOpen && (
        <LogoutConfirmModal
          onCancel={() => setIsLogoutModalOpen(false)}
          onConfirm={() => setIsLogoutModalOpen(false)}
        />
      )}
    </div>
  );
}
