import { useAppDispatch } from '../store/hooks';
import { updateTask } from '../features/sheet/sheetSlice';
import { StatusBadge } from './StatusBadge';
import type { AgentInsight, Priority, Task, TaskStatus } from '../types';
import { AgentInsightRow } from './AgentInsightRow';

const STATUS_OPTIONS: TaskStatus[] = ['not_started', 'in_progress', 'blocked', 'complete'];
const STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  blocked: 'Blocked',
  complete: 'Complete',
};
const PRIO_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props {
  task: Task;
  insight?: AgentInsight;
  onActOnInsight: (insight: AgentInsight) => void;
}

export function TaskRow({ task, insight, onActOnInsight }: Props) {
  const dispatch = useAppDispatch();

  const onStatusChange = (status: TaskStatus) => {
    dispatch(updateTask({ id: task.id, patch: { status } }));
  };

  return (
    <>
      <div className="row" data-testid="task-row">
        <div className="cell-name">{task.name}</div>
        <div className="assignee">
          <span className="avatar" aria-hidden="true">{initials(task.assignee)}</span>
          {task.assignee}
        </div>
        <div>
          <select
            className="status-select"
            aria-label={`Status for ${task.name}`}
            value={task.status}
            onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div className={`prio prio--${task.priority}`}>
          <span className="prio__dot" aria-hidden="true" />
          {PRIO_LABELS[task.priority]}
        </div>
        <div className="progress">
          <div className="progress__track" role="progressbar" aria-valuenow={task.progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress__fill" style={{ width: `${task.progress}%` }} />
          </div>
          <span className="progress__num">{task.progress}%</span>
        </div>
        <div>
          <StatusBadge status={task.status} />{' '}
          <span style={{ fontSize: 12, color: 'var(--ink-faint)', display: 'block', marginTop: 4 }}>
            Due {formatDate(task.dueDate)}
          </span>
        </div>
      </div>
      {insight && <AgentInsightRow insight={insight} onAct={onActOnInsight} />}
    </>
  );
}
