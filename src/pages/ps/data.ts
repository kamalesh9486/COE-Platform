// ─────────────────────────────────────────────────────────────
//  DEWA COE — People & Skills shared dummy data
// ─────────────────────────────────────────────────────────────

export type AdoptionStatus = 'Active' | 'In Progress' | 'Not Started'
export type CertStatus     = 'Completed' | 'In Progress' | 'Expired'
export type CertProvider   = 'Microsoft' | 'Google' | 'AWS' | 'Coursera' | 'DEWA Internal'
export type SkillCategory  = 'Programming' | 'AI/ML' | 'Data' | 'Tools'

export interface Employee {
  id: number
  name: string
  division: string
  department: string
  aiTools: string[]
  adoptionStatus: AdoptionStatus
  role: string
  performanceScore: number    // 1–5
  aiContributionRating: number // 1–5
  lastReview: string           // ISO date
}

export interface Certification {
  id: number
  employeeName: string
  division: string
  certName: string
  provider: CertProvider
  date: string
  status: CertStatus
}

export interface AdkarScore {
  division: string
  awareness: number
  desire: number
  knowledge: number
  ability: number
  reinforcement: number
}

export interface Skill {
  name: string
  count: number
  category: SkillCategory
}

export interface AIToolKPI {
  adoptionRate: number        // % of eligible staff actively using
  monthlyGrowth: number       // % growth month-over-month
  queriesPerMonth: number     // total queries/requests per month
  satisfactionScore: number   // out of 5
  avgSessionMins: number      // avg session duration in minutes
  useCases: string[]
  trend: { month: string; users: number }[]  // 6-month user trend
  deptBreakdown: { dept: string; count: number }[]
}

export interface AITool {
  name: string
  icon: string
  users: number
  departments: string[]
  color: string
  description: string
  kpi: AIToolKPI
}

export interface DivisionAdoption {
  division: string
  trained: number
  total: number
  pct: number
}

