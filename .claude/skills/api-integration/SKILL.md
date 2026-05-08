---
name: api-integration
description: Use whenever integrating an external API — fetching data from a third-party system,
  building an API client or connector, adding a new external data source, calling a REST/GraphQL
  endpoint outside of Dataverse, or wiring up any system that requires API keys or tokens.
  Auto-triggers on prompts like "integrate X API", "fetch from Y service", "call the Z endpoint",
  "add API client for…", "connect to the … service", or any mention of external HTTP calls in
  this project. Always invoke this skill before writing a single line of service or fetch code.
---

# API Integration Skill

Every external API integration in this project MUST follow the seven rules below.
These are not suggestions — they protect production users, prevent data leaks, and make debugging possible.

Read `reference/api-patterns.md` for copy-paste scaffolding.
Read `reference/retry-utility.ts` for the retry/timeout utility.

---

## Seven Non-Negotiable Rules

### 1. Never expose secrets
API keys, tokens, and credentials live **only** in environment variables.

```ts
// ✓ correct
const API_KEY = import.meta.env.VITE_MY_SERVICE_KEY

// ✗ never do this
const API_KEY = 'sk-abc123...'
```

- Add the variable to `.env.local` (gitignored) — never to `.env` checked into git
- Declare the type in `src/vite-env.d.ts` so TypeScript knows the variable exists
- If the key is missing at startup, log a visible warning — don't silently fail later:
  ```ts
  if (!API_KEY) console.warn('[MyService] VITE_MY_SERVICE_KEY is not set')
  ```

### 2. Respect rate limits; cache responses
- Keep a module-level `Map` cache keyed on the request parameters
- Set a sensible `CACHE_TTL_MS` (default: 5 minutes for read-only data)
- Return stale cache rather than hitting the API again within the TTL
- If the API documents a rate limit header (`X-RateLimit-Remaining`), read it and back off

```ts
private static cache = new Map<string, { data: unknown; ts: number }>()
private static readonly CACHE_TTL_MS = 5 * 60 * 1000

private static cached<T>(key: string, data: T): T {
  this.cache.set(key, { data, ts: Date.now() })
  return data
}
private static fromCache<T>(key: string): T | null {
  const entry = this.cache.get(key)
  return entry && Date.now() - entry.ts < this.CACHE_TTL_MS ? (entry.data as T) : null
}
```

### 3. Always handle failures (timeouts, retries, fallback)
- Wrap every `fetch()` call with `withRetry()` from `reference/retry-utility.ts`
- Set an explicit timeout (default: 10 s) — never let a request hang forever
- After max retries, return a typed error result — don't throw to the component
- Provide a fallback value (`data: null`) so the UI can show an empty state

See `reference/api-patterns.md` for the full service scaffold.

### 4. Validate and sanitise all data
Never trust API responses. Parse them through a type guard before using any field.

```ts
function isMyModel(x: unknown): x is MyModel {
  return (
    typeof x === 'object' && x !== null &&
    typeof (x as MyModel).id === 'string' &&
    typeof (x as MyModel).name === 'string'
  )
}
// Usage
if (!isMyModel(json)) throw new Error('Unexpected response shape')
```

For list responses: filter out invalid items rather than crashing on one bad record:
```ts
const valid = rawList.filter(isMyModel)
```

### 5. Keep the UI responsive (loading states)
Every component that calls an external API must expose three states:

```ts
const [data,     setData]     = useState<MyModel[] | null>(null)
const [loading,  setLoading]  = useState(true)
const [error,    setError]    = useState<string | null>(null)
const [retrying, setRetrying] = useState(false)
```

- Show a spinner or skeleton while `loading` is true
- Show an inline error banner (not a modal) when `error` is set
- Use the `let active = true` cleanup flag to prevent setState on unmounted components
- Never block the render — keep all API calls in `useEffect`

### 6. Log and monitor all API interactions
Log every call with enough context to debug without re-running:

```ts
const t0 = performance.now()
// ... fetch ...
console.info('[MyService] getAll', { status: res.status, durationMs: Math.round(performance.now() - t0) })
```

Rules:
- **Never** log API keys, tokens, or user PII
- Log on success (INFO) and on failure (ERROR) — not just on failure
- Include `durationMs` so you can spot slow endpoints
- Use `[ServiceName]` prefix so logs are filterable in DevTools

### 7. Follow API versioning and terms
- Pin the API version in `BASE_URL` or as a constant — never leave it unversioned
- Read the API's deprecation notices; don't silently break when a field disappears
- Honour the API's `robots.txt` / terms regarding scraping and caching

---

## Service File Shape

Custom external service files live in `src/services/`. Never put API logic inside a component.

```
src/services/
└── MyExternalService.ts    ← one file per external system
```

Naming: `<SystemName>Service.ts` — e.g. `OpenAIService.ts`, `WeatherService.ts`.

See `reference/api-patterns.md` for the full scaffold template.

---

## Checklist — before marking any API integration done

- [ ] No secret is hardcoded — all credentials come from `import.meta.env.VITE_*`
- [ ] Response is cached with a TTL
- [ ] All calls go through `withRetry()` with a timeout
- [ ] Response shape is validated with a type guard
- [ ] Component shows loading, error, and retrying states
- [ ] Every call is logged (success + failure) with `[ServiceName]` prefix and `durationMs`
- [ ] API version is pinned in `BASE_URL` or a constant

---

## And use skills\analyze-and-normalize-apidata skill for implementation

## What NOT to do

- Don't call `fetch()` directly inside a component — always go through a service class
- Don't `JSON.parse(await res.text())` — use `await res.json()` then validate the shape
- Don't swallow errors with an empty catch — at minimum, log and set the error state
- Don't share a single AbortController across multiple calls — create one per call
- Don't hardcode `localhost` URLs — use `import.meta.env.VITE_*` for base URLs too
- Don't log the full response body if it may contain tokens or user data
- Don't skip the cache just because "it's a one-off" — future calls will thank you
