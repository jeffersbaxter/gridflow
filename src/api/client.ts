import type {
  ApiListResponse,
  AgentInsight,
  Task,
  TaskPatch,
  TaskStatus,
  Priority,
} from '../types';

// ---------------------------------------------------------------------------
// Mock API layer. In production these calls hit Kotlin/Java services on AWS;
// here we simulate them with in-memory data and latency so the Redux thunks,
// loading states, and contract tests all behave like the real thing.
// ---------------------------------------------------------------------------

const STATUSES: TaskStatus[] = ['not_started', 'in_progress', 'blocked', 'complete'];
const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];

const tasks: Task[] = [
  { id: 't-1', name: 'Define Q3 roadmap', assignee: 'Priya Anand', status: 'complete', priority: 'high', dueDate: '2026-06-20', progress: 100, hasAgentInsight: false },
  { id: 't-2', name: 'Migrate grid renderer to virtualized list', assignee: 'Marcus Lee', status: 'in_progress', priority: 'critical', dueDate: '2026-07-10', progress: 55, hasAgentInsight: true },
  { id: 't-3', name: 'Design agent insight panel', assignee: 'Dana Cruz', status: 'in_progress', priority: 'medium', dueDate: '2026-07-08', progress: 40, hasAgentInsight: true },
  { id: 't-4', name: 'Wire up CI/CD deploy stage', assignee: 'Sam Okoro', status: 'blocked', priority: 'high', dueDate: '2026-07-02', progress: 15, hasAgentInsight: true },
  { id: 't-5', name: 'Write E2E test for sharing flow', assignee: 'Jordan Kim', status: 'not_started', priority: 'medium', dueDate: '2026-07-18', progress: 0, hasAgentInsight: false },
  { id: 't-6', name: 'Accessibility audit of toolbar', assignee: 'Priya Anand', status: 'not_started', priority: 'low', dueDate: '2026-07-25', progress: 0, hasAgentInsight: false },
];

const insights: AgentInsight[] = [
  { id: 'a-1', taskId: 't-2', kind: 'risk', message: 'Velocity suggests this slips ~3 days. Consider splitting the renderer migration into a read-only pass first.', confidence: 0.82 },
  { id: 'a-2', taskId: 't-3', kind: 'summary', message: '2 open design comments resolved overnight. Panel spec is ready for engineering handoff.', confidence: 0.91 },
  { id: 'a-3', taskId: 't-4', kind: 'automation', message: 'Blocked on a failing lint rule. I can open a PR pinning the ESLint version — approve to automate.', confidence: 0.76 },
];

const LATENCY = 700;
const delay = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY));

// Failure injection. Lets the UI (a "simulate server failure" toggle) and the
// tests deterministically exercise the optimistic-update rollback path without
// depending on flaky real-world network errors.
let failNextPatchFlag = false;
export function failNextPatch(shouldFail = true): void {
  failNextPatchFlag = shouldFail;
}

function stamp<T>(data: T[]): ApiListResponse<T> {
  return { data, meta: { total: data.length, generatedAt: new Date().toISOString() } };
}

export const api = {
  async listTasks(): Promise<ApiListResponse<Task>> {
    return delay(stamp(tasks.map((t) => ({ ...t }))));
  },

  async listInsights(): Promise<ApiListResponse<AgentInsight>> {
    return delay(stamp(insights.map((i) => ({ ...i }))));
  },

  async patchTask(id: string, patch: TaskPatch): Promise<Task> {
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) {
      throw new Error(`Task ${id} not found`);
    }
    // Simulate a transient server-side write failure on demand. Reject after a
    // short delay so the optimistic update has already been rendered.
    if (failNextPatchFlag) {
      failNextPatchFlag = false;
      await delay(null);
      throw new Error('The server rejected this change. Try again.');
    }
    const next: Task = { ...tasks[idx], ...patch };
    // Server-side rule: completing a task forces progress to 100 and vice versa.
    if (patch.status === 'complete') next.progress = 100;
    if (patch.progress === 100) next.status = 'complete';
    tasks[idx] = next;
    return delay({ ...next });
  },
};

// Validation helpers — used by the contract tests to assert the shape of the
// JSON the client relies on. Exported so server fixtures can be checked too.
export function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    typeof t.name === 'string' &&
    typeof t.assignee === 'string' &&
    typeof t.status === 'string' &&
    STATUSES.includes(t.status as TaskStatus) &&
    typeof t.priority === 'string' &&
    PRIORITIES.includes(t.priority as Priority) &&
    typeof t.dueDate === 'string' &&
    typeof t.progress === 'number' &&
    t.progress >= 0 &&
    t.progress <= 100 &&
    typeof t.hasAgentInsight === 'boolean'
  );
}

export const __testHelpers = { STATUSES, PRIORITIES };
