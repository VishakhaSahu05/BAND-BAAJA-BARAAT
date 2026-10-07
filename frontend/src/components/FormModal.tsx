import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

interface FormModalProps {
  title: string;
  icon: string;
  onClose: () => void;
  /** While true (e.g. a save is in flight) the dialog can't be dismissed. */
  isBusy?: boolean;
  children: ReactNode;
}

/** Portal-rendered dialog shell (see LogoutConfirmModal for why a portal is required). */
export function FormModal({ title, icon, onClose, isBusy = false, children }: FormModalProps) {
  // Only a click that both starts and ends on the backdrop closes the dialog, so dragging a
  // text selection out of an input doesn't discard the form.
  const pressStartedOnBackdrop = useRef(false);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isBusy) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, isBusy]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-[rgba(51,48,45,0.4)] backdrop-blur-sm flex items-center justify-center p-gutter-mobile"
      onMouseDown={(event) => {
        pressStartedOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (pressStartedOnBackdrop.current && event.target === event.currentTarget && !isBusy) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        className="relative bg-surface-container-lowest rounded-xl shadow-[0_12px_32px_-8px_rgba(50,10,15,0.25)] border border-[rgba(143,112,102,0.15)] max-w-xl w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
      >
        <div className="sticky top-0 z-10 bg-surface-container-lowest">
          <div className="h-1 bg-[linear-gradient(to_right,var(--color-primary),var(--color-secondary),var(--color-primary))]" />
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h2 id="form-modal-title" className="text-headline-sm text-on-surface font-bold flex items-center gap-2">
              <Icon name={icon} className="text-primary" />
              {title}
            </h2>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              disabled={isBusy}
              className="bg-transparent border-none p-1 rounded-full text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:pointer-events-none"
            >
              <Icon name="close" />
            </button>
          </div>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
