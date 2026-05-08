import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { RammasAtWorkService } from '../services/RammasAtWorkService'

const ENDPOINT = import.meta.env.VITE_COPILOT_ENDPOINT as string | undefined
if (!ENDPOINT && import.meta.env.DEV) {
  console.warn('[CopilotData] VITE_COPILOT_ENDPOINT is not set — agent data will not load. Add it to .env.local')
}

// ── Shapes ────────────────────────────────────────────────────
export interface AgentDetail {
  cat_name?: string
  cat_agentid?: string
  cat_environmentname?: string
  cat_enduserauthenticationtype?: string
  cat_usesgenai?: boolean
  cat_usesactions?: boolean
  cat_agentcreateddate?: string
  cat_published?: boolean
  [key: string]: unknown
}

export interface AgentValue {
  cat_agentvalueid: string
  cat_name?: string
  cat_agentid?: string                 // FK → AgentDetail
  cat_agenttypes?: string              // Assistant | Advisor | Performer | Retriever | Orchestrator | Collaborator
  cat_agentbehaviors?: string          // Respond | Decide | Act | Sense | Collaborate | Reflect
  cat_agentvaluebenefit?: string       // Increased productivity | Smarter recommendations | …
  cat_environmentdisplayname?: string
  cat_environmentid?: string
  cat_classificationdate?: string      // ISO datetime
  statecode?: number                   // 0 = Active
  statuscode?: number                  // 1 = Active
  createdon?: string
  modifiedon?: string
  '_ownerid_value@OData.Community.Display.V1.FormattedValue'?: string
  '_modifiedby_value@OData.Community.Display.V1.FormattedValue'?: string
  [key: string]: unknown               // OData annotation pass-through
}

interface CopilotData {
  agentDetails: AgentDetail[]
  agentValue: AgentValue[]
  loading: boolean
  error: string | null
}

// ── Context ───────────────────────────────────────────────────
const CopilotDataContext = createContext<CopilotData>({
  agentDetails: [],
  agentValue: [],
  loading: true,
  error: null,
})

// ── Provider ──────────────────────────────────────────────────
export function CopilotDataProvider({ children }: { children: ReactNode }) {
  const [agentDetails, setAgentDetails] = useState<AgentDetail[]>([])
  const [agentValue,   setAgentValue]   = useState<AgentValue[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        if (!ENDPOINT) throw new Error('VITE_COPILOT_ENDPOINT not configured')
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json() as Record<string, unknown>

        const details = Array.isArray(json['agentdetails'])
          ? (json['agentdetails'] as AgentDetail[])
          : []
        const values = Array.isArray(json['agentvalues'])
          ? (json['agentvalues'] as AgentValue[])
          : []

        setAgentDetails(details)
        setAgentValue(values)
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setError((err as Error).message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void fetchData()
    // Warm the Rammas cache at app startup so the panel loads instantly
    RammasAtWorkService.fetch().catch(() => {})

    return () => controller.abort()
  }, [])

  return (
    <CopilotDataContext.Provider value={{ agentDetails, agentValue, loading, error }}>
      {children}
    </CopilotDataContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────
export function useCopilotData() {
  return useContext(CopilotDataContext)
}
