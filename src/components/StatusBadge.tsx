import type { TaskStatus } from '../types';

const LABELS: Record<TaskStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  blocked: 'Blocked',
  complete: 'Complete',
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`badge badge--${status}`} data-testid="status-badge">
      {LABELS[status]}
    </span>
  );
}
