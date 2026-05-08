// Copy this file to src/services/retryUtil.ts when first adding an external service.

interface RetryOpts {
  retries?: number    // max attempts after the first (default: 3)
  backoff?: number    // base delay in ms for exponential backoff (default: 300)
  timeout?: number    // per-attempt timeout in ms (default: 10000)
}

export async function withRetry<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  opts: RetryOpts = {},
): Promise<T> {
  const { retries = 3, backoff = 300, timeout = 10_000 } = opts
  let lastErr: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      const result = await fn(controller.signal)
      clearTimeout(timer)
      return result
    } catch (err) {
      clearTimeout(timer)
      lastErr = err

      if (attempt < retries) {
        const jitter = Math.random() * (backoff / 2)
        const delay  = backoff * Math.pow(2, attempt) + jitter
        console.warn('[retry]', `attempt ${attempt + 1}/${retries}`, (err as Error)?.message ?? err)
        await sleep(delay)
      }
    }
  }

  throw lastErr
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
