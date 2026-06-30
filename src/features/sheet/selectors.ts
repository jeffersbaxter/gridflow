import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import type { Task } from '../../types';

const selectSheet = (state: RootState) => state.sheet;

export const selectAllTasks = (state: RootState) => state.sheet.tasks;
export const selectQuery = (state: RootState) => state.sheet.query;
export const selectStatusFilter = (state: RootState) => state.sheet.statusFilter;
export const selectLoading = (state: RootState) => state.sheet.loading;
export const selectError = (state: RootState) => state.sheet.error;

/** Tasks after applying the text query and status filter. */
export const selectVisibleTasks = createSelector([selectSheet], (sheet): Task[] => {
  const q = sheet.query.trim().toLowerCase();
  return sheet.tasks.filter((t) => {
    const matchesQuery =
      q === '' ||
      t.name.toLowerCase().includes(q) ||
      t.assignee.toLowerCase().includes(q);
    const matchesStatus =
      sheet.statusFilter === 'all' || t.status === sheet.statusFilter;
    return matchesQuery && matchesStatus;
  });
});

/** Aggregate completion across the *visible* rows, rounded to an integer. */
export const selectCompletionRate = createSelector(
  [selectVisibleTasks],
  (tasks): number => {
    if (tasks.length === 0) return 0;
    const sum = tasks.reduce((acc, t) => acc + t.progress, 0);
    return Math.round(sum / tasks.length);
  }
);

export const selectInsightCount = createSelector(
  [selectAllTasks],
  (tasks): number => tasks.filter((t) => t.hasAgentInsight).length
);
