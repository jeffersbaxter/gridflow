import reducer, {
  setQuery,
  setStatusFilter,
  dismissRollback,
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
  pendingIds: [],
  snapshots: {},
  rollbackMessage: null,
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

describe('sheet reducer — optimistic updateTask', () => {
  const withTask = { ...initial, tasks: [sampleTask] };

  it('applies the patch immediately on pending and marks the row in-flight', () => {
    const next = reducer(withTask, {
      type: updateTask.pending.type,
      meta: { arg: { id: 't-1', patch: { status: 'in_progress' } } },
    });
    expect(next.tasks[0].status).toBe('in_progress');
    expect(next.pendingIds).toContain('t-1');
  });

  it('enforces the complete⇄100% rule during the optimistic apply', () => {
    const next = reducer(withTask, {
      type: updateTask.pending.type,
      meta: { arg: { id: 't-1', patch: { status: 'complete' } } },
    });
    expect(next.tasks[0].progress).toBe(100);
  });

  it('confirms with the server row and clears the in-flight flag on fulfilled', () => {
    const pending = reducer(withTask, {
      type: updateTask.pending.type,
      meta: { arg: { id: 't-1', patch: { status: 'in_progress' } } },
    });
    const confirmed: Task = { ...sampleTask, status: 'in_progress', progress: 30 };
    const next = reducer(pending, {
      type: updateTask.fulfilled.type,
      payload: confirmed,
    });
    expect(next.tasks[0].progress).toBe(30);
    expect(next.pendingIds).not.toContain('t-1');
  });

  it('rolls back to the snapshot and surfaces a message on rejected', () => {
    // First optimistically move the row to 'complete'/100 — this also snapshots.
    const pending = reducer(withTask, {
      type: updateTask.pending.type,
      meta: { arg: { id: 't-1', patch: { status: 'complete' } } },
    });
    expect(pending.tasks[0].status).toBe('complete');
    expect(pending.snapshots['t-1']).toBeDefined();

    // …then the server rejects; the reducer restores its own snapshot.
    const next = reducer(pending, {
      type: updateTask.rejected.type,
      payload: { id: 't-1', message: 'Server said no' },
    });
    expect(next.tasks[0].status).toBe('not_started');
    expect(next.tasks[0].progress).toBe(0);
    expect(next.pendingIds).not.toContain('t-1');
    expect(next.snapshots['t-1']).toBeUndefined();
    expect(next.rollbackMessage).toBe('Server said no');
  });

  it('clears the rollback message via dismissRollback', () => {
    const errored = { ...withTask, rollbackMessage: 'Server said no' };
    const next = reducer(errored, dismissRollback());
    expect(next.rollbackMessage).toBeNull();
  });
});
