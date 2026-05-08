# API Integration Patterns

Copy-paste scaffolding for service files, React loading state, type guards, and env declarations.

---

## Service File Scaffold

Create `src/services/MyExternalService.ts` — replace `MyExternal` and `MyModel` with the real names.

```ts
import { withRetry } from './retryUtil'

// --- Types ---

export interface MyModel {
  id: string
  name: string
  // add fields from the API response here
}

export interface ApiResult<T> {
  data: T | null
  error: string | null
  fromCache: boolean
}

// --- Service ---

const BASE_URL = 'https://api.example.com/v1'  // always pin the version
const API_KEY  = import.meta.env.VITE_MY_SERVICE_KEY

if (!API_KEY) console.warn('[MyExternalService] VITE_MY_SERVICE_KEY is not set')

export class MyExternalService {
  private static cache = new Map<string, { data: unknown; ts: number }>()
  private static readonly CACHE_TTL_MS = 5 * 60 * 1000  // 5 minutes

  private static fromCache<T>(key: string): T | null {
    const entry = this.cache.get(key)
    return entry && Date.now() - entry.ts < this.CACHE_TTL_MS ? (entry.data as T) : null
  }

  private static setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, ts: Date.now() })
  }

  static async getAll(): Promise<ApiResult<MyModel[]>> {
    const cacheKey = 'getAll'
    const cached = this.fromCache<MyModel[]>(cacheKey)
    if (cached) return { data: cached, error: null, fromCache: true }

    const t0 = performance.now()
    try {
      const raw = await withRetry(() =>
        fetch(`${BASE_URL}/items`, {
          headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        })
      )
      if (!raw.ok) throw new Error(`HTTP ${raw.status}`)
      const json: unknown = await raw.json()

      if (!Array.isArray(json)) throw new Error('Expected array response')
      const valid = json.filter(isMyModel)

      this.setCache(cacheKey, valid)
      console.info('[MyExternalService] getAll', { status: raw.status, durationMs: Math.round(performance.now() - t0) })
      return { data: valid, error: null, fromCache: false }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[MyExternalService] getAll failed', { message, durationMs: Math.round(performance.now() - t0) })
      return { data: null, error: message, fromCache: false }
    }
  }

  static async getById(id: string): Promise<ApiResult<MyModel>> {
    const cacheKey = `getById:${id}`
    const cached = this.fromCache<MyModel>(cacheKey)
    if (cached) return { data: cached, error: null, fromCache: true }

    const t0 = performance.now()
    try {
      const raw = await withRetry(() =>
        fetch(`${BASE_URL}/items/${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${API_KEY}` },
        })
      )
      if (!raw.ok) throw new Error(`HTTP ${raw.status}`)
      const json: unknown = await raw.json()
      if (!isMyModel(json)) throw new Error('Unexpected response shape')

      this.setCache(cacheKey, json)
      console.info('[MyExternalService] getById', { id, status: raw.status, durationMs: Math.round(performance.now() - t0) })
      return { data: json, error: null, fromCache: false }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[MyExternalService] getById failed', { id, message, durationMs: Math.round(performance.now() - t0) })
      return { data: null, error: message, fromCache: false }
    }
  }
}
```

---

## Type Guard Template

Narrow the unknown API response to your model before accessing any field.

```ts
function isMyModel(x: unknown): x is MyModel {
  return (
    typeof x === 'object' && x !== null &&
    typeof (x as MyModel).id === 'string' &&
    typeof (x as MyModel).name === 'string'
    // add one check per required field
  )
}
```

For deeper objects, compose guards:

```ts
function isAddress(x: unknown): x is Address {
  return typeof x === 'object' && x !== null &&
    typeof (x as Address).city === 'string'
}

function isMyModel(x: unknown): x is MyModel {
  return isAddress((x as MyModel)?.address) && ...
}
```

---

## React Loading / Error / Retrying State Pattern

```tsx
import { useEffect, useState } from 'react'
import { MyExternalService, type MyModel } from '../services/MyExternalService'

export function MyComponent() {
  const [data,     setData]     = useState<MyModel[] | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  const load = () => {
    let active = true
    setLoading(true)
    setError(null)
    setRetrying(false)

    MyExternalService.getAll().then(result => {
      if (!active) return
      if (result.error) {
        setError(result.error)
      } else {
        setData(result.data)
      }
      setLoading(false)
    })

    return () => { active = false }
  }

  useEffect(load, [])

  if (loading) return <div className="loading-spinner" />

  if (error) return (
    <div className="error-banner">
      <span>{error}</span>
      <button onClick={() => { setRetrying(true); load() }}>Retry</button>
    </div>
  )

  return (
    <ul>
      {(data ?? []).map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  )
}
```

---

## Env Variable Declaration

Extend `src/vite-env.d.ts` so TypeScript knows the variable exists:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MY_SERVICE_KEY: string
  // add one line per secret
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

Add the variable to `.env.local` (gitignored — never commit this file):

```
VITE_MY_SERVICE_KEY=your-key-here
```

---

## Retry Utility Import

The retry utility lives alongside each service file:

```ts
// src/services/retryUtil.ts  ← copy from reference/retry-utility.ts once
import { withRetry } from './retryUtil'
```

See `reference/retry-utility.ts` for the implementation to copy.