// ─── Employees ─────────────────────────────────────────────────
export const EMPLOYEES: Employee[] = [
  { id: 1,  name: 'Ahmed Al Mansoori',   division: 'IT & Digital',     department: 'Software Development',   aiTools: ['ChatGPT', 'Copilot', 'GitHub Copilot'],     adoptionStatus: 'Active',      role: 'Senior Software Engineer',    performanceScore: 5, aiContributionRating: 5, lastReview: '2026-02-15' },
  { id: 2,  name: 'Sara Al Hashimi',     division: 'IT & Digital',     department: 'Data Science',            aiTools: ['Azure AI', 'Power BI AI', 'Python ML'],     adoptionStatus: 'Active',      role: 'Data Scientist',              performanceScore: 5, aiContributionRating: 5, lastReview: '2026-02-20' },
  { id: 3,  name: 'Khalid Nasser',       division: 'Generation',       department: 'Operations Control',      aiTools: ['ChatGPT', 'Power BI AI'],                   adoptionStatus: 'In Progress', role: 'Operations Manager',          performanceScore: 4, aiContributionRating: 3, lastReview: '2026-01-30' },
  { id: 4,  name: 'Fatima Al Zaabi',     division: 'HR',               department: 'Talent Management',       aiTools: ['Copilot', 'ChatGPT'],                       adoptionStatus: 'Active',      role: 'HR Business Partner',         performanceScore: 4, aiContributionRating: 4, lastReview: '2026-02-10' },
  { id: 5,  name: 'Omar Bin Saeed',      division: 'Finance',          department: 'Financial Analysis',      aiTools: ['Power BI AI', 'ChatGPT', 'Copilot'],        adoptionStatus: 'Active',      role: 'Financial Analyst',           performanceScore: 4, aiContributionRating: 4, lastReview: '2026-02-05' },
  { id: 6,  name: 'Mariam Al Ketbi',     division: 'Customer Service', department: 'Customer Support',        aiTools: ['ChatGPT', 'Copilot'],                       adoptionStatus: 'Active',      role: 'Customer Experience Lead',    performanceScore: 5, aiContributionRating: 4, lastReview: '2026-02-18' },
  { id: 7,  name: 'Rashid Al Shamsi',    division: 'Transmission',     department: 'Grid Operations',         aiTools: ['Azure AI'],                                 adoptionStatus: 'In Progress', role: 'Grid Operations Engineer',    performanceScore: 3, aiContributionRating: 2, lastReview: '2026-01-25' },
  { id: 8,  name: 'Noura Al Dhaheri',    division: 'Distribution',     department: 'Asset Management',        aiTools: ['Power BI AI', 'Azure AI'],                  adoptionStatus: 'Active',      role: 'Asset Manager',               performanceScore: 4, aiContributionRating: 4, lastReview: '2026-02-12' },
  { id: 9,  name: 'Hassan Al Mazrouei', division: 'Corporate',         department: 'Strategy & Innovation',   aiTools: ['ChatGPT'],                                  adoptionStatus: 'In Progress', role: 'Strategy Analyst',            performanceScore: 3, aiContributionRating: 3, lastReview: '2026-01-20' },
  { id: 10, name: 'Aisha Al Muhairi',    division: 'IT & Digital',     department: 'Cybersecurity',           aiTools: ['Azure AI', 'Copilot'],                      adoptionStatus: 'Active',      role: 'Cybersecurity Specialist',    performanceScore: 5, aiContributionRating: 5, lastReview: '2026-02-22' },
  { id: 11, name: 'Ibrahim Al Nuaimi',   division: 'Generation',       department: 'Maintenance',             aiTools: [],                                           adoptionStatus: 'Not Started', role: 'Maintenance Technician',      performanceScore: 3, aiContributionRating: 1, lastReview: '2026-01-10' },
  { id: 12, name: 'Layla Al Kaabi',      division: 'Finance',          department: 'Budget Planning',         aiTools: ['Copilot', 'Power BI AI'],                   adoptionStatus: 'Active',      role: 'Budget Planner',              performanceScore: 4, aiContributionRating: 3, lastReview: '2026-02-08' },
  { id: 13, name: 'Mohammed Al Rashidi', division: 'Distribution',     department: 'Customer Operations',     aiTools: ['ChatGPT', 'Power BI AI'],                   adoptionStatus: 'Active',      role: 'Operations Coordinator',      performanceScore: 4, aiContributionRating: 3, lastReview: '2026-02-14' },
  { id: 14, name: 'Hessa Al Falasi',     division: 'HR',               department: 'Learning & Development',  aiTools: ['Copilot'],                                  adoptionStatus: 'In Progress', role: 'L&D Specialist',              performanceScore: 4, aiContributionRating: 3, lastReview: '2026-01-28' },
  { id: 15, name: 'Yousuf Al Hammadi',   division: 'Transmission',     department: 'Electrical Engineering',  aiTools: ['Azure AI', 'Python ML', 'GitHub Copilot'], adoptionStatus: 'Active',      role: 'Electrical Engineer',         performanceScore: 5, aiContributionRating: 5, lastReview: '2026-02-19' },
  { id: 16, name: 'Reem Al Blooshi',     division: 'Customer Service', department: 'Digital Channels',        aiTools: ['ChatGPT', 'DALL-E', 'Copilot'],             adoptionStatus: 'Active',      role: 'Digital Experience Analyst',  performanceScore: 4, aiContributionRating: 4, lastReview: '2026-02-16' },
  { id: 17, name: 'Saif Al Qubaisi',     division: 'Corporate',        department: 'Communications',          aiTools: ['ChatGPT', 'DALL-E'],                        adoptionStatus: 'In Progress', role: 'Communications Specialist',   performanceScore: 3, aiContributionRating: 2, lastReview: '2026-01-22' },
  { id: 18, name: 'Maitha Al Suwaidi',   division: 'IT & Digital',     department: 'Cloud Infrastructure',    aiTools: ['Azure AI', 'GitHub Copilot', 'Copilot'],    adoptionStatus: 'Active',      role: 'Cloud Architect',             performanceScore: 5, aiContributionRating: 5, lastReview: '2026-02-21' },
]

