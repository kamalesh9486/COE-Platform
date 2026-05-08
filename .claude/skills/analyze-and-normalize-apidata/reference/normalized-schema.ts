// NormalizedApiSchema — the standard output of the analyze_and_normalize_api_data skill.
// This file is a reference type definition; copy relevant interfaces into your service file.

export type FieldCategory = 'metric' | 'dimension' | 'temporal' | 'identifier' | 'low-value'
export type FieldType     = 'number' | 'string' | 'boolean' | 'date' | 'array' | 'object' | 'null' | 'unknown'
export type EnvelopeType  = 'raw-array' | 'data-wrapper' | 'results-wrapper' | 'items-wrapper' |
                            'value-wrapper' | 'records-wrapper' | 'single-object' | 'other'
export type ChartSuggestion =
  | 'bar-chart'        // compare metric across a dimension
  | 'line-chart'       // metric over time
  | 'donut-chart'      // share of a total by dimension
  | 'area-chart'       // metric trend with volume emphasis
  | 'scatter-chart'    // correlation between two metrics
  | 'kpi-card'         // single headline metric
  | 'data-table'       // structured detail view
  | 'heatmap'          // two dimensions + metric intensity

export interface FieldDescriptor {
  path: string          // dot-notation field path, e.g. "user.address.city" or "items[].price"
  type: FieldType
  category: FieldCategory
  nullRate: number      // 0–1, fraction of records where this field is null/missing
  uniqueRate: number    // 0–1, distinct values ÷ total sampled records
  sampleValues: unknown[]  // up to 5 representative non-null values
  analyticsReady: boolean  // true if this field should appear in the output TypeScript interface
  nestedArray: boolean  // true if path contains "[]" — aggregation needed before charting
  notes?: string        // analyst or classifier notes about this specific field
}

export interface VisualizationSuggestion {
  chartType: ChartSuggestion
  xAxis?: string        // field path for x-axis or grouping dimension
  yAxis?: string        // field path for y-axis or metric
  timeField?: string    // field path for time axis (line/area charts)
  colorBy?: string      // field path to use for series color grouping
  rationale: string     // one-sentence explanation of why this chart fits
}

export interface DataQualityNote {
  severity: 'info' | 'warning' | 'error'
  field?: string        // field path affected (omit for dataset-level notes)
  message: string
}

export interface NormalizedApiSchema {
  // ── Source info ──────────────────────────────────────────────────────────────
  endpoint: string              // the URL or "pasted-response" if raw JSON was provided
  fetchedAt: string             // ISO timestamp when the sample was captured
  sampleSize: number            // number of records analysed
  isPaginated: boolean          // true if envelope suggests pagination (next/cursor/page fields present)
  envelopeType: EnvelopeType    // how records are wrapped in the root JSON object

  // ── Field inventory ──────────────────────────────────────────────────────────
  totalFields: number           // total leaf fields found (before filtering)
  fields: FieldDescriptor[]     // all fields, including low-value ones

  // ── Analyst-confirmed top picks ──────────────────────────────────────────────
  suggestedMetrics: string[]    // field paths — best metrics for KPI cards / Y-axes
  suggestedDimensions: string[] // field paths — best dimensions for filters / grouping
  suggestedTimeField: string | null  // single primary time axis field path

  // ── Visualization plan ────────────────────────────────────────────────────────
  visualizations: VisualizationSuggestion[]  // 2–3 concrete chart suggestions

  // ── Notes ────────────────────────────────────────────────────────────────────
  normalizationNotes: string[]      // schema-level observations (nesting depth, pagination, etc.)
  dataQualityNotes: DataQualityNote[]  // field-level quality issues
}

// ── Convenience helpers ──────────────────────────────────────────────────────

/** Returns only analytics-ready fields, sorted: temporal → metric → dimension */
export function getAnalyticsFields(schema: NormalizedApiSchema): FieldDescriptor[] {
  const order: Record<FieldCategory, number> = {
    temporal: 0, metric: 1, dimension: 2, identifier: 3, 'low-value': 4,
  }
  return schema.fields
    .filter(f => f.analyticsReady)
    .sort((a, b) => order[a.category] - order[b.category])
}

/** Generates a minimal TypeScript interface string from the analytics-ready fields */
export function generateInterface(schema: NormalizedApiSchema, name: string): string {
  const fields = getAnalyticsFields(schema)
  const lines = fields.map(f => {
    const tsType = f.type === 'date' ? 'string' :
                   f.type === 'number' ? 'number' :
                   f.type === 'boolean' ? 'boolean' : 'string'
    const optional = f.nullRate > 0 ? '?' : ''
    const comment  = f.notes ? `  // ${f.notes}` : ''
    return `  ${f.path.replace(/\./g, '_')}${optional}: ${tsType}${comment}`
  })
  return `export interface ${name}Record {\n${lines.join('\n')}\n}`
}
