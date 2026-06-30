import { useAppSelector } from '../store/hooks';
import {
  selectCompletionRate,
  selectInsightCount,
  selectVisibleTasks,
} from '../features/sheet/selectors';

export function StatStrip() {
  const visible = useAppSelector(selectVisibleTasks);
  const completion = useAppSelector(selectCompletionRate);
  const insights = useAppSelector(selectInsightCount);

  return (
    <div className="stats" role="group" aria-label="Project summary">
      <div className="stat">
        <div className="stat__value">{visible.length}</div>
        <div className="stat__label">Tasks in view</div>
      </div>
      <div className="stat">
        <div className="stat__value">{completion}%</div>
        <div className="stat__label">Avg completion</div>
      </div>
      <div className="stat">
        <div className="stat__value stat__value--magic">{insights}</div>
        <div className="stat__label">Agent insights</div>
      </div>
    </div>
  );
}