// ─── Certifications ─────────────────────────────────────────────
export const CERTIFICATIONS: Certification[] = [
  { id: 1,  employeeName: 'Sara Al Hashimi',      division: 'IT & Digital',     certName: 'Azure AI Engineer Associate',         provider: 'Microsoft',    date: '2026-01-15', status: 'Completed'   },
  { id: 2,  employeeName: 'Ahmed Al Mansoori',    division: 'IT & Digital',     certName: 'GitHub Copilot Certified Developer',  provider: 'Microsoft',    date: '2025-11-20', status: 'Completed'   },
  { id: 3,  employeeName: 'Aisha Al Muhairi',     division: 'IT & Digital',     certName: 'Microsoft Security AI Specialist',    provider: 'Microsoft',    date: '2026-02-10', status: 'Completed'   },
  { id: 4,  employeeName: 'Yousuf Al Hammadi',    division: 'Transmission',     certName: 'Google Cloud ML Engineer',            provider: 'Google',       date: '2026-01-28', status: 'Completed'   },
  { id: 5,  employeeName: 'Maitha Al Suwaidi',    division: 'IT & Digital',     certName: 'Azure Solutions Architect Expert',    provider: 'Microsoft',    date: '2026-02-18', status: 'Completed'   },
  { id: 6,  employeeName: 'Omar Bin Saeed',       division: 'Finance',          certName: 'Power BI Data Analyst Associate',     provider: 'Microsoft',    date: '2025-12-05', status: 'Completed'   },
  { id: 7,  employeeName: 'Noura Al Dhaheri',     division: 'Distribution',     certName: 'AWS Machine Learning Specialty',      provider: 'AWS',          date: '2026-03-01', status: 'In Progress' },
  { id: 8,  employeeName: 'Khalid Nasser',        division: 'Generation',       certName: 'Microsoft AI-900 Fundamentals',       provider: 'Microsoft',    date: '2026-03-15', status: 'In Progress' },
  { id: 9,  employeeName: 'Fatima Al Zaabi',      division: 'HR',               certName: 'Google Data Analytics Certificate',   provider: 'Google',       date: '2026-02-28', status: 'In Progress' },
  { id: 10, employeeName: 'Layla Al Kaabi',       division: 'Finance',          certName: 'Power BI Data Analyst Associate',     provider: 'Microsoft',    date: '2026-03-20', status: 'In Progress' },
  { id: 11, employeeName: 'Hassan Al Mazrouei',   division: 'Corporate',        certName: 'Microsoft AI-900 Fundamentals',       provider: 'Microsoft',    date: '2026-04-01', status: 'In Progress' },
  { id: 12, employeeName: 'Mohammed Al Rashidi',  division: 'Distribution',     certName: 'Power BI Data Analyst Associate',     provider: 'Microsoft',    date: '2026-03-10', status: 'In Progress' },
  { id: 13, employeeName: 'Rashid Al Shamsi',     division: 'Transmission',     certName: 'AWS Cloud Practitioner',              provider: 'AWS',          date: '2025-06-10', status: 'Expired'     },
  { id: 14, employeeName: 'Ibrahim Al Nuaimi',    division: 'Generation',       certName: 'Microsoft AI-900 Fundamentals',       provider: 'Microsoft',    date: '2024-12-01', status: 'Expired'     },
  { id: 15, employeeName: 'Reem Al Blooshi',      division: 'Customer Service', certName: 'Google UX Design Certificate',        provider: 'Google',       date: '2025-09-15', status: 'Expired'     },
  { id: 16, employeeName: 'Hessa Al Falasi',      division: 'HR',               certName: 'Coursera ML Specialization',          provider: 'Coursera',     date: '2026-04-10', status: 'In Progress' },
  { id: 17, employeeName: 'Saif Al Qubaisi',      division: 'Corporate',        certName: 'AI for Everyone – DEWA Track',        provider: 'DEWA Internal', date: '2026-03-25', status: 'In Progress' },
]

