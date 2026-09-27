/**
 * Fair-Use Rate Limiter & Request Throttler
 * 
 * Ensures external APIs (Nominatim, Overpass) are not hammered and strictly
 * comply with fair use policies (max 1 request per second per domain).
 */

class RateLimiter {
  private lastRequestTimes: Map<string, number> = new Map();
  private queues: Map<string, Array<() => void>> = new Map();
  private processing: Map<string, boolean> = new Map();

  /**
   * Executes a task ensuring at least minIntervalMs has passed since the last
   * execution for the given domain key.
   */
  public async schedule<T>(domainKey: string, task: () => Promise<T>, minIntervalMs: number = 1100): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (!this.queues.has(domainKey)) {
        this.queues.set(domainKey, []);
      }

      const queue = this.queues.get(domainKey)!;
      queue.push(async () => {
        try {
          const now = Date.now();
          const lastTime = this.lastRequestTimes.get(domainKey) || 0;
          const waitTime = Math.max(0, minIntervalMs - (now - lastTime));

          if (waitTime > 0) {
            await new Promise((r) => setTimeout(r, waitTime));
          }

          this.lastRequestTimes.set(domainKey, Date.now());
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });

      this.processQueue(domainKey);
    });
  }

  private async processQueue(domainKey: string) {
    if (this.processing.get(domainKey)) return;
    this.processing.set(domainKey, true);

    const queue = this.queues.get(domainKey);
    while (queue && queue.length > 0) {
      const task = queue.shift();
      if (task) {
        await task();
      }
    }

    this.processing.set(domainKey, false);
  }
}

export const rateLimiter = new RateLimiter();

export const NESTFIT_USER_AGENT = 'NestFit-Location-Intelligence/2.0 (vaibhav@nestfit.app; multi-city urban research engine)';
