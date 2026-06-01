import { describe, it, expect, vi, beforeEach } from 'vitest';

import { entities } from '../createEntityAPI';
import { API_BASE } from '../transport';

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return { ok, status, statusText: ok ? 'OK' : 'Error', json: async () => body };
}

function lastSupabaseBody(callIndex = 0) {
  const [url, opts] = global.fetch.mock.calls[callIndex];
  expect(url).toBe(`${API_BASE}/functions/supabase`);
  return JSON.parse(opts.body);
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('entities / db contract over the supabase function', () => {
  it('list() selects with default sort + limit and returns rows', async () => {
    global.fetch = vi.fn(async () => jsonResponse({ data: [{ id: 1 }] }));

    const rows = await entities.UserProfile.list();

    expect(lastSupabaseBody()).toEqual({
      action: 'select',
      table: 'user_profiles',
      query: { limit: 50, order: { column: 'created_at', ascending: false } },
    });
    expect(rows).toEqual([{ id: 1 }]);
  });

  it('filter() applies filter, default descending sort and limit 500', async () => {
    global.fetch = vi.fn(async () => jsonResponse({ data: [] }));

    await entities.FoodLog.filter({ user_email: 'a@b.c' });

    expect(lastSupabaseBody()).toEqual({
      action: 'select',
      table: 'food_logs',
      query: { filter: { user_email: 'a@b.c' }, limit: 500, order: { column: 'created_date', ascending: false } },
    });
  });

  it('filter() honours an ascending sort column and custom limit', async () => {
    global.fetch = vi.fn(async () => jsonResponse({ data: [] }));

    await entities.FoodLog.filter({}, 'created_date', 10);

    expect(lastSupabaseBody()).toEqual({
      action: 'select',
      table: 'food_logs',
      query: { filter: {}, limit: 10, order: { column: 'created_date', ascending: true } },
    });
  });

  it('create() inserts and returns the first row', async () => {
    global.fetch = vi.fn(async () => jsonResponse({ data: [{ id: 9, a: 1 }] }));

    const created = await entities.Workout.create({ a: 1 });

    expect(lastSupabaseBody()).toEqual({ action: 'insert', table: 'workouts', data: { a: 1 } });
    expect(created).toEqual({ id: 9, a: 1 });
  });

  it('bulkCreate() inserts an array and returns all rows', async () => {
    global.fetch = vi.fn(async () => jsonResponse({ data: [{ id: 1 }, { id: 2 }] }));

    const created = await entities.Workout.bulkCreate([{ a: 1 }, { a: 2 }]);

    expect(lastSupabaseBody()).toEqual({ action: 'insert', table: 'workouts', data: [{ a: 1 }, { a: 2 }] });
    expect(created).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('update() updates by id and returns the first row', async () => {
    global.fetch = vi.fn(async () => jsonResponse({ data: [{ id: '7', a: 1 }] }));

    const updated = await entities.Workout.update('7', { a: 1 });

    expect(lastSupabaseBody()).toEqual({
      action: 'update',
      table: 'workouts',
      data: { a: 1 },
      query: { filter: { id: '7' } },
    });
    expect(updated).toEqual({ id: '7', a: 1 });
  });

  it('upsert() passes onConflict and returns the first row', async () => {
    global.fetch = vi.fn(async () => jsonResponse({ data: [{ id: '7' }] }));

    await entities.Workout.upsert({ user_email: 'a@b.c' }, 'user_email');

    expect(lastSupabaseBody()).toEqual({
      action: 'upsert',
      table: 'workouts',
      data: { user_email: 'a@b.c' },
      query: { onConflict: 'user_email' },
    });
  });

  it('delete() deletes by id and returns true', async () => {
    global.fetch = vi.fn(async () => jsonResponse({ data: [] }));

    const ok = await entities.Workout.delete('3');

    expect(lastSupabaseBody()).toEqual({
      action: 'delete',
      table: 'workouts',
      query: { filter: { id: '3' } },
    });
    expect(ok).toBe(true);
  });

  it('get() selects a single row by id', async () => {
    global.fetch = vi.fn(async () => jsonResponse({ data: [{ id: '3' }] }));

    const row = await entities.Workout.get('3');

    expect(lastSupabaseBody()).toEqual({
      action: 'select',
      table: 'workouts',
      query: { filter: { id: '3' }, limit: 1 },
    });
    expect(row).toEqual({ id: '3' });
  });

  it('UserProgress falls back to user_points and maps the legacy fields', async () => {
    global.fetch = vi
      .fn()
      // first call: user_progress select fails with an in-body error
      .mockImplementationOnce(async () => jsonResponse({ error: 'relation "user_progress" does not exist' }))
      // fallback call: user_points returns legacy column names
      .mockImplementationOnce(async () => jsonResponse({ data: [{ total_points: 50, level: 2, daily_streak: 4 }] }));

    const rows = await entities.UserProgress.list();

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(JSON.parse(global.fetch.mock.calls[0][1].body).table).toBe('user_progress');
    expect(JSON.parse(global.fetch.mock.calls[1][1].body).table).toBe('user_points');
    expect(rows[0]).toMatchObject({ total_xp: 50, nivel: 2, streak_dias: 4 });
  });
});