// ─── ADKAR ──────────────────────────────────────────────────────
export const ADKAR_SCORES: AdkarScore[] = [
  { division: 'IT & Digital',     awareness: 88, desire: 82, knowledge: 91, ability: 85, reinforcement: 78 },
  { division: 'Generation',       awareness: 72, desire: 65, knowledge: 70, ability: 68, reinforcement: 60 },
  { division: 'Transmission',     awareness: 68, desire: 60, knowledge: 65, ability: 62, reinforcement: 55 },
  { division: 'Distribution',     awareness: 75, desire: 70, knowledge: 72, ability: 69, reinforcement: 65 },
  { division: 'HR',               awareness: 80, desire: 75, knowledge: 78, ability: 72, reinforcement: 70 },
  { division: 'Finance',          awareness: 65, desire: 58, knowledge: 62, ability: 58, reinforcement: 52 },
  { division: 'Customer Service', awareness: 78, desire: 72, knowledge: 75, ability: 70, reinforcement: 68 },
  { division: 'Corporate',        awareness: 55, desire: 45, knowledge: 50, ability: 42, reinforcement: 40 },
]

// ─── Skills ─────────────────────────────────────────────────────
export const SKILLS: Skill[] = [
  { name: 'Prompt Engineering',      count: 145, category: 'AI/ML'       },
  { name: 'Data Analysis',           count: 121, category: 'Data'        },
  { name: 'Data Visualization',      count: 99,  category: 'Data'        },
  { name: 'Power BI',                count: 98,  category: 'Tools'       },
  { name: 'Microsoft Copilot',       count: 118, category: 'Tools'       },
  { name: 'SQL & Databases',         count: 112, category: 'Data'        },
  { name: 'Python',                  count: 89,  category: 'Programming' },
  { name: 'Azure AI Services',       count: 74,  category: 'Tools'       },
  { name: 'Machine Learning',        count: 67,  category: 'AI/ML'       },
  { name: 'Cloud Architecture',      count: 56,  category: 'Programming' },
  { name: 'Natural Language Proc.',  count: 45,  category: 'AI/ML'       },
  { name: 'Computer Vision',         count: 38,  category: 'AI/ML'       },
  { name: 'GitHub Copilot',          count: 95,  category: 'Tools'       },
  { name: 'MLOps',                   count: 29,  category: 'AI/ML'       },
  { name: 'R Programming',           count: 22,  category: 'Programming' },
]

