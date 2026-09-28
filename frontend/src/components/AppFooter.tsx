const FOOTER_LINKS = [
  { path: 'overview', label: 'Master Schedule' },
  { path: 'events-and-functions', label: 'Ceremony Muhurats' },
  { path: 'vendors-and-bookings', label: 'Vendor Run-Sheets' },
  { path: 'guest-list-and-rsvp', label: 'Guest Logistics' },
  { path: 'budget-and-expenses', label: 'Expense Vault' },
];

/** Static branding footer — no backend data. Quick links are inert placeholders (no router yet). */
export function AppFooter() {
  return (
    <footer className="w-full bg-surface-container-low mt-10 pt-10 pb-6 border-t border-[rgba(143,112,102,0.2)]">
      <div className="w-full px-gutter-mobile md:px-page-margin max-w-7xl mx-auto flex flex-col gap-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-[rgba(143,112,102,0.15)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-headline-md text-primary font-bold">Band Baaja Baaraat</span>
              <span className="text-label-sm bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full uppercase font-bold">
                Shaadi OS
              </span>
            </div>
            <p className="text-body-md text-on-surface-variant mt-1">
              Ceremonial grandeur engineered with contemporary digital ease.
            </p>
          </div>
          <nav className="text-label-lg flex flex-wrap gap-6 text-tertiary">
            {FOOTER_LINKS.map((link) => (
              <a key={link.path} href="#" className="transition-colors duration-150 hover:text-primary">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="text-body-sm flex flex-col md:flex-row items-center justify-between gap-4 text-on-surface-variant text-center md:text-left">
          <div className="text-headline-sm text-secondary italic tracking-wide">
            &ldquo;मङ्गलम् भगवान विष्णुः, मङ्गलम् गरुडध्वजः&rdquo;
          </div>
          <div>&copy; 2025 Band Baaja Baaraat. All auspicious celebrations reserved. Crafted for enduring love.</div>
        </div>
      </div>
    </footer>
  );
}
