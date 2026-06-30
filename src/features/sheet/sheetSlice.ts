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
}

const initialState: SheetState = {
  tasks: [],
  loading: 'idle',
  error: null,
  query: '',
  statusFilter: 'all',
};

export const fetchTasks = createAsyncThunk('sheet/fetchTasks', async () => {
  const res = await api.listTasks();
  return res.data;
});

export const updateTask = createAsyncThunk(
  'sheet/updateTask',
  async ({ id, patch }: { id: string; patch: TaskPatch }) => {
    return api.patchTask(id, patch);
  }
);

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
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      });
  },
});

export const { setQuery, setStatusFilter } = sheetSlice.actions;
export default sheetSlice.reducer;
