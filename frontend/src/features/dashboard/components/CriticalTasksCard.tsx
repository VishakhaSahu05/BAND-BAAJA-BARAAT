import { useEffect, useState } from 'react';
import { Icon } from '../../../components/Icon';
import type { MetricAccent } from '../../../components/MetricCard';
import type { CriticalTaskEntry } from '../types';

const accentColor: Record<MetricAccent, string> = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  tertiary: 'var(--color-tertiary)',
  neutral: 'var(--color-on-surface)',
};

interface CriticalTasksCardProps {
  tasks: CriticalTaskEntry[];
}

/**
 * Checkbox state is local-only UI affordance (mirrors the Stitch design's
 * interactive checklist) and is not persisted anywhere — no task API is
 * called in this step.
 */
export function CriticalTasksCard({ tasks }: CriticalTasksCardProps) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(
    () => new Set(tasks.filter((task) => task.completed).map((task) => task.id)),
  );

  useEffect(() => {
    setCheckedIds(new Set(tasks.filter((task) => task.completed).map((task) => task.id)));
  }, [tasks]);

  const pendingCount = tasks.length - checkedIds.size;

  function toggle(id: string) {
    setCheckedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-1">
          <Icon name="checklist" filled className="text-primary text-xl" />
          <h3 className="text-title-lg text-on-surface font-bold">Critical Tasks</h3>
        </div>
        <span className="text-label-sm text-primary font-bold">{pendingCount} Pending</span>
      </div>
      <div className="flex flex-col gap-1 pt-1">
        {tasks.map((task) => (
          <label
            key={task.id}
            className="flex items-center justify-between gap-2 p-1 rounded-lg transition-colors duration-150 hover:bg-surface-container"
          >
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary rounded"
                checked={checkedIds.has(task.id)}
                onChange={() => toggle(task.id)}
              />
              <span className="text-body-md text-on-surface font-medium">{task.title}</span>
            </span>
            <span className="text-label-sm font-bold" style={{ color: accentColor[task.accent] }}>
              {task.dueLabel}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
