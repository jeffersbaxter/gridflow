import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import type { Task, TaskPatch, TaskStatus } from '../../types';

export interface SheetState {
  tasks: Task[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
  /** Free-text filter applied to task name + assignee. */
  query: string;
  /** Status filter; 'all' shows everything. */
  statusFilter: TaskStatus | 'all';
  /** IDs of rows with an in-flight optimistic write (used to show a pending cue). */
  pendingIds: string[];
  /** Snapshots of rows before an optimistic write, keyed by id, for rollback. */
  snapshots: Record<string, Task>;
  /** Transient message shown when an optimistic write is rolled back. */
  rollbackMessage: string | null;
}

const initialState: SheetState = {
  tasks: [],
  loading: 'idle',
  error: null,
  query: '',
  statusFilter: 'all',
  pendingIds: [],
  snapshots: {},
  rollbackMessage: null,
};

export const fetchTasks = createAsyncThunk('sheet/fetchTasks', async () => {
  const res = await api.listTasks();
  return res.data;
});

/**
 * Optimistic task update. The `pending` reducer snapshots the row and applies
 * the patch immediately so the grid feels instant. The thunk performs the
 * server write; on failure it rejects with a message and the `rejected` reducer
 * restores the snapshot. Snapshotting in the reducer (not the thunk) is
 * deliberate — the reducer sees the row *before* the optimistic mutation.
 */
export const updateTask = createAsyncThunk<
  Task,
  { id: string; patch: TaskPatch },
  { rejectValue: { id: string; message: string } }
>('sheet/updateTask', async ({ id, patch }, { rejectWithValue }) => {
  try {
    return await api.patchTask(id, patch);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return rejectWithValue({ id, message });
  }
});

const sheetSlice = createSlice({
  name: 'sheet',
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setStatusFilter(state, action: PayloadAction<TaskStatus | 'all'>) {
      state.statusFilter = action.payload;
    },
    dismissRollback(state) {
      state.rollbackMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message ?? 'Could not load tasks';
      })
      // Optimistic apply: snapshot the row, then patch it now.
      .addCase(updateTask.pending, (state, action) => {
        const { id, patch } = action.meta.arg;
        const idx = state.tasks.findIndex((t) => t.id === id);
        if (idx !== -1) {
          // Snapshot the pre-mutation row so rejected can restore it exactly.
          state.snapshots[id] = state.tasks[idx];
          const next = { ...state.tasks[idx], ...patch };
          if (patch.status === 'complete') next.progress = 100;
          if (patch.progress === 100) next.status = 'complete';
          state.tasks[idx] = next;
        }
        if (!state.pendingIds.includes(id)) state.pendingIds.push(id);
        state.rollbackMessage = null;
      })
      // Confirm: replace the optimistic row with the server's canonical version.
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = action.payload;
        state.pendingIds = state.pendingIds.filter((p) => p !== action.payload.id);
        delete state.snapshots[action.payload.id];
      })
      // Roll back: restore the snapshot and surface a message.
      .addCase(updateTask.rejected, (state, action) => {
        const payload = action.payload;
        if (payload) {
          const snapshot = state.snapshots[payload.id];
          const idx = state.tasks.findIndex((t) => t.id === payload.id);
          if (idx !== -1 && snapshot) state.tasks[idx] = snapshot;
          state.pendingIds = state.pendingIds.filter((p) => p !== payload.id);
          delete state.snapshots[payload.id];
          state.rollbackMessage = payload.message;
        }
      });
  },
});

export const { setQuery, setStatusFilter, dismissRollback } = sheetSlice.actions;
export default sheetSlice.reducer;
