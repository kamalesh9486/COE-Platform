import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const ENDPOINT =
  'https://07da63428cc4e81c95fa9ce24e7c2f.46.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/9a88f1c452a44be38a30f46d48b6942d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=YJw_bB5ij3YQCJLdnatTJynZZEPqw9rwwwX_-Y__Jgs'

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
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
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
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    void fetchData()
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
