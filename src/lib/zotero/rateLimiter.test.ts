import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRateLimit, resetRateLimiterState } from './rateLimiter';

vi.mock('sonner', () => ({
  toast: {
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

describe('rateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetRateLimiterState();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns result on first successful request', async () => {
    const result = await withRateLimit(async () => 'ok', 'Test', 3);
    expect(result).toBe('ok');
  });

  it('retries after 429 rate limit', async () => {
    let calls = 0;
    const promise = withRateLimit(
      async () => {
        calls++;
        if (calls === 1) {
          const err = new Error('Rate limited') as Error & {
            response?: { status: number; headers: { get: (k: string) => string } };
          };
          err.response = {
            status: 429,
            headers: { get: () => '1' },
          };
          throw err;
        }
        return 'success';
      },
      'Retry test',
      5
    );

    await vi.runAllTimersAsync();
    const result = await promise;
    expect(result).toBe('success');
    expect(calls).toBe(2);
  });
});
