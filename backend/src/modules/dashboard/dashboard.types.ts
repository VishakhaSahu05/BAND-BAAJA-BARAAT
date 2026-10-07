export type MetricAccent = 'primary' | 'secondary' | 'tertiary' | 'neutral';

/** Shape consumed by the frontend's `DashboardData` (minus the static quote, which stays client-side). */
export interface DashboardResponse {
  wedding: {
    coupleName: string;
    eventLabel: string;
    venueLine: string;
    scheduleLine: string;
    description: string;
  };
  countdown: {
    targetDateIso: string;
    muhuratTimeLabel?: string;
  };
  metrics: Array<{
    id: string;
    label: string;
    value: string;
    valueSuffix: string;
    badgeText: string;
    accent: MetricAccent;
    progressPercent: number;
  }>;
  ceremonies: Array<{
    id: string;
    name: string;
    ribbonLabel: string;
    timeLocationLabel: string;
    description: string;
    accent: MetricAccent;
    imageSrc: string;
    imageAlt: string;
  }>;
  criticalTasks: Array<{
    id: string;
    title: string;
    dueLabel: string;
    accent: MetricAccent;
    completed: boolean;
  }>;
  familyCircle: Array<{
    id: string;
    initials: string;
    name: string;
    roleLabel: string;
    accent: MetricAccent;
  }>;
  venue: {
    name: string;
    detailLine: string;
    opsContactName?: string;
    phoneNumber?: string;
  };
}
