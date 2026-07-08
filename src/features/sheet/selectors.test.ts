import {
  selectVisibleTasks,
  selectCompletionRate,
  selectInsightCount,
} from './selectors';
import type { RootState } from '../../store';
import type { Task } from '../../types';

const task = (over: Partial<Task>): Task => ({
  id: 'x',
  name: 'Task',
  assignee: 'Alex Doe',
  status: 'not_started',
  priority: 'medium',
  dueDate: '2026-07-01',
  progress: 0,
  hasAgentInsight: false,
  ...over,
});

function state(over: Partial<RootState['sheet']>): RootState {
  return {
    sheet: {
      tasks: [],
      loading: 'succeeded',
      error: null,
      query: '',
      statusFilter: 'all',
      pendingIds: [],
      snapshots: {},
      rollbackMessage: null,
      ...over,
    },
    agents: { insights: [], loading: 'idle' },
  } as RootState;
}

describe('selectVisibleTasks', () => {
  const tasks = [
    task({ id: '1', name: 'Migrate renderer', assignee: 'Marcus Lee', status: 'in_progress' }),
    task({ id: '2', name: 'Audit toolbar', assignee: 'Priya Anand', status: 'complete' }),
    task({ id: '3', name: 'Wire CI/CD', assignee: 'Sam Okoro', status: 'blocked' }),
  ];

  it('returns everything with no filters', () => {
    expect(selectVisibleTasks(state({ tasks }))).toHaveLength(3);
  });

  it('filters by case-insensitive name match', () => {
    const out = selectVisibleTasks(state({ tasks, query: 'migrate' }));
    expect(out.map((t) => t.id)).toEqual(['1']);
  });

  it('filters by assignee name', () => {
    const out = selectVisibleTasks(state({ tasks, query: 'priya' }));
    expect(out.map((t) => t.id)).toEqual(['2']);
  });

  it('filters by status', () => {
    const out = selectVisibleTasks(state({ tasks, statusFilter: 'blocked' }));
    expect(out.map((t) => t.id)).toEqual(['3']);
  });

  it('combines query and status filters', () => {
    const out = selectVisibleTasks(
      state({ tasks, query: 'wire', statusFilter: 'blocked' })
    );
    expect(out.map((t) => t.id)).toEqual(['3']);
    const none = selectVisibleTasks(
      state({ tasks, query: 'wire', statusFilter: 'complete' })
    );
    expect(none).toHaveLength(0);
  });
});

describe('selectCompletionRate', () => {
  it('returns 0 for an empty view', () => {
    expect(selectCompletionRate(state({ tasks: [] }))).toBe(0);
  });

  it('averages and rounds visible progress', () => {
    const tasks = [task({ progress: 50 }), task({ progress: 75 }), task({ progress: 0 })];
    // (50 + 75 + 0) / 3 = 41.67 -> 42
    expect(selectCompletionRate(state({ tasks }))).toBe(42);
  });
});

describe('selectInsightCount', () => {
  it('counts only tasks flagged with an agent insight', () => {
    const tasks = [
      task({ hasAgentInsight: true }),
      task({ hasAgentInsight: true }),
      task({ hasAgentInsight: false }),
    ];
    expect(selectInsightCount(state({ tasks }))).toBe(2);
  });
});
