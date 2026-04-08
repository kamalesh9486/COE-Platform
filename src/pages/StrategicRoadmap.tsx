import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts'
import '../strategic-roadmap.css'
import Icon from '../components/Icon'

// ── Types ─────────────────────────────────────────────────────────────────────

type InitStatus   = 'Completed' | 'In Progress' | 'Planned' | 'Delayed'
type InitCategory = 'Infrastructure' | 'Data & Analytics' | 'AI / ML' | 'People & Skills' | 'Process' | 'Innovation'

interface Milestone {
  label: string
  date: string
  done: boolean
}

interface Initiative {
  id: string
  title: string
  division: string
  category: InitCategory
  status: InitStatus
  progress: number
  startQ: string
  endQ: string
  owner: string
  description: string
  milestones: Milestone[]
  kpis: string[]
}

interface Phase {
  id: string
  name: string
  period: string
  color: string
  bgGradient: string
  completionPct: number
  initiatives: Initiative[]
}

// ── Colour maps ────────────────────────────────────────────────────────────────

const STATUS_C: Record<InitStatus, { color: string; bg: string; border: string; dot: string }> = {
  'Completed':  { color: '#007560', bg: 'rgba(0,117,96,0.1)',   border: 'rgba(0,117,96,0.22)',   dot: '#007560' },
  'In Progress':{ color: '#ca8a04', bg: 'rgba(202,138,4,0.1)',  border: 'rgba(202,138,4,0.22)',  dot: '#ca8a04' },
  'Planned':    { color: '#6b7280', bg: 'rgba(107,114,128,0.1)',border: 'rgba(107,114,128,0.2)', dot: '#6b7280' },
  'Delayed':    { color: '#dc2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.22)', dot: '#dc2626' },
}

const CAT_C: Record<InitCategory, { color: string; bg: string }> = {
  'Infrastructure':  { color: '#0891b2', bg: 'rgba(8,145,178,0.08)'   },
  'Data & Analytics':{ color: '#007560', bg: 'rgba(0,117,96,0.08)'    },
  'AI / ML':         { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)'  },
  'People & Skills': { color: '#ea580c', bg: 'rgba(234,88,12,0.08)'   },
  'Process':         { color: '#ca8a04', bg: 'rgba(202,138,4,0.08)'   },
  'Innovation':      { color: '#b91c1c', bg: 'rgba(185,28,28,0.07)'   },
}

// ── Static roadmap data ───────────────────────────────────────────────────────

