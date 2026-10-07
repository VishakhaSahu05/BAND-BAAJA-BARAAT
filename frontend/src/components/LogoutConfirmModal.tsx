import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

interface LogoutConfirmModalProps {
  onCancel: () => void;
  onConfirm: () => void;
  isConfirming?: boolean;
  errorMessage?: string | null;
}

/**
 * Rendered via a portal to document.body so its `fixed inset-0` backdrop covers
 * the full viewport — AppHeader's `backdrop-blur` creates a containing block for
 * `position: fixed` descendants, which would otherwise clip this to the header.
 */
export function LogoutConfirmModal({
  onCancel,
  onConfirm,
  isConfirming = false,
  errorMessage = null,
}: LogoutConfirmModalProps) {
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel();
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-[rgba(51,48,45,0.4)] backdrop-blur-sm flex items-center justify-center p-gutter-mobile"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="relative bg-surface-container-lowest rounded-xl shadow-[0_12px_32px_-8px_rgba(50,10,15,0.25)] border border-[rgba(143,112,102,0.15)] max-w-96 w-full p-6 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-[linear-gradient(to_right,var(--color-primary),var(--color-secondary),var(--color-primary))]" />
        <div className="flex items-start gap-2">
          <div className="w-10 h-10 rounded-full bg-secondary-soft text-secondary flex items-center justify-center shrink-0">
            <Icon name="logout" />
          </div>
          <div>
            <h3 id="logout-modal-title" className="text-headline-sm text-on-surface font-bold">
              Log Out
            </h3>
            <p className="text-body-md text-on-surface-variant mt-1">Are you sure you want to log out?</p>
          </div>
        </div>
        {errorMessage ? (
          <p role="alert" className="text-body-sm text-on-error-container bg-error-container rounded-lg px-3 py-2 mt-4">
            {errorMessage}
          </p>
        ) : null}
        <div className="mt-6 flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            disabled={isConfirming}
            className="text-label-md py-1.5 px-4 rounded-lg border border-outline-variant bg-transparent text-on-surface font-semibold transition-colors duration-150 hover:bg-surface-container disabled:opacity-60 disabled:pointer-events-none"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isConfirming}
            className="text-label-md inline-flex items-center gap-1 py-1.5 px-4 rounded-lg border-none bg-secondary text-on-secondary font-semibold shadow-[0_4px_14px_rgba(164,55,0,0.3)] transition-[background-color,transform] duration-150 hover:bg-secondary-container active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
            onClick={onConfirm}
          >
            <Icon name="check" />
            <span>{isConfirming ? 'Logging Out…' : 'Log Out'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
