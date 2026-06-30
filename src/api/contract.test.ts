import { api, isTask, __testHelpers } from './client';
import type { ApiListResponse, Task } from '../types';

// ---------------------------------------------------------------------------
// API contract tests. These assert the *shape* of the JSON the back-end
// promises — the same guarantees you'd codify in a Postman contract test or a
// consumer-driven contract. If a server ever drifts from this shape, these
// fail before the UI does.
// ---------------------------------------------------------------------------

function expectListEnvelope<T>(res: ApiListResponse<T>) {
  expect(res).toHaveProperty('data');
  expect(Array.isArray(res.data)).toBe(true);
  expect(res).toHaveProperty('meta');
  expect(res.meta.total).toBe(res.data.length);
  // generatedAt must be a valid ISO timestamp.
  expect(Number.isNaN(Date.parse(res.meta.generatedAt))).toBe(false);
}

describe('GET /tasks contract', () => {
  let res: ApiListResponse<Task>;

  beforeAll(async () => {
    res = await api.listTasks();
  });

  it('returns a well-formed list envelope', () => {
    expectListEnvelope(res);
    expect(res.data.length).toBeGreaterThan(0);
  });

  it('every row satisfies the Task contract', () => {
    for (const row of res.data) {
      expect(isTask(row)).toBe(true);
    }
  });

  it('constrains status and priority to the allowed enums', () => {
    for (const row of res.data) {
      expect(__testHelpers.STATUSES).toContain(row.status);
      expect(__testHelpers.PRIORITIES).toContain(row.priority);
    }
  });

  it('keeps progress within 0–100', () => {
    for (const row of res.data) {
      expect(row.progress).toBeGreaterThanOrEqual(0);
      expect(row.progress).toBeLessThanOrEqual(100);
    }
  });

  it('rejects malformed rows via the validator', () => {
    expect(isTask({ id: 't', name: 'x' })).toBe(false);
    expect(isTask({ ...res.data[0], status: 'archived' })).toBe(false);
    expect(isTask({ ...res.data[0], progress: 140 })).toBe(false);
    expect(isTask(null)).toBe(false);
  });
});

describe('GET /insights contract', () => {
  it('returns a valid envelope of insight objects', async () => {
    const res = await api.listInsights();
    expectListEnvelope(res);
    for (const i of res.data) {
      expect(typeof i.taskId).toBe('string');
      expect(['risk', 'automation', 'summary']).toContain(i.kind);
      expect(i.confidence).toBeGreaterThanOrEqual(0);
      expect(i.confidence).toBeLessThanOrEqual(1);
    }
  });
});

describe('PATCH /tasks/:id contract', () => {
  it('applies the patch and returns the updated row', async () => {
    const updated = await api.patchTask('t-5', { status: 'in_progress' });
    expect(updated.id).toBe('t-5');
    expect(updated.status).toBe('in_progress');
    expect(isTask(updated)).toBe(true);
  });

  it('enforces the complete⇄100% server rule', async () => {
    const a = await api.patchTask('t-6', { status: 'complete' });
    expect(a.progress).toBe(100);
    const b = await api.patchTask('t-5', { progress: 100 });
    expect(b.status).toBe('complete');
  });

  it('throws for an unknown id', async () => {
    await expect(api.patchTask('nope', { status: 'blocked' })).rejects.toThrow(
      /not found/
    );
  });
});
