// ---------------------------------------------------------------------------
// Domain model — the JSON contract shared between the React client and the
// (mocked) Kotlin/Java back-end services. Keeping this in one place makes the
// API contract explicit and testable (see api/contract.test.ts).
// ---------------------------------------------------------------------------

export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'complete';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

/** A single row in the project grid. Mirrors the server JSON shape exactly. */
export interface Task {
  id: string;
  name: string;
  assignee: string;
  status: TaskStatus;
  priority: Priority;
  /** ISO-8601 date string, e.g. "2026-07-15". */
  dueDate: string;
  /** 0–100 completion percentage. */
  progress: number;
  /** Whether an AI agent currently has an open suggestion on this row. */
  hasAgentInsight: boolean;
}

/** An AI agent suggestion attached to a task — the "magic at work" layer. */
export interface AgentInsight {
  id: string;
  taskId: string;
  kind: 'risk' | 'automation' | 'summary';
  message: string;
  /** Model confidence, 0–1. */
  confidence: number;
}

/** Standard envelope returned by every list endpoint. */
export interface ApiListResponse<T> {
  data: T[];
  meta: {
    total: number;
    /** Server-generated ISO timestamp. */
    generatedAt: string;
  };
}

/** Payload accepted by PATCH /tasks/:id — every field optional. */
export type TaskPatch = Partial<
  Pick<Task, 'name' | 'assignee' | 'status' | 'priority' | 'dueDate' | 'progress'>
>;