const PHASES: Phase[] = [
  {
    id: 'foundation',
    name: 'Foundation',
    period: 'Q1 2024 – Q4 2024',
    color: '#007560',
    bgGradient: 'linear-gradient(135deg, #007560, #004937)',
    completionPct: 100,
    initiatives: [
      {
        id: 'f1', title: 'AI Governance Framework',
        division: 'Corporate Services', category: 'Process', status: 'Completed', progress: 100,
        startQ: 'Q1 2024', endQ: 'Q2 2024', owner: 'Chief Digital Officer',
        description: 'Established enterprise-wide AI governance policies, ethical guidelines, risk classification matrix, and accountability structures. Defines standards for responsible AI development and deployment across all DEWA divisions.',
        milestones: [
          { label: 'Policy drafting complete',     date: 'Feb 2024', done: true },
          { label: 'Stakeholder review & sign-off', date: 'Mar 2024', done: true },
          { label: 'Board approval',               date: 'Apr 2024', done: true },
          { label: 'Published & communicated',     date: 'May 2024', done: true },
        ],
        kpis: ['AI governance policy published', '100% division heads briefed', 'Risk classification for 30+ AI systems'],
      },
      {
        id: 'f2', title: 'Enterprise Data Lake (Azure)',
        division: 'IT & Digital Innovation', category: 'Infrastructure', status: 'Completed', progress: 100,
        startQ: 'Q1 2024', endQ: 'Q3 2024', owner: 'Head of Data Engineering',
        description: 'Implemented a centralised Azure Data Lake as the single source of truth for all operational, customer, and IoT data streams across DEWA. Enables AI/ML workloads with governed, high-quality data pipelines.',
        milestones: [
          { label: 'Architecture design approved',    date: 'Jan 2024', done: true },
          { label: 'Landing zone provisioned',        date: 'Feb 2024', done: true },
          { label: 'Core pipelines live (8 sources)', date: 'May 2024', done: true },
          { label: 'All 24 data sources onboarded',   date: 'Aug 2024', done: true },
        ],
        kpis: ['24 data sources integrated', '2.4 PB data ingested', 'Pipeline reliability >99.5%'],
      },
      {
        id: 'f3', title: 'AI Center of Excellence (COE)',
        division: 'Corporate Services', category: 'People & Skills', status: 'Completed', progress: 100,
        startQ: 'Q2 2024', endQ: 'Q3 2024', owner: 'VP Digital Transformation',
        description: 'Established the DEWA AI Center of Excellence as the central hub for AI capability development, best practices, tooling standards, and internal consulting for all divisions.',
        milestones: [
          { label: 'COE charter & mandate approved', date: 'Mar 2024', done: true },
          { label: 'Core team of 12 hired/assigned', date: 'May 2024', done: true },
          { label: 'First AI accelerator programme',  date: 'Jul 2024', done: true },
          { label: 'COE portal & knowledge base live',date: 'Sep 2024', done: true },
        ],
        kpis: ['12-person COE team', '5 divisions engaged in Q1', 'AI maturity baseline assessed'],
      },
      {
        id: 'f4', title: 'Cloud Infrastructure (Azure)',
        division: 'IT & Digital Innovation', category: 'Infrastructure', status: 'Completed', progress: 100,
        startQ: 'Q1 2024', endQ: 'Q2 2024', owner: 'Head of Cloud Architecture',
        description: 'Provisioned scalable Azure cloud infrastructure for AI/ML workloads including GPU compute clusters, Azure ML workspaces, key vault, and private networking for all DEWA divisions.',
        milestones: [
          { label: 'Landing zone design finalised', date: 'Jan 2024', done: true },
          { label: 'Core subscriptions provisioned', date: 'Feb 2024', done: true },
          { label: 'GPU compute cluster live',       date: 'Apr 2024', done: true },
          { label: 'Security hardening sign-off',    date: 'Jun 2024', done: true },
        ],
        kpis: ['3 Azure regions configured', '200 vCPU + 8 GPU nodes', 'ISO 27001 compliance maintained'],
      },
      {
        id: 'f5', title: 'AI Skills Baseline Assessment',
        division: 'HR & Transformation', category: 'People & Skills', status: 'Completed', progress: 100,
        startQ: 'Q3 2024', endQ: 'Q4 2024', owner: 'Head of Learning & Development',
        description: 'Conducted a comprehensive AI skills assessment across all 8,000+ DEWA employees to identify capability gaps and inform the enterprise AI learning roadmap.',
        milestones: [
          { label: 'Assessment framework designed', date: 'Jul 2024', done: true },
          { label: '80% employee participation',   date: 'Sep 2024', done: true },
          { label: 'Capability gap report issued',  date: 'Oct 2024', done: true },
          { label: 'Training plan approved',        date: 'Nov 2024', done: true },
        ],
        kpis: ['8,200 employees assessed', '6 capability levels defined', 'Training roadmap covering 1,800 staff'],
      },
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    period: 'Q1 2025 – Q4 2025',
    color: '#0891b2',
    bgGradient: 'linear-gradient(135deg, #0891b2, #0e7490)',
    completionPct: 72,
    initiatives: [
      {
        id: 'g1', title: 'Customer Service AI Chatbot',
        division: 'Customer Experience', category: 'AI / ML', status: 'Completed', progress: 100,
        startQ: 'Q1 2025', endQ: 'Q2 2025', owner: 'Head of Customer Experience',
        description: 'Deployed an AI-powered virtual assistant on DEWA\'s customer portal and mobile app, handling billing queries, outage reporting, and service requests using GPT-4o with RAG over DEWA knowledge bases.',
        milestones: [
          { label: 'Use case definition & design', date: 'Jan 2025', done: true },
          { label: 'Knowledge base integration',   date: 'Feb 2025', done: true },
          { label: 'UAT with 200 test users',      date: 'Mar 2025', done: true },
          { label: 'Full production launch',       date: 'Apr 2025', done: true },
        ],
        kpis: ['40% reduction in call centre volume', '87% customer satisfaction score', '24/7 availability'],
      },
      {
        id: 'g2', title: 'Predictive Maintenance Platform',
        division: 'Electricity Distribution', category: 'AI / ML', status: 'Completed', progress: 100,
        startQ: 'Q1 2025', endQ: 'Q3 2025', owner: 'Head of Asset Management',
        description: 'Built an ML-powered predictive maintenance system processing IoT sensor data from 45,000 field assets to predict failures 72 hours in advance, reducing unplanned outages by 34%.',
        milestones: [
          { label: 'IoT data pipeline established', date: 'Jan 2025', done: true },
          { label: 'Model training (v1.0)',         date: 'Mar 2025', done: true },
          { label: 'Pilot on 500 assets',           date: 'May 2025', done: true },
          { label: 'Full rollout 45k assets',       date: 'Aug 2025', done: true },
        ],
        kpis: ['34% reduction in unplanned outages', '45,000 assets monitored', '72-hour advance warning'],
      },
      {
        id: 'g3', title: 'Smart Meter Analytics',
        division: 'Electricity Distribution', category: 'Data & Analytics', status: 'In Progress', progress: 65,
        startQ: 'Q2 2025', endQ: 'Q4 2025', owner: 'Head of Smart Grid',
        description: 'Advanced analytics platform processing 1.2M smart meter readings daily to deliver personalised energy insights, detect anomalies, and optimise load balancing across the distribution network.',
        milestones: [
          { label: 'Data ingestion pipeline live',    date: 'Apr 2025', done: true },
          { label: 'Anomaly detection model deployed',date: 'Jul 2025', done: true },
          { label: 'Customer insights portal',        date: 'Oct 2025', done: false },
          { label: 'Load balancing optimisation',     date: 'Dec 2025', done: false },
        ],
        kpis: ['1.2M meter readings/day processed', '18% reduction in grid anomalies', 'Personalised insights for 900k customers'],
      },
      {
        id: 'g4', title: 'AI-Powered Recruitment System',
        division: 'HR & Transformation', category: 'AI / ML', status: 'In Progress', progress: 55,
        startQ: 'Q2 2025', endQ: 'Q4 2025', owner: 'Head of Talent Acquisition',
        description: 'Intelligent recruitment platform using NLP to screen CVs, rank candidates, reduce bias, and predict candidate success scores, cutting time-to-hire from 45 to 18 days on average.',
        milestones: [
          { label: 'Vendor selection & integration',  date: 'Mar 2025', done: true },
          { label: 'CV screening model trained',      date: 'Jun 2025', done: true },
          { label: 'Pilot with 3 divisions',          date: 'Sep 2025', done: false },
          { label: 'Enterprise-wide rollout',         date: 'Dec 2025', done: false },
        ],
        kpis: ['60% reduction in screening time', 'Time-to-hire: 45 → 18 days', 'Bias reduction benchmarked'],
      },
      {
        id: 'g5', title: 'Computer Vision Safety System',
        division: 'Generation & Renewables', category: 'AI / ML', status: 'In Progress', progress: 70,
        startQ: 'Q1 2025', endQ: 'Q3 2025', owner: 'Head of HSE',
        description: 'Real-time computer vision system deployed across power generation sites to detect PPE compliance, hazardous zone breaches, and unsafe behaviours using 280 edge-deployed cameras.',
        milestones: [
          { label: 'Camera infrastructure deployed', date: 'Feb 2025', done: true },
          { label: 'PPE detection model (94% acc)',  date: 'Apr 2025', done: true },
          { label: 'Alert & escalation system live', date: 'Jun 2025', done: true },
          { label: 'All 6 plant sites covered',      date: 'Sep 2025', done: false },
        ],
        kpis: ['28% reduction in HSE incidents', '280 cameras deployed', '94% PPE detection accuracy'],
      },
      {
        id: 'g6', title: 'Energy Demand Forecasting',
        division: 'Generation & Renewables', category: 'AI / ML', status: 'Completed', progress: 100,
        startQ: 'Q1 2025', endQ: 'Q2 2025', owner: 'Head of Grid Operations',
        description: 'LSTM-based deep learning model forecasting DEWA-wide electricity demand at 15-minute intervals up to 7 days ahead, incorporating weather, holidays, and industrial load data for optimal generation planning.',
        milestones: [
          { label: 'Historical data preparation',  date: 'Jan 2025', done: true },
          { label: 'LSTM model trained & validated',date: 'Feb 2025', done: true },
          { label: 'Shadow mode operation (30d)',   date: 'Mar 2025', done: true },
          { label: 'Production deployment',         date: 'May 2025', done: true },
        ],
        kpis: ['MAPE < 2.1%', '7-day forecast horizon', 'AED 12M annual fuel savings'],
      },
      {
        id: 'g7', title: 'Document Intelligence Platform',
        division: 'Corporate Services', category: 'Process', status: 'In Progress', progress: 60,
        startQ: 'Q3 2025', endQ: 'Q4 2025', owner: 'Head of Digital Operations',
        description: 'Azure AI Document Intelligence platform automating extraction, classification, and routing of 15,000+ documents monthly across procurement, HR, finance, and legal workflows.',
        milestones: [
          { label: 'Document taxonomy defined',       date: 'Jul 2025', done: true },
          { label: 'Model trained on 10k samples',    date: 'Sep 2025', done: true },
          { label: 'Procurement workflow automated',  date: 'Nov 2025', done: false },
          { label: 'All 4 workflows live',            date: 'Dec 2025', done: false },
        ],
        kpis: ['80% reduction in manual routing', '15,000 docs/month automated', 'Processing time: 3d → 4h'],
      },
    ],
  },
  {
    id: 'optimise',
    name: 'Optimisation',
    period: 'Q1 2026 – Q2 2026',
    color: '#ca8a04',
    bgGradient: 'linear-gradient(135deg, #ca8a04, #92400e)',
    completionPct: 38,
    initiatives: [
      {
        id: 'o1', title: 'MLOps & Model Governance Platform',
        division: 'IT & Digital Innovation', category: 'Infrastructure', status: 'In Progress', progress: 55,
        startQ: 'Q1 2026', endQ: 'Q2 2026', owner: 'Head of AI Engineering',
        description: 'Enterprise MLOps platform on Azure ML with automated drift detection, model registry, CI/CD pipelines for ML, and governance dashboards covering all 60+ production AI models.',
        milestones: [
          { label: 'Platform architecture approved', date: 'Jan 2026', done: true },
          { label: 'Model registry live (60 models)', date: 'Feb 2026', done: true },
          { label: 'Drift monitoring automated',     date: 'Apr 2026', done: false },
          { label: 'Full CI/CD pipelines live',      date: 'Jun 2026', done: false },
        ],
        kpis: ['60+ models under governance', 'Drift alerts within 24 hours', 'Deployment time: 2w → 2h'],
      },
      {
        id: 'o2', title: 'AI Ethics & Fairness Review Programme',
        division: 'Corporate Services', category: 'Process', status: 'In Progress', progress: 45,
        startQ: 'Q1 2026', endQ: 'Q2 2026', owner: 'Chief Ethics Officer',
        description: 'Formal review process for all high-risk AI systems, including bias audits, explainability assessments, and quarterly reporting to the DEWA AI Ethics Committee.',
        milestones: [
          { label: 'Ethics review framework published', date: 'Jan 2026', done: true },
          { label: 'First 10 systems audited',         date: 'Mar 2026', done: true },
          { label: 'Quarterly report published',       date: 'May 2026', done: false },
          { label: 'All 25 high-risk systems audited', date: 'Jun 2026', done: false },
        ],
        kpis: ['25 high-risk AI systems audited', 'Explainability score for top 10 models', 'Zero bias incidents in Q2'],
      },
      {
        id: 'o3', title: 'Real-Time Analytics Dashboard',
        division: 'Finance & Strategy', category: 'Data & Analytics', status: 'In Progress', progress: 30,
        startQ: 'Q1 2026', endQ: 'Q2 2026', owner: 'Head of Corporate Strategy',
        description: 'Executive-level real-time dashboard consolidating AI performance KPIs, business impact metrics, and financial ROI of all AI investments across DEWA, powered by Azure Synapse and Power BI Embedded.',
        milestones: [
          { label: 'KPI framework defined',        date: 'Jan 2026', done: true },
          { label: 'Data model & ETL built',        date: 'Mar 2026', done: false },
          { label: 'Dashboard UAT with leadership', date: 'May 2026', done: false },
          { label: 'Production launch',             date: 'Jun 2026', done: false },
        ],
        kpis: ['40+ KPIs tracked in real-time', 'Financial ROI dashboard for board', 'Automated monthly reporting'],
      },
      {
        id: 'o4', title: 'AutoML Pipeline Automation',
        division: 'IT & Digital Innovation', category: 'AI / ML', status: 'Planned', progress: 10,
        startQ: 'Q2 2026', endQ: 'Q2 2026', owner: 'Head of AI Engineering',
        description: 'Self-service AutoML platform enabling non-specialist teams to build, evaluate, and deploy ML models without deep data science expertise, accelerating AI delivery across all divisions.',
        milestones: [
          { label: 'Tool evaluation & selection',  date: 'Feb 2026', done: false },
          { label: 'Pilot with 2 divisions',       date: 'Apr 2026', done: false },
          { label: 'Training programme delivered', date: 'May 2026', done: false },
          { label: 'Enterprise launch',            date: 'Jun 2026', done: false },
        ],
        kpis: ['8 divisions self-serving AutoML', '50% reduction in model build time', '30 citizen data scientists enabled'],
      },
      {
        id: 'o5', title: 'Cross-Division AI Knowledge Hub',
        division: 'Corporate Services', category: 'People & Skills', status: 'In Progress', progress: 50,
        startQ: 'Q1 2026', endQ: 'Q2 2026', owner: 'COE Director',
        description: 'Centralised AI knowledge management system capturing use cases, model cards, lessons learned, reusable components, and best practices from all DEWA AI deployments for cross-division reuse.',
        milestones: [
          { label: 'Platform selected & configured', date: 'Jan 2026', done: true },
          { label: '40 use cases documented',        date: 'Mar 2026', done: true },
          { label: 'Component library launched',     date: 'Apr 2026', done: false },
          { label: '100 use cases catalogued',       date: 'Jun 2026', done: false },
        ],
        kpis: ['100 use cases catalogued', '60% reuse rate of AI components', '8 divisions contributing'],
      },
    ],
  },
  {
    id: 'innovation',
    name: 'Innovation',
    period: 'Q3 2026 – Q4 2027',
    color: '#7c3aed',
    bgGradient: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    completionPct: 8,
    initiatives: [
      {
        id: 'i1', title: 'Autonomous Grid Management',
        division: 'Electricity Distribution', category: 'Innovation', status: 'Planned', progress: 5,
        startQ: 'Q3 2026', endQ: 'Q4 2027', owner: 'Head of Grid Innovation',
        description: 'Closed-loop AI system autonomously managing load balancing, fault isolation, and power restoration across the DEWA distribution network, reducing human intervention by 70% for routine grid operations.',
        milestones: [
          { label: 'Simulation environment built',   date: 'Q3 2026', done: false },
          { label: 'Supervised pilot (10% grid)',     date: 'Q1 2027', done: false },
          { label: 'Semi-autonomous operations',      date: 'Q3 2027', done: false },
          { label: 'Full autonomous deployment',      date: 'Q4 2027', done: false },
        ],
        kpis: ['70% reduction in manual interventions', 'SAIFI improvement >25%', 'Grid response time < 200ms'],
      },
      {
        id: 'i2', title: 'Digital Twin Platform',
        division: 'Generation & Renewables', category: 'Innovation', status: 'Planned', progress: 5,
        startQ: 'Q3 2026', endQ: 'Q4 2027', owner: 'Head of Engineering Innovation',
        description: 'Full digital twin of DEWA\'s power generation assets enabling real-time simulation, predictive scenario modelling, and "what-if" analysis for operational planning and capital investment decisions.',
        milestones: [
          { label: 'Digital twin framework & vendor', date: 'Q3 2026', done: false },
          { label: 'Pilot twin — Jebel Ali Station',  date: 'Q1 2027', done: false },
          { label: '3 generation sites twinned',      date: 'Q3 2027', done: false },
          { label: 'All assets digitally twinned',    date: 'Q4 2027', done: false },
        ],
        kpis: ['100% generation assets twinned', 'Simulation accuracy >96%', 'AED 30M capex avoidance'],
      },
      {
        id: 'i3', title: 'Advanced NLP & Language AI',
        division: 'Customer Experience', category: 'AI / ML', status: 'In Progress', progress: 18,
        startQ: 'Q3 2026', endQ: 'Q2 2027', owner: 'Head of Digital Channels',
        description: 'Next-generation multilingual (Arabic/English) large language model fine-tuned on DEWA domain knowledge for ultra-personalised customer communications, complex query resolution, and proactive service recommendations.',
        milestones: [
          { label: 'Arabic NLP data collection',      date: 'Q3 2026', done: true },
          { label: 'Domain fine-tuning (LLM v2)',      date: 'Q4 2026', done: false },
          { label: 'Arabic chatbot upgrade launched',  date: 'Q1 2027', done: false },
          { label: 'Proactive notification AI live',   date: 'Q2 2027', done: false },
        ],
        kpis: ['Arabic NLP accuracy >92%', '50% reduction in escalations', '1M+ customer interactions/month'],
      },
      {
        id: 'i4', title: 'AI-Driven Sustainability Platform',
        division: 'Corporate Services', category: 'Innovation', status: 'Planned', progress: 0,
        startQ: 'Q1 2027', endQ: 'Q4 2027', owner: 'Chief Sustainability Officer',
        description: 'AI platform optimising DEWA\'s carbon emissions across generation, transmission, and operations — providing real-time carbon accounting, offset recommendations, and automated sustainability reporting for UAE Net Zero 2050 targets.',
        milestones: [
          { label: 'Carbon data architecture designed', date: 'Q1 2027', done: false },
          { label: 'Emissions modelling engine live',   date: 'Q2 2027', done: false },
          { label: 'Optimisation recommendations live', date: 'Q3 2027', done: false },
          { label: 'Regulatory reporting automated',    date: 'Q4 2027', done: false },
        ],
        kpis: ['15% reduction in operational emissions', 'Real-time carbon accounting', 'Automated ESG reporting'],
      },
      {
        id: 'i5', title: 'Robotics & Intelligent Automation',
        division: 'Water & Sewerage', category: 'Innovation', status: 'Planned', progress: 0,
        startQ: 'Q2 2027', endQ: 'Q4 2027', owner: 'Head of Operations Technology',
        description: 'Autonomous inspection robots combined with AI-powered process automation for water treatment plants — inspecting pipes, detecting leaks, and automating routine maintenance tasks in hazardous environments.',
        milestones: [
          { label: 'Robot procurement & integration', date: 'Q2 2027', done: false },
          { label: 'Pilot at Water Station 3',        date: 'Q3 2027', done: false },
          { label: 'AI control system deployed',      date: 'Q4 2027', done: false },
          { label: 'All 5 water stations automated',  date: 'Q4 2027', done: false },
        ],
        kpis: ['30% reduction in manual inspections', '5 water stations automated', 'Zero-entry hazardous zones'],
      },
    ],
  },
]

// ── Aggregated counts ─────────────────────────────────────────────────────────

const ALL_INITIATIVES = PHASES.flatMap(p => p.initiatives)

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusIcon(s: InitStatus) {
  switch (s) {
    case 'Completed':   return 'bi-check-circle-fill'
    case 'In Progress': return 'bi-arrow-repeat'
    case 'Planned':     return 'bi-clock'
    case 'Delayed':     return 'bi-exclamation-circle-fill'
  }
}

// ── Chart tooltips ────────────────────────────────────────────────────────────

function BarTip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(28,28,30,0.93)', borderRadius: 9, padding: '10px 14px', minWidth: 140 }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>{label}</div>
      {payload.filter(p => p.value > 0).map(p => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 12 }}>
          <span style={{ color: p.color, fontWeight: 600 }}>{p.name}</span>
          <span style={{ color: '#fff', fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function PieTip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { color: string } }[] }) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div style={{ background: 'rgba(28,28,30,0.93)', borderRadius: 9, padding: '8px 14px' }}>
      <div style={{ fontSize: 11, color: p.payload.color, fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{p.value} initiatives</div>
    </div>
  )
}