// ─── AI Tools ────────────────────────────────────────────────────
export const AI_TOOLS: AITool[] = [
  {
    name: 'ChatGPT', icon: 'bi-chat-dots-fill', users: 340, color: '#10a37f',
    departments: ['IT & Digital', 'HR', 'Customer Service', 'Finance', 'Corporate'],
    description: 'General-purpose AI for text generation, analysis & problem-solving',
    kpi: {
      adoptionRate: 84, monthlyGrowth: 8, queriesPerMonth: 68000, satisfactionScore: 4.4, avgSessionMins: 14,
      useCases: ['Content drafting', 'Code review', 'Data summarisation', 'Email writing', 'Policy Q&A'],
      trend: [{ month: 'Oct', users: 260 }, { month: 'Nov', users: 285 }, { month: 'Dec', users: 298 }, { month: 'Jan', users: 315 }, { month: 'Feb', users: 330 }, { month: 'Mar', users: 340 }],
      deptBreakdown: [{ dept: 'IT & Digital', count: 92 }, { dept: 'HR', count: 68 }, { dept: 'Customer Service', count: 74 }, { dept: 'Finance', count: 58 }, { dept: 'Corporate', count: 48 }],
    },
  },
  {
    name: 'Claude', icon: 'bi-braces-asterisk', users: 280, color: '#cc785c',
    departments: ['IT & Digital', 'Finance', 'HR', 'Distribution', 'Corporate'],
    description: 'Anthropic\'s AI assistant — long-context reasoning and safe document analysis',
    kpi: {
      adoptionRate: 69, monthlyGrowth: 12, queriesPerMonth: 51000, satisfactionScore: 4.5, avgSessionMins: 20,
      useCases: ['Long document analysis', 'Code generation', 'Policy review', 'Research synthesis', 'Report writing'],
      trend: [{ month: 'Oct', users: 190 }, { month: 'Nov', users: 215 }, { month: 'Dec', users: 235 }, { month: 'Jan', users: 252 }, { month: 'Feb', users: 268 }, { month: 'Mar', users: 280 }],
      deptBreakdown: [{ dept: 'IT & Digital', count: 88 }, { dept: 'Finance', count: 62 }, { dept: 'HR', count: 54 }, { dept: 'Distribution', count: 46 }, { dept: 'Corporate', count: 30 }],
    },
  },
  {
    name: 'Microsoft Copilot', icon: 'bi-windows', users: 280, color: '#0078d4',
    departments: ['IT & Digital', 'Finance', 'HR', 'Distribution', 'Corporate'],
    description: 'AI productivity assistant embedded in Microsoft 365 suite',
    kpi: {
      adoptionRate: 70, monthlyGrowth: 6, queriesPerMonth: 49500, satisfactionScore: 4.2, avgSessionMins: 11,
      useCases: ['Email drafting', 'Meeting summaries', 'Presentation creation', 'Excel analysis', 'Teams chat assistance'],
      trend: [{ month: 'Oct', users: 218 }, { month: 'Nov', users: 232 }, { month: 'Dec', users: 248 }, { month: 'Jan', users: 260 }, { month: 'Feb', users: 272 }, { month: 'Mar', users: 280 }],
      deptBreakdown: [{ dept: 'IT & Digital', count: 80 }, { dept: 'Finance', count: 65 }, { dept: 'HR', count: 58 }, { dept: 'Distribution', count: 44 }, { dept: 'Corporate', count: 33 }],
    },
  },
  {
    name: 'PowerBI', icon: 'bi-bar-chart-fill', users: 210, color: '#F5A623',
    departments: ['Finance', 'Distribution', 'Generation', 'Customer Service'],
    description: 'AI-driven analytics, smart narratives & anomaly detection',
    kpi: {
      adoptionRate: 62, monthlyGrowth: 5, queriesPerMonth: 32000, satisfactionScore: 4.1, avgSessionMins: 28,
      useCases: ['Executive dashboards', 'Anomaly detection', 'Forecasting', 'KPI tracking', 'Smart narratives'],
      trend: [{ month: 'Oct', users: 168 }, { month: 'Nov', users: 178 }, { month: 'Dec', users: 188 }, { month: 'Jan', users: 196 }, { month: 'Feb', users: 204 }, { month: 'Mar', users: 210 }],
      deptBreakdown: [{ dept: 'Finance', count: 72 }, { dept: 'Distribution', count: 55 }, { dept: 'Generation', count: 48 }, { dept: 'Customer Service', count: 35 }],
    },
  },
  {
    name: 'Azure AI Services', icon: 'bi-cloud-fill', users: 158, color: '#0089d6',
    departments: ['IT & Digital', 'Transmission', 'Distribution'],
    description: 'Cloud APIs for vision, speech, language & decision intelligence',
    kpi: {
      adoptionRate: 45, monthlyGrowth: 9, queriesPerMonth: 125000, satisfactionScore: 4.0, avgSessionMins: 6,
      useCases: ['Image recognition', 'Speech-to-text', 'Sentiment analysis', 'Translation', 'Anomaly detection'],
      trend: [{ month: 'Oct', users: 112 }, { month: 'Nov', users: 122 }, { month: 'Dec', users: 132 }, { month: 'Jan', users: 142 }, { month: 'Feb', users: 150 }, { month: 'Mar', users: 158 }],
      deptBreakdown: [{ dept: 'IT & Digital', count: 92 }, { dept: 'Transmission', count: 38 }, { dept: 'Distribution', count: 28 }],
    },
  },
  {
    name: 'GitHub Copilot', icon: 'bi-code-slash', users: 95, color: '#24292e',
    departments: ['IT & Digital', 'Transmission'],
    description: 'AI pair-programming that suggests code in real time',
    kpi: {
      adoptionRate: 78, monthlyGrowth: 11, queriesPerMonth: 88000, satisfactionScore: 4.6, avgSessionMins: 45,
      useCases: ['Code completion', 'Unit test generation', 'Documentation', 'Bug fixing', 'Refactoring'],
      trend: [{ month: 'Oct', users: 62 }, { month: 'Nov', users: 70 }, { month: 'Dec', users: 76 }, { month: 'Jan', users: 82 }, { month: 'Feb', users: 89 }, { month: 'Mar', users: 95 }],
      deptBreakdown: [{ dept: 'IT & Digital', count: 78 }, { dept: 'Transmission', count: 17 }],
    },
  },
  {
    name: 'Power Automate', icon: 'bi-lightning-fill', users: 130, color: '#0066ff',
    departments: ['HR', 'Finance', 'Customer Service', 'Corporate'],
    description: 'Intelligent workflow automation with AI Builder capabilities',
    kpi: {
      adoptionRate: 40, monthlyGrowth: 7, queriesPerMonth: 22000, satisfactionScore: 3.9, avgSessionMins: 8,
      useCases: ['Invoice processing', 'Leave approvals', 'Report scheduling', 'Document classification', 'Alerts'],
      trend: [{ month: 'Oct', users: 98 }, { month: 'Nov', users: 106 }, { month: 'Dec', users: 112 }, { month: 'Jan', users: 118 }, { month: 'Feb', users: 125 }, { month: 'Mar', users: 130 }],
      deptBreakdown: [{ dept: 'HR', count: 42 }, { dept: 'Finance', count: 38 }, { dept: 'Customer Service', count: 30 }, { dept: 'Corporate', count: 20 }],
    },
  },
  {
    name: 'Azure OpenAI', icon: 'bi-braces-asterisk', users: 78, color: '#003366',
    departments: ['IT & Digital', 'Corporate'],
    description: 'Enterprise-grade GPT models with DEWA compliance & data controls',
    kpi: {
      adoptionRate: 32, monthlyGrowth: 15, queriesPerMonth: 41000, satisfactionScore: 4.3, avgSessionMins: 22,
      useCases: ['Custom chatbots', 'Internal search', 'Document Q&A', 'API integrations', 'Prototype AI apps'],
      trend: [{ month: 'Oct', users: 44 }, { month: 'Nov', users: 52 }, { month: 'Dec', users: 58 }, { month: 'Jan', users: 65 }, { month: 'Feb', users: 72 }, { month: 'Mar', users: 78 }],
      deptBreakdown: [{ dept: 'IT & Digital', count: 58 }, { dept: 'Corporate', count: 20 }],
    },
  },
  // ── New tools ──────────────────────────────────────────────
  {
    name: 'Rammas', icon: 'bi-chat-dots-fill', users: 185, color: '#00897b',
    departments: ['Customer Service', 'Corporate', 'HR', 'IT & Digital'],
    description: 'DEWA\'s AI-powered Arabic/English virtual assistant for customer queries',
    kpi: {
      adoptionRate: 72, monthlyGrowth: 18, queriesPerMonth: 42000, satisfactionScore: 4.2, avgSessionMins: 7,
      useCases: ['Bill enquiries', 'Outage reporting', 'Service requests', 'FAQ automation', 'Arabic NLP'],
      trend: [{ month: 'Oct', users: 95 }, { month: 'Nov', users: 115 }, { month: 'Dec', users: 135 }, { month: 'Jan', users: 152 }, { month: 'Feb', users: 170 }, { month: 'Mar', users: 185 }],
      deptBreakdown: [{ dept: 'Customer Service', count: 82 }, { dept: 'Corporate', count: 42 }, { dept: 'HR', count: 38 }, { dept: 'IT & Digital', count: 23 }],
    },
  },
  {
    name: 'Rammas At Work', icon: 'bi-people-fill', users: 128, color: '#00695c',
    departments: ['HR', 'Finance', 'Corporate', 'IT & Digital'],
    description: 'Workplace-integrated Rammas for internal DEWA employee productivity',
    kpi: {
      adoptionRate: 58, monthlyGrowth: 24, queriesPerMonth: 18500, satisfactionScore: 4.0, avgSessionMins: 12,
      useCases: ['Leave balance checks', 'Policy lookups', 'HR self-service', 'Internal announcements', 'Employee onboarding'],
      trend: [{ month: 'Oct', users: 52 }, { month: 'Nov', users: 68 }, { month: 'Dec', users: 84 }, { month: 'Jan', users: 98 }, { month: 'Feb', users: 114 }, { month: 'Mar', users: 128 }],
      deptBreakdown: [{ dept: 'HR', count: 48 }, { dept: 'Finance', count: 32 }, { dept: 'Corporate', count: 28 }, { dept: 'IT & Digital', count: 20 }],
    },
  },
  {
    name: 'Genspark', icon: 'bi-lightning-charge-fill', users: 62, color: '#f97316',
    departments: ['IT & Digital', 'Corporate', 'Customer Service'],
    description: 'AI-powered search & content spark generation for rapid research',
    kpi: {
      adoptionRate: 28, monthlyGrowth: 35, queriesPerMonth: 9200, satisfactionScore: 3.8, avgSessionMins: 18,
      useCases: ['AI-powered search', 'Report generation', 'Competitive research', 'Slide summarisation', 'Knowledge discovery'],
      trend: [{ month: 'Oct', users: 18 }, { month: 'Nov', users: 26 }, { month: 'Dec', users: 36 }, { month: 'Jan', users: 46 }, { month: 'Feb', users: 55 }, { month: 'Mar', users: 62 }],
      deptBreakdown: [{ dept: 'IT & Digital', count: 32 }, { dept: 'Corporate', count: 18 }, { dept: 'Customer Service', count: 12 }],
    },
  },
  {
    name: 'Notebook LLM', icon: 'bi-book-fill', users: 88, color: '#4f46e5',
    departments: ['IT & Digital', 'Finance', 'Distribution', 'Corporate'],
    description: 'Google NotebookLM for deep document analysis and research synthesis',
    kpi: {
      adoptionRate: 35, monthlyGrowth: 28, queriesPerMonth: 14600, satisfactionScore: 4.3, avgSessionMins: 25,
      useCases: ['Document Q&A', 'Research synthesis', 'Study guides', 'Podcast generation', 'Contract review'],
      trend: [{ month: 'Oct', users: 28 }, { month: 'Nov', users: 38 }, { month: 'Dec', users: 52 }, { month: 'Jan', users: 64 }, { month: 'Feb', users: 76 }, { month: 'Mar', users: 88 }],
      deptBreakdown: [{ dept: 'IT & Digital', count: 38 }, { dept: 'Finance', count: 22 }, { dept: 'Distribution', count: 16 }, { dept: 'Corporate', count: 12 }],
    },
  },
]

// ─── Division Adoption ───────────────────────────────────────────
export const DIVISION_ADOPTION: DivisionAdoption[] = [
  { division: 'IT & Digital',     trained: 145, total: 160, pct: 91 },
  { division: 'HR',               trained: 68,  total: 90,  pct: 76 },
  { division: 'Customer Service', trained: 120, total: 160, pct: 75 },
  { division: 'Distribution',     trained: 110, total: 155, pct: 71 },
  { division: 'Finance',          trained: 55,  total: 80,  pct: 69 },
  { division: 'Generation',       trained: 89,  total: 130, pct: 68 },
  { division: 'Transmission',     trained: 62,  total: 100, pct: 62 },
  { division: 'Corporate',        trained: 45,  total: 90,  pct: 50 },
]
