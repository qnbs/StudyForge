import { toast } from 'sonner';
import type { ErrorResponse } from 'zotero-api-client';

const MIN_DELAY_MS = 1200;
let lastRequestTime = 0;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitter(base: number): number {
  return base + Math.random() * 300;
}

function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as ErrorResponse & { status?: number };
  const status =
    err.response?.status ??
    err.status ??
    (err as { response?: { status?: number } }).response?.status;
  return status === 429;
}

function getRetryAfterSeconds(error: unknown): number {
  if (!error || typeof error !== 'object') return 5;
  const err = error as ErrorResponse;
  const headers = err.response?.headers;
  if (!headers) return 5;
  const raw =
    typeof headers.get === 'function'
      ? headers.get('Retry-After')
      : (headers as Record<string, string>)['Retry-After'];
  const parsed = parseInt(String(raw ?? '5'), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
}

/**
 * Wrapper for Zotero API calls with spacing and 429 retry.
 */
export async function withRateLimit<T>(
  requestFn: () => Promise<T>,
  context: string = 'Zotero Request',
  maxRetries: number = 5
): Promise<T> {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const now = Date.now();
      const timeSinceLast = now - lastRequestTime;
      if (timeSinceLast < MIN_DELAY_MS) {
        await sleep(MIN_DELAY_MS - timeSinceLast);
      }

      const result = await requestFn();
      lastRequestTime = Date.now();
      return result;
    } catch (error: unknown) {
      attempt++;

      if (isRateLimitError(error) && attempt <= maxRetries) {
        const retryAfter = getRetryAfterSeconds(error);
        const waitMs = Math.max(retryAfter * 1000, jitter(2000 * Math.pow(1.8, attempt - 1)));

        console.warn(
          `[Zotero Rate Limit] ${context} → wait ${Math.round(waitMs / 1000)}s (${attempt}/${maxRetries})`
        );

        toast.warning(
          `Zotero rate limit reached. Waiting ${Math.round(waitMs / 1000)} seconds...`,
          { description: `Attempt ${attempt} of ${maxRetries}` }
        );

        await sleep(waitMs);
        continue;
      }

      if (attempt > maxRetries) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Zotero] ${context} failed after ${maxRetries} attempts:`, error);
        toast.error(`Zotero sync failed: ${message}`);
        throw error;
      }

      const backoff = jitter(1000 * Math.pow(2, attempt - 1));
      await sleep(backoff);
    }
  }

  throw new Error(`${context} failed after ${maxRetries} attempts`);
}

export async function rateLimitedZoteroRequest<T>(
  requestFn: () => Promise<T>,
  context: string
): Promise<T> {
  return withRateLimit(requestFn, context);
}

/** Reset spacing clock (for tests). */
export function resetRateLimiterState(): void {
  lastRequestTime = 0;
}
