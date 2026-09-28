interface NavItem {
  path: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: 'overview', label: 'Overview' },
  { path: 'events-and-functions', label: 'Events & Functions' },
  { path: 'guest-list-and-rsvp', label: 'Guest List & RSVP' },
  { path: 'vendors-and-bookings', label: 'Vendors & Bookings' },
  { path: 'budget-and-expenses', label: 'Budget & Expenses' },
  { path: 'wedding-website-and-stream', label: 'Website & Stream' },
];

interface TopNavProps {
  activePath: string;
}

/**
 * Primary tab navigation. Links are inert placeholders (`href="#"`) — no
 * router is set up in the frontend yet, so only the current page ("Overview")
 * is reachable; the rest render for visual fidelity with the Stitch design.
 */
export function TopNav({ activePath }: TopNavProps) {
  return (
    <nav className="hidden xl:flex items-center gap-4">
      {NAV_ITEMS.map((item) => (
        <a
          key={item.path}
          href="#"
          aria-current={item.path === activePath ? 'page' : undefined}
          className={`text-body-md py-1.5 px-4 transition-colors duration-150 border-b-2 ${
            item.path === activePath
              ? 'text-primary font-semibold border-primary'
              : 'text-on-surface-variant font-normal border-transparent hover:text-primary'
          }`}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