// ── Initiative Detail Modal ───────────────────────────────────────────────────

function InitiativeModal({ init, phase, onClose }: { init: Initiative; phase: Phase; onClose: () => void }) {
  const sC = STATUS_C[init.status]
  const cC = CAT_C[init.category]
  const lastDoneIdx = init.milestones.reduce((acc, m, i) => m.done ? i : acc, -1)

  return (
    <div className="sr-modal-backdrop" onClick={onClose}>
      <div className="sr-modal" style={{ borderTop: `3px solid ${phase.color}` }} onClick={e => e.stopPropagation()}>
        <div className="sr-modal-header">
          <button className="sr-modal-close" onClick={onClose}><Icon name="bi-x-lg" /></button>
          <div className="sr-modal-phase-tag" style={{ color: phase.color }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: phase.color, flexShrink: 0 }} />
            {phase.name} Phase · {init.startQ} → {init.endQ}
          </div>
          <div className="sr-modal-title">{init.title}</div>
          <div className="sr-modal-badges">
            <span className="sr-card-status" style={{ color: sC.color, background: sC.bg, border: `1px solid ${sC.border}` }}>
              <Icon name={statusIcon(init.status)} size={10} />
              {init.status}
            </span>
            <span className="sr-card-tag" style={{ color: cC.color, background: cC.bg, border: `1px solid ${cC.color}22` }}>
              {init.category}
            </span>
            <span style={{ fontSize: 11, color: '#6b7280', background: 'rgba(107,114,128,0.08)', padding: '2px 10px', borderRadius: 20, border: '1px solid rgba(107,114,128,0.15)' }}>
              <Icon name="bi-building" size={10} style={{ marginRight: 4 }} />{init.division}
            </span>
          </div>
        </div>

        <div className="sr-modal-body">
          {/* Progress */}
          <div>
            <div className="sr-section-label"><Icon name="bi-speedometer2" /> Progress</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Overall completion</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: phase.color }}>{init.progress}%</span>
            </div>
            <div className="sr-modal-prog-bg">
              <div className="sr-modal-prog-fill" style={{ width: `${init.progress}%`, background: phase.color }} />
            </div>
          </div>

          {/* Meta */}
          <div>
            <div className="sr-section-label"><Icon name="bi-info-circle-fill" /> Details</div>
            <div className="sr-meta-grid">
              <div className="sr-meta-cell">
                <div className="sr-meta-label">Owner</div>
                <div className="sr-meta-value" style={{ fontSize: 12 }}>{init.owner}</div>
              </div>
              <div className="sr-meta-cell">
                <div className="sr-meta-label">Start</div>
                <div className="sr-meta-value">{init.startQ}</div>
              </div>
              <div className="sr-meta-cell">
                <div className="sr-meta-label">End</div>
                <div className="sr-meta-value">{init.endQ}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="sr-section-label"><Icon name="bi-file-text" /> Description</div>
            <p className="sr-desc">{init.description}</p>
          </div>

          {/* Milestones */}
          <div>
            <div className="sr-section-label"><Icon name="bi-clock-history" /> Milestone Timeline</div>
            <div className="sr-milestones">
              {init.milestones.map((ms, i) => {
                const isPending = !ms.done && i > lastDoneIdx
                const isLast    = i === init.milestones.length - 1
                return (
                  <div key={i} className={`sr-ms-item${isPending ? ' pending' : ''}`}>
                    <div className="sr-ms-spine">
                      <div
                        className="sr-ms-dot"
                        style={{
                          background: ms.done ? phase.color : '#e5e7eb',
                          boxShadow: ms.done ? `0 0 0 2px ${phase.color}30` : 'none',
                        }}
                      >
                        {ms.done && <Icon name="bi-check-lg" size={8} style={{ color: '#fff' }} />}
                      </div>
                      {!isLast && <div className="sr-ms-line" />}
                    </div>
                    <div className="sr-ms-content">
                      <div className="sr-ms-label">{ms.label}</div>
                      <div className="sr-ms-date">{ms.done ? ms.date : `Target: ${ms.date}`}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* KPIs */}
          <div>
            <div className="sr-section-label"><Icon name="bi-bullseye" /> Key Performance Indicators</div>
            <div className="sr-kpi-chips">
              {init.kpis.map((k, i) => (
                <div key={i} className="sr-kpi-chip" style={{ borderLeftColor: phase.color }}>
                  <Icon name="bi-check-circle-fill" size={12} style={{ color: phase.color, flexShrink: 0 }} />
                  {k}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid rgba(0,117,96,0.18)', background: '#fff', color: '#374151', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function StrategicRoadmap() {
  const [statusFilter,   setStatusFilter]   = useState<InitStatus | 'All'>('All')
  const [categoryFilter, setCategoryFilter] = useState<InitCategory | 'All'>('All')
  const [search,         setSearch]         = useState('')
  const [selected,       setSelected]       = useState<{ init: Initiative; phase: Phase } | null>(null)

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    total:      ALL_INITIATIVES.length,
    completed:  ALL_INITIATIVES.filter(i => i.status === 'Completed').length,
    inProgress: ALL_INITIATIVES.filter(i => i.status === 'In Progress').length,
    planned:    ALL_INITIATIVES.filter(i => i.status === 'Planned').length,
    delayed:    ALL_INITIATIVES.filter(i => i.status === 'Delayed').length,
  }), [])

  // ── Chart data ─────────────────────────────────────────────────────────────
  const barChartData = PHASES.map(p => ({
    name:       p.name,
    Completed:  p.initiatives.filter(i => i.status === 'Completed').length,
    'In Progress': p.initiatives.filter(i => i.status === 'In Progress').length,
    Planned:    p.initiatives.filter(i => i.status === 'Planned').length,
    Delayed:    p.initiatives.filter(i => i.status === 'Delayed').length,
  }))

  const catPieData = Object.entries(CAT_C).map(([cat, c]) => ({
    name: cat,
    value: ALL_INITIATIVES.filter(i => i.category === cat as InitCategory).length,
    color: c.color,
  })).filter(d => d.value > 0)

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredPhases = useMemo(() => {
    const q = search.toLowerCase()
    return PHASES.map(p => ({
      ...p,
      initiatives: p.initiatives.filter(init => {
        const matchS = statusFilter   === 'All' || init.status   === statusFilter
        const matchC = categoryFilter === 'All' || init.category === categoryFilter
        const matchQ = !q || init.title.toLowerCase().includes(q) ||
                       init.division.toLowerCase().includes(q)  ||
                       init.category.toLowerCase().includes(q)
        return matchS && matchC && matchQ
      }),
    })).filter(p => p.initiatives.length > 0 || (!search && statusFilter === 'All' && categoryFilter === 'All'))
  }, [search, statusFilter, categoryFilter])

  const filteredTotal = filteredPhases.reduce((a, p) => a + p.initiatives.length, 0)

  const CATEGORIES: (InitCategory | 'All')[] = [
    'All', 'Infrastructure', 'Data & Analytics', 'AI / ML', 'People & Skills', 'Process', 'Innovation',
  ]

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1>Strategic AI Roadmap</h1>
        <p>DEWA AI adoption journey — 22 initiatives across 4 strategic phases · 2024 – 2027</p>
      </div>

      {/* KPI strip */}
      <div className="kpi-4-grid" style={{ gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Initiatives',  value: counts.total,      icon: 'bi-collection',         bg: 'rgba(0,117,96,0.08)',   color: '#007560' },
          { label: 'Completed',          value: counts.completed,   icon: 'bi-check-circle-fill',  bg: 'rgba(0,117,96,0.1)',    color: '#007560' },
          { label: 'In Progress',        value: counts.inProgress,  icon: 'bi-arrow-repeat',       bg: 'rgba(202,138,4,0.1)',   color: '#ca8a04' },
          { label: 'Planned',            value: counts.planned,     icon: 'bi-clock',              bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(0,117,96,0.12)', padding: '16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              <Icon name={s.icon} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Phase Timeline Bar */}
      <div className="sr-timeline">
        {PHASES.map(p => (
          <div key={p.id} className="sr-phase-seg" style={{ background: p.bgGradient }}>
            <div className="sr-phase-label" style={{ color: 'rgba(255,255,255,0.75)' }}>Phase</div>
            <div className="sr-phase-name">{p.name}</div>
            <div className="sr-phase-period">{p.period}</div>
            <div className="sr-phase-bar-bg">
              <div className="sr-phase-bar-fill" style={{ width: `${p.completionPct}%` }} />
            </div>
            <div className="sr-phase-count" style={{ marginTop: 6 }}>
              {p.initiatives.filter(i => i.status === 'Completed').length} of {p.initiatives.length} complete
            </div>
            <div className="sr-phase-pct">{p.completionPct}%</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="sr-charts-row">
        {/* Status by phase */}
        <div className="sr-chart-card">
          <div className="sr-chart-title">
            <Icon name="bi-bar-chart-line-fill" /> Initiatives by Phase &amp; Status
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barChartData} margin={{ top: 0, right: 16, left: -10, bottom: 0 }} barSize={14} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<BarTip />} cursor={{ fill: 'rgba(0,117,96,0.03)' }} />
              <Bar dataKey="Completed"   fill="#007560" radius={[3,3,0,0]} stackId="a" />
              <Bar dataKey="In Progress" fill="#ca8a04" radius={[0,0,0,0]} stackId="a" />
              <Bar dataKey="Planned"     fill="#9ca3af" radius={[0,0,0,0]} stackId="a" />
              <Bar dataKey="Delayed"     fill="#dc2626" radius={[3,3,0,0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid rgba(0,117,96,0.07)' }}>
            {[['Completed','#007560'],['In Progress','#ca8a04'],['Planned','#9ca3af'],['Delayed','#dc2626']].map(([l,c]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6b7280' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />{l}
              </div>
            ))}
          </div>
        </div>

        {/* Category donut */}
        <div className="sr-chart-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="sr-chart-title">
            <Icon name="bi-pie-chart-fill" /> By Category
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={catPieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  innerRadius={48} outerRadius={74} paddingAngle={3} strokeWidth={0}>
                  {catPieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip content={<PieTip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1c1c1e', lineHeight: 1 }}>{counts.total}</div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>total</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 8, borderTop: '1px solid rgba(0,117,96,0.07)' }}>
            {catPieData.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#374151' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{d.name}</span>
                <span style={{ fontWeight: 700, color: '#1c1c1e' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="sr-filter-bar">
        <input
          className="sr-search"
          placeholder="Search initiatives, divisions…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="sr-pills">
          {(['All', 'Completed', 'In Progress', 'Planned', 'Delayed'] as (InitStatus | 'All')[]).map(s => (
            <button key={s} className={`sr-pill${statusFilter === s ? ' active' : ''}`} onClick={() => setStatusFilter(s)}>
              {s}
            </button>
          ))}
        </div>
        <select className="sr-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as InitCategory | 'All')}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
        </select>
        <span style={{ fontSize: 12, color: '#a8a29e', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
          {filteredTotal} of {counts.total} initiatives
        </span>
      </div>

      {/* Swimlane */}
      <div className="sr-swimlane">
        {filteredPhases.map(p => (
          <div key={p.id} className="sr-lane">
            <div className="sr-lane-header">
              <div className="sr-lane-dot" style={{ background: p.color }} />
              <div className="sr-lane-title">{p.name}</div>
              <div className="sr-lane-period">{p.period}</div>
              <span className="sr-lane-badge" style={{ color: p.color, background: `${p.color}12`, border: `1px solid ${p.color}25` }}>
                {p.initiatives.filter(i => i.status === 'Completed').length}/{p.initiatives.length} done
              </span>
              <span className="sr-lane-pct" style={{ color: p.color }}>{p.completionPct}%</span>
            </div>

            {p.initiatives.length === 0 ? (
              <div className="sr-lane-empty">No initiatives match the current filters</div>
            ) : (
              <div className="sr-lane-cards">
                {p.initiatives.map(init => {
                  const sC = STATUS_C[init.status]
                  const cC = CAT_C[init.category]
                  return (
                    <div
                      key={init.id}
                      className="sr-card"
                      style={{ borderTopColor: p.color }}
                      onClick={() => setSelected({ init, phase: p })}
                    >
                      <div className="sr-card-top">
                        <div className="sr-card-title">{init.title}</div>
                        <span className="sr-card-status" style={{ color: sC.color, background: sC.bg, border: `1px solid ${sC.border}` }}>
                          <Icon name={statusIcon(init.status)} size={9} />
                          {init.status}
                        </span>
                      </div>
                      <div className="sr-card-meta">
                        <span className="sr-card-tag" style={{ color: cC.color, background: cC.bg }}>
                          {init.category}
                        </span>
                      </div>
                      <div className="sr-card-division">
                        <Icon name="bi-building" size={10} />
                        {init.division}
                      </div>
                      <div className="sr-card-progress" style={{ marginTop: 10 }}>
                        <div className="sr-card-bar-bg">
                          <div className="sr-card-bar-fill" style={{ width: `${init.progress}%`, background: p.color }} />
                        </div>
                        <div className="sr-card-progress-row">
                          <span className="sr-card-progress-label">
                            <Icon name="bi-calendar3" size={9} style={{ marginRight: 3 }} />{init.startQ} → {init.endQ}
                          </span>
                          <span className="sr-card-progress-pct" style={{ color: p.color }}>{init.progress}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {selected && (
        <InitiativeModal
          init={selected.init}
          phase={selected.phase}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
