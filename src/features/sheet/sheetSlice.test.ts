import reducer, {
  setQuery,
  setStatusFilter,
  fetchTasks,
  updateTask,
  type SheetState,
} from './sheetSlice';
import type { Task } from '../../types';

const initial: SheetState = {
  tasks: [],
  loading: 'idle',
  error: null,
  query: '',
  statusFilter: 'all',
};

const sampleTask: Task = {
  id: 't-1',
  name: 'Sample',
  assignee: 'Alex Doe',
  status: 'not_started',
  priority: 'low',
  dueDate: '2026-07-01',
  progress: 0,
  hasAgentInsight: false,
};

describe('sheet reducer — synchronous actions', () => {
  it('updates the query', () => {
    const next = reducer(initial, setQuery('renderer'));
    expect(next.query).toBe('renderer');
  });

  it('updates the status filter', () => {
    const next = reducer(initial, setStatusFilter('blocked'));
    expect(next.statusFilter).toBe('blocked');
  });
});

describe('sheet reducer — fetchTasks lifecycle', () => {
  it('flips to pending and clears any prior error', () => {
    const errored = { ...initial, error: 'boom', loading: 'failed' as const };
    const next = reducer(errored, { type: fetchTasks.pending.type });
    expect(next.loading).toBe('pending');
    expect(next.error).toBeNull();
  });

  it('stores tasks on fulfilled', () => {
    const next = reducer(initial, {
      type: fetchTasks.fulfilled.type,
      payload: [sampleTask],
    });
    expect(next.loading).toBe('succeeded');
    expect(next.tasks).toHaveLength(1);
  });

  it('records the error message on rejected', () => {
    const next = reducer(initial, {
      type: fetchTasks.rejected.type,
      error: { message: 'network down' },
    });
    expect(next.loading).toBe('failed');
    expect(next.error).toBe('network down');
  });
});

describe('sheet reducer — updateTask.fulfilled', () => {
  it('replaces the matching task in place', () => {
    const withTask = { ...initial, tasks: [sampleTask] };
    const updated: Task = { ...sampleTask, status: 'complete', progress: 100 };
    const next = reducer(withTask, {
      type: updateTask.fulfilled.type,
      payload: updated,
    });
    expect(next.tasks[0].status).toBe('complete');
    expect(next.tasks[0].progress).toBe(100);
  });

  it('leaves state untouched when id is unknown', () => {
    const withTask = { ...initial, tasks: [sampleTask] };
    const next = reducer(withTask, {
      type: updateTask.fulfilled.type,
      payload: { ...sampleTask, id: 'other', status: 'blocked' },
    });
    expect(next.tasks[0].status).toBe('not_started');
  });
});
