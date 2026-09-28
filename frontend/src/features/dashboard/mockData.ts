import type { DashboardData } from './types';

/**
 * Isolated sample data for the dashboard, copied from the Stitch
 * "Wedding Overview & Dashboard" screen. This is the ONLY place mock values
 * live for this feature — replace `getDashboardData` in `api/dashboardApi.ts`
 * with a real HTTP call and delete this file once
 * `GET /weddings/:weddingId/dashboard` exists; no component imports this
 * file directly.
 */
export const mockDashboardData: DashboardData = {
  wedding: {
    coupleName: 'Ananya & Kabir',
    hostRoleLabel: 'Host Account',
    eventLabel: 'The Royal Vivaha Festival',
    venueLine: 'Rambagh Palace, Jaipur',
    scheduleLine: '2 Auspicious Days • 5 Sacred Pujas',
    description:
      "Welcome to the digital master command of the royal nuptials at Rambagh Palace, Jaipur. Real-time sacred muhurat sync, multi-event itineraries, and family coordination in one auspicious portal.",
  },
  countdown: {
    // 48 days from an arbitrary reference point, matching the Stitch screen's static "48 Days to go".
    targetDateIso: new Date(Date.now() + 48 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(),
    muhuratTimeLabel: '06:42 PM',
  },
  metrics: [
    {
      id: 'guest-rsvps',
      label: 'Guest RSVPs',
      value: '342',
      valueSuffix: '/ 420 Confirmed',
      badgeText: '81%',
      accent: 'tertiary',
      progressPercent: 81,
    },
    {
      id: 'ceremony-budget',
      label: 'Ceremony Budget',
      value: '₹48.5L',
      valueSuffix: '/ ₹65L Limit',
      badgeText: '74%',
      accent: 'primary',
      progressPercent: 74,
    },
    {
      id: 'ritual-milestones',
      label: 'Ritual Milestones',
      value: '5 of 5',
      valueSuffix: 'Pujas Set',
      badgeText: 'Ready',
      accent: 'secondary',
      progressPercent: 100,
    },
    {
      id: 'vendor-contracts',
      label: 'Vendor Contracts',
      value: '14 / 16',
      valueSuffix: 'Signed',
      badgeText: '2 Pending',
      accent: 'neutral',
      progressPercent: 88,
    },
  ],
  ceremonies: [
    {
      id: 'haldi-mehendi',
      name: 'Haldi & Mehendi',
      ribbonLabel: 'Day 1 • Morning',
      timeLocationLabel: '10:00 AM • Durbar Hall',
      description: 'Traditional auspicious turmeric ceremony followed by henna artistry.',
      dressCode: 'Dress: Marigold Yellow',
      accent: 'primary',
      imageSrc: 'https://images.unsplash.com/photo-1681717166573-f71589207785?q=80&w=800&auto=format&fit=crop',
      imageAlt: 'Haldi & Mehendi',
    },
    {
      id: 'sangeet-celebration',
      name: 'Sangeet & Celebration',
      ribbonLabel: 'Day 1 • Evening',
      timeLocationLabel: '07:00 PM • Palace Gardens',
      description: 'Musical evening with choreographed performances & dinner banquet.',
      dressCode: 'Dress: Royal Jewel Tones',
      metaBadgeLabel: 'Live DJ',
      accent: 'secondary',
      imageSrc: 'https://images.unsplash.com/photo-1587271636175-90d58cdad458?q=80&w=800&auto=format&fit=crop',
      imageAlt: 'Sangeet Gala',
    },
    {
      id: 'royal-baaraat',
      name: 'Royal Baaraat & Vedic Pheras',
      ribbonLabel: 'Day 2 • Sacred Union',
      timeLocationLabel: '04:00 PM • Lotus Mandap',
      description: 'Grand procession, floral Varmala, and traditional seven sacred vows.',
      dressCode: 'Dress: Traditional Formal',
      metaBadgeLabel: 'Muhurat 06:42 PM',
      accent: 'primary',
      imageSrc: 'https://images.unsplash.com/photo-1574496026439-0781c4cad842?q=80&w=800&auto=format&fit=crop',
      imageAlt: 'Royal Baaraat & Vedic Pheras',
    },
  ],
  criticalTasks: [
    { id: 'sangeet-choreo', title: 'Finalize Sangeet choreo', dueLabel: 'Tomorrow', accent: 'primary', completed: false },
    { id: 'vendor-payments', title: 'Vendor payments', dueLabel: 'Friday', accent: 'secondary', completed: false },
    { id: 'guest-transport', title: 'Guest arrival transport', dueLabel: 'In 3 days', accent: 'tertiary', completed: false },
  ],
  familyCircle: [
    { id: 'meera-sharma', initials: 'MS', name: 'Meera Sharma', roleLabel: 'Maasi Ji', accent: 'primary' },
    { id: 'sunita-malhotra', initials: 'SM', name: 'Sunita Malhotra', roleLabel: 'Mother', accent: 'secondary' },
    { id: 'kunal-malhotra', initials: 'KM', name: 'Kunal Malhotra', roleLabel: 'Brother', accent: 'tertiary' },
  ],
  venue: {
    name: 'Rambagh Palace, Jaipur',
    detailLine: '48 Palace Suites Reserved • 3 Lawns',
    opsContactName: 'Ops: Vikramaditya',
    phoneNumber: '+911412211919',
  },
  quote: {
    text: '"माङ्गल्यं तन्तुनानेन मम जीवनहेतुना । कण्ठे बध्नामि सुभगे सञ्जीव शरदः शतम् ॥"',
    attribution: 'Ananya & Kabir • Shubh Vivaah',
  },
};
