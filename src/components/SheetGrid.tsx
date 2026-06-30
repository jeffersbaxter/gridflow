import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTasks, updateTask } from '../features/sheet/sheetSlice';
import { fetchInsights } from '../features/agents/agentsSlice';
import {
  selectError,
  selectLoading,
  selectVisibleTasks,
} from '../features/sheet/selectors';
import { TaskRow } from './TaskRow';
import type { AgentInsight } from '../types';

export function SheetGrid() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectVisibleTasks);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const insights = useAppSelector((s) => s.agents.insights);

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchInsights());
  }, [dispatch]);

  const insightFor = (taskId: string): AgentInsight | undefined =>
    insights.find((i) => i.taskId === taskId);

  // Acting on an automation insight nudges its task forward — a tiny taste of
  // "agents doing the manual work" so the demo feels alive.
  const onActOnInsight = (insight: AgentInsight) => {
    dispatch(updateTask({ id: insight.taskId, patch: { status: 'in_progress', progress: 60 } }));
  };

  if (loading === 'pending' || loading === 'idle') {
    return (
      <div className="grid" aria-busy="true" aria-label="Loading tasks">
        <GridHead />
        {Array.from({ length: 5 }).map((_, i) => (
          <div className="skeleton-row" key={i} />
        ))}
      </div>
    );
  }

  if (loading === 'failed') {
    return (
      <div className="grid">
        <div className="state">
          <div className="state__title">We couldn’t load this sheet</div>
          <p>{error ?? 'Something went wrong.'} Refresh to try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid">
      <GridHead />
      {tasks.length === 0 ? (
        <div className="state">
          <div className="state__title">No tasks match your filters</div>
          <p>Clear the search or pick a different status to see more.</p>
        </div>
      ) : (
        tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            insight={insightFor(task.id)}
            onActOnInsight={onActOnInsight}
          />
        ))
      )}
    </div>
  );
}

function GridHead() {
  return (
    <div className="grid__head" role="row">
      <div>Task</div>
      <div>Assignee</div>
      <div>Status</div>
      <div>Priority</div>
      <div>Progress</div>
      <div>Detail</div>
    </div>
  );
}
