import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import type { AgentInsight } from '../../types';

export interface AgentsState {
  insights: AgentInsight[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
}

const initialState: AgentsState = { insights: [], loading: 'idle' };

export const fetchInsights = createAsyncThunk('agents/fetchInsights', async () => {
  const res = await api.listInsights();
  return res.data;
});

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInsights.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchInsights.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.insights = action.payload;
      })
      .addCase(fetchInsights.rejected, (state) => {
        state.loading = 'failed';
      });
  },
});

export default agentsSlice.reducer;
