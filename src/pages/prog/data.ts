// ─────────────────────────────────────────────────────────────
//  DEWA COE — Programs & Events dummy data
//  Today: 2026-03-20
// ─────────────────────────────────────────────────────────────

export type ProgramStatus = 'Active' | 'Completed' | 'Upcoming'
export type EventType     = 'Workshop' | 'Seminar' | 'Hackathon' | 'Webinar' | 'Town Hall'
export type EventStatus   = 'Upcoming' | 'Completed' | 'Cancelled'

export interface Program {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: ProgramStatus
  ownerDivision: string
  eventCount: number
  objectives: string[]
  targetAudience: string
  totalParticipants: number
}

export interface Speaker {
  name: string
  title: string
  division: string
}

export interface AppEvent {
  id: string
  programId: string
  title: string
  type: EventType
  date: string   // YYYY-MM-DD
  time: string
  location: string
  attendees: number
  status: EventStatus
  description: string
  speakers: Speaker[]
  attendeesList: { name: string; division: string }[]
  outcomes?: string[]
  // Extended Dataverse fields
  duration?: string
  invitees?: number
  adoptionRate?: number
  techStack?: string
  eventCode?: string
  targetAudience?: string
  division?: string
  program?: string
}

// ─── Programs ────────────────────────────────────────────────
export const PROGRAMS: Program[] = [
  {
    id: 'p1',
    name: 'COE AI Kickoff Program',
    description: 'Flagship initiative to launch DEWA\'s AI Center of Excellence, establishing governance, strategy, and cross-division AI readiness through leadership workshops and town halls.',
    startDate: '2026-01-15',
    endDate: '2026-06-30',
    status: 'Active',
    ownerDivision: 'Corporate',
    eventCount: 3,
    objectives: [
      'Establish AI governance framework across all DEWA divisions',
      'Align executive leadership on AI strategy and investment priorities',
      'Launch COE operations with defined charter and KPIs',
    ],
    targetAudience: 'Executive Leadership, Division Heads, COE Core Team',
    totalParticipants: 320,
  },
  {
    id: 'p2',
    name: 'Digital AI Literacy Drive',
    description: 'A comprehensive upskilling program covering hands-on AI tools, prompt engineering, and Azure AI services for technical and semi-technical staff across all DEWA divisions.',
    startDate: '2026-02-01',
    endDate: '2026-12-31',
    status: 'Active',
    ownerDivision: 'IT & Digital',
    eventCount: 4,
    objectives: [
      'Train 1,500 employees in foundational AI tools by Q4 2026',
      'Build hands-on proficiency in Microsoft 365 AI features',
      'Develop internal pool of certified AI practitioners',
    ],
    targetAudience: 'All DEWA Staff — Priority: IT, Operations, Finance',
    totalParticipants: 520,
  },
  {
    id: 'p3',
    name: 'DEWA AI Hackathon 2026',
    description: 'Flagship internal innovation competition challenging teams to develop AI-powered prototypes addressing real DEWA operational challenges. Teams compete across energy, water, and customer service domains.',
    startDate: '2026-03-01',
    endDate: '2026-03-15',
    status: 'Completed',
    ownerDivision: 'IT & Digital',
    eventCount: 2,
    objectives: [
      'Source 10+ viable AI prototype ideas from internal talent',
      'Build innovation culture and cross-functional collaboration',
      'Identify high-potential AI projects for 2026 pipeline',
    ],
    targetAudience: 'All DEWA Staff — Open Innovation',
    totalParticipants: 172,
  },
  {
    id: 'p4',
    name: 'Data Science Fundamentals Track',
    description: 'Structured learning track providing foundational Python programming and machine learning skills to analysts and engineers, enabling data-driven decision making across operations.',
    startDate: '2025-10-01',
    endDate: '2026-02-28',
    status: 'Completed',
    ownerDivision: 'IT & Digital',
    eventCount: 2,
    objectives: [
      'Graduate 100+ employees with practical data science competencies',
      'Enable self-service analytics using Python and ML',
      'Create internal network of data science champions',
    ],
    targetAudience: 'Engineers, Analysts, Operations Staff',
    totalParticipants: 88,
  },
  {
    id: 'p5',
    name: 'ML for Operations Initiative',
    description: 'Applied machine learning program targeting Generation and Transmission division staff, focused on predictive maintenance models, grid anomaly detection, and operational AI use cases.',
    startDate: '2026-03-01',
    endDate: '2026-09-30',
    status: 'Active',
    ownerDivision: 'Generation',
    eventCount: 2,
    objectives: [
      'Deploy 3 ML models in operational environments by Q3 2026',
      'Train 60 engineers in ML model monitoring and maintenance',
      'Reduce unplanned downtime through predictive AI insights',
    ],
    targetAudience: 'Generation & Transmission Engineers, Plant Managers',
    totalParticipants: 240,
  },
  {
    id: 'p6',
    name: 'AI Ethics & Governance Series',
    description: 'A thought-leadership series exploring responsible AI deployment, data privacy, algorithmic fairness, and regulatory compliance within DEWA\'s operational and customer-facing contexts.',
    startDate: '2026-02-01',
    endDate: '2026-08-31',
    status: 'Active',
    ownerDivision: 'Corporate',
    eventCount: 2,
    objectives: [
      'Establish DEWA\'s AI Ethics Charter and responsible AI guidelines',
      'Train 200+ staff on AI bias, privacy, and governance principles',
      'Align AI practices with UAE AI Strategy 2031 mandates',
    ],
    targetAudience: 'Legal, Compliance, HR, Senior Leadership, All Staff',
    totalParticipants: 170,
  },
  {
    id: 'p7',
    name: 'Customer Intelligence AI Program',
    description: 'Customer Service division-led program deploying AI-powered chatbots, sentiment analysis tools, and predictive customer journey models to elevate DEWA\'s customer satisfaction scores.',
    startDate: '2026-03-01',
    endDate: '2026-10-31',
    status: 'Active',
    ownerDivision: 'Customer Service',
    eventCount: 1,
    objectives: [
      'Achieve 90%+ CSAT score through AI-personalized service',
      'Deploy omnichannel AI assistant for 500K+ customers',
      'Reduce average handling time by 35% using AI triage',
    ],
    targetAudience: 'Customer Service Staff, CX Designers, Digital Team',
    totalParticipants: 65,
  },
  {
    id: 'p8',
    name: 'Predictive Maintenance AI Initiative',
    description: 'Next-generation AI program applying computer vision and sensor fusion to predict equipment failures at power generation plants, targeting a 40% reduction in unplanned outages.',
    startDate: '2026-05-01',
    endDate: '2026-12-31',
    status: 'Upcoming',
    ownerDivision: 'Generation',
    eventCount: 0,
    objectives: [
      'Develop computer vision models for turbine health monitoring',
      'Integrate IoT sensor data with ML anomaly detection',
      'Achieve 40% reduction in unplanned maintenance events',
    ],
    targetAudience: 'Plant Engineers, Maintenance Technicians, Asset Managers',
    totalParticipants: 0,
  },
  {
    id: 'p9',
    name: 'Finance AI Automation Program',
    description: 'Robotic process automation and AI-assisted forecasting program for Finance division, targeting invoice processing, budget variance analysis, and risk scoring automation.',
    startDate: '2026-06-01',
    endDate: '2026-12-31',
    status: 'Upcoming',
    ownerDivision: 'Finance',
    eventCount: 0,
    objectives: [
      'Automate 70% of routine financial processing tasks via RPA + AI',
      'Deploy AI-powered budget forecasting with 95% accuracy',
      'Reduce financial reporting cycle from 5 days to 1 day',
    ],
    targetAudience: 'Finance Analysts, Budget Planners, Accounting Staff',
    totalParticipants: 0,
  },
  {
    id: 'p10',
    name: 'Smart Grid AI Research Program',
    description: 'Strategic R&D collaboration with UAE universities to develop AI algorithms for smart grid load balancing, demand response optimization, and renewable energy integration at scale.',
    startDate: '2026-07-01',
    endDate: '2027-03-31',
    status: 'Upcoming',
    ownerDivision: 'Transmission',
    eventCount: 0,
    objectives: [
      'Publish 3 peer-reviewed papers on grid AI optimization',
      'Prototype real-time load forecasting model for Dubai grid',
      'Establish 2 university research partnerships',
    ],
    targetAudience: 'Transmission Engineers, R&D Team, Academic Partners',
    totalParticipants: 0,
  },
]

// ─── Events ──────────────────────────────────────────────────
export const EVENTS: AppEvent[] = [

  // ── COMPLETED ──────────────────────────────────────────────

  {
    id: 'e1',
    programId: 'p1',
    title: 'AI Strategy & Vision Workshop',
    type: 'Workshop',
    date: '2026-02-05',
    time: '09:00 – 13:00',
    location: 'DEWA HQ — Conference Room A, Level 10',
    attendees: 45,
    status: 'Completed',
    description: 'A half-day strategic workshop for executive and senior leadership to define DEWA\'s AI ambition, establish the COE charter, and align on a 3-year AI roadmap. Included facilitated breakout sessions on strategic priorities per division.',
    speakers: [
      { name: 'H.E. Ahmed Al Mansouri', title: 'Chief Digital Officer', division: 'Corporate' },
      { name: 'Dr. Sarah Al Hashimi', title: 'Head of AI Research', division: 'IT & Digital' },
    ],
    attendeesList: [
      { name: 'Khalid Nasser', division: 'Generation' },
      { name: 'Fatima Al Zaabi', division: 'HR' },
      { name: 'Maitha Al Suwaidi', division: 'IT & Digital' },
      { name: 'Omar Bin Saeed', division: 'Finance' },
      { name: 'Mariam Al Ketbi', division: 'Customer Service' },
    ],
    outcomes: [
      'Approved DEWA AI Strategy 2026–2029 with AED 120M investment commitment',
      'COE charter signed by 8 division heads',
      '5 strategic AI use cases prioritized for 2026 deployment',
    ],
  },
  {
    id: 'e2',
    programId: 'p4',
    title: 'Python for Data Science — Cohort 1',
    type: 'Workshop',
    date: '2026-02-12',
    time: '08:30 – 17:00',
    location: 'Innovation Hub — Lab 3, Building 7',
    attendees: 30,
    status: 'Completed',
    description: 'Full-day intensive workshop introducing Python fundamentals, pandas data manipulation, matplotlib visualization, and scikit-learn basics. Participants worked through DEWA energy consumption datasets.',
    speakers: [
      { name: 'Sara Al Hashimi', title: 'Data Scientist', division: 'IT & Digital' },
      { name: 'Ahmed Al Mansoori', title: 'Senior Software Engineer', division: 'IT & Digital' },
    ],
    attendeesList: [
      { name: 'Rashid Al Shamsi', division: 'Transmission' },
      { name: 'Noura Al Dhaheri', division: 'Distribution' },
      { name: 'Hessa Al Falasi', division: 'HR' },
      { name: 'Ibrahim Al Nuaimi', division: 'Generation' },
      { name: 'Layla Al Kaabi', division: 'Finance' },
    ],
    outcomes: [
      '28 of 30 participants passed the end-of-day assessment',
      'Cohort 2 immediately requested due to demand',
      'Three participants enrolled in the advanced ML track',
    ],
  },
  {
    id: 'e3',
    programId: 'p6',
    title: 'AI Ethics: Principles & Practice Seminar',
    type: 'Seminar',
    date: '2026-02-18',
    time: '14:00 – 17:00',
    location: 'Main Auditorium — DEWA HQ',
    attendees: 120,
    status: 'Completed',
    description: 'An executive seminar presenting the ethical dimensions of AI deployment — algorithmic bias, explainability, data privacy, and UAE regulatory considerations. Panel discussion with internal and external experts.',
    speakers: [
      { name: 'Prof. Nadia Al Rashid', title: 'AI Ethics Researcher', division: 'UAE AI Office (Guest)' },
      { name: 'Hassan Al Mazrouei', title: 'Strategy Analyst', division: 'Corporate' },
      { name: 'Aisha Al Muhairi', title: 'Cybersecurity Specialist', division: 'IT & Digital' },
    ],
    attendeesList: [
      { name: 'Saif Al Qubaisi', division: 'Corporate' },
      { name: 'Yousuf Al Hammadi', division: 'Transmission' },
      { name: 'Reem Al Blooshi', division: 'Customer Service' },
      { name: 'Khalid Nasser', division: 'Generation' },
      { name: 'Omar Bin Saeed', division: 'Finance' },
    ],
    outcomes: [
      'DEWA Responsible AI Principles document drafted and circulated',
      'Ethics review process incorporated into AI project intake',
      '93% of attendees rated session "highly valuable"',
    ],
  },
  {
    id: 'e4',
    programId: 'p2',
    title: 'Machine Learning for Engineers',
    type: 'Workshop',
    date: '2026-02-25',
    time: '09:00 – 16:00',
    location: 'Training Centre — Room B',
    attendees: 28,
    status: 'Completed',
    description: 'Applied ML workshop designed for non-data-science engineers. Covered supervised and unsupervised learning concepts, Azure ML Studio, and how to interpret model outputs for operational decision-making.',
    speakers: [
      { name: 'Maitha Al Suwaidi', title: 'Cloud Architect', division: 'IT & Digital' },
      { name: 'Yousuf Al Hammadi', title: 'Electrical Engineer', division: 'Transmission' },
    ],
    attendeesList: [
      { name: 'Rashid Al Shamsi', division: 'Transmission' },
      { name: 'Ibrahim Al Nuaimi', division: 'Generation' },
      { name: 'Mohammed Al Rashidi', division: 'Distribution' },
      { name: 'Noura Al Dhaheri', division: 'Distribution' },
      { name: 'Hassan Al Mazrouei', division: 'Corporate' },
    ],
    outcomes: [
      'All 28 attendees completed Azure ML Fundamentals assessment',
      '6 participants identified as candidates for ML specialization track',
      'Workshop materials published on DEWA internal learning portal',
    ],
  },
  {
    id: 'e5',
    programId: 'p3',
    title: 'DEWA AI Hackathon 2026 — Kickoff & Ideation Day',
    type: 'Hackathon',
    date: '2026-03-01',
    time: '08:00 – 20:00',
    location: 'Innovation Hub — Main Hall & Labs',
    attendees: 80,
    status: 'Completed',
    description: 'The opening day of DEWA\'s first-ever AI Hackathon. Teams of 4–6 members presented problem statements, received AI toolkits, and began prototype development. 18 teams across 3 tracks: Energy AI, Customer AI, and Operational AI.',
    speakers: [
      { name: 'H.E. Ahmed Al Mansouri', title: 'Chief Digital Officer', division: 'Corporate' },
      { name: 'Sara Al Hashimi', title: 'Data Scientist', division: 'IT & Digital' },
    ],
    attendeesList: [
      { name: 'Ahmed Al Mansoori', division: 'IT & Digital' },
      { name: 'Maitha Al Suwaidi', division: 'IT & Digital' },
      { name: 'Reem Al Blooshi', division: 'Customer Service' },
      { name: 'Yousuf Al Hammadi', division: 'Transmission' },
      { name: 'Khalid Nasser', division: 'Generation' },
    ],
    outcomes: [
      '18 teams registered across 3 challenge tracks',
      'Top 3 tracks: Predictive Maintenance (6), Customer Chatbot (5), Smart Metering (4)',
      'All teams received Azure credits and DEWA API sandbox access',
    ],
  },
  {
    id: 'e6',
    programId: 'p7',
    title: 'Customer AI Experience Demo Day',
    type: 'Seminar',
    date: '2026-03-08',
    time: '13:00 – 16:30',
    location: 'Customer Experience Centre — Level 2',
    attendees: 65,
    status: 'Completed',
    description: 'Live demonstration event showcasing AI-powered customer service tools including the DEWA Virtual Assistant v2.0, sentiment analysis dashboard, and next-best-action recommendation engine. Customer service staff given hands-on trial access.',
    speakers: [
      { name: 'Mariam Al Ketbi', title: 'Customer Experience Lead', division: 'Customer Service' },
      { name: 'Reem Al Blooshi', title: 'Digital Experience Analyst', division: 'Customer Service' },
    ],
    attendeesList: [
      { name: 'Fatima Al Zaabi', division: 'HR' },
      { name: 'Hassan Al Mazrouei', division: 'Corporate' },
      { name: 'Layla Al Kaabi', division: 'Finance' },
      { name: 'Saif Al Qubaisi', division: 'Corporate' },
    ],
    outcomes: [
      'DEWA Virtual Assistant v2.0 approved for production rollout',
      '94% of attendees expressed willingness to adopt AI-assisted workflows',
      'Chatbot deflection rate target set at 60% for Q2 2026',
    ],
  },
  {
    id: 'e7',
    programId: 'p2',
    title: 'AI Tools Hands-On Lab',
    type: 'Workshop',
    date: '2026-03-10',
    time: '10:00 – 14:00',
    location: 'Training Centre — Room A',
    attendees: 35,
    status: 'Completed',
    description: 'Practical lab session covering Microsoft Copilot in Excel and Word, ChatGPT for business writing, Power BI AI narratives, and DALL-E for communications design. Each participant worked through 5 real DEWA use case scenarios.',
    speakers: [
      { name: 'Ahmed Al Mansoori', title: 'Senior Software Engineer', division: 'IT & Digital' },
      { name: 'Hessa Al Falasi', title: 'L&D Specialist', division: 'HR' },
    ],
    attendeesList: [
      { name: 'Fatima Al Zaabi', division: 'HR' },
      { name: 'Omar Bin Saeed', division: 'Finance' },
      { name: 'Mariam Al Ketbi', division: 'Customer Service' },
      { name: 'Mohammed Al Rashidi', division: 'Distribution' },
    ],
    outcomes: [
      'Microsoft Copilot licenses provisioned for 200+ additional staff',
      'Copilot onboarding guide co-developed by HR and IT',
      'Average productivity improvement reported: 2.5 hours/week per user',
    ],
  },
  {
    id: 'e8',
    programId: 'p4',
    title: 'ML Model Deployment Lab',
    type: 'Workshop',
    date: '2026-03-12',
    time: '09:00 – 17:00',
    location: 'Training Centre — Lab 2',
    attendees: 0,
    status: 'Cancelled',
    description: 'Advanced workshop on MLOps, model containerization with Docker, and Azure ML deployment pipelines. Session was cancelled due to key trainer unavailability and has been rescheduled to May 2026.',
    speakers: [],
    attendeesList: [],
    outcomes: [],
  },
  {
    id: 'e9',
    programId: 'p3',
    title: 'DEWA AI Hackathon 2026 — Finale & Awards Ceremony',
    type: 'Hackathon',
    date: '2026-03-15',
    time: '09:00 – 18:00',
    location: 'Innovation Hub — Main Hall',
    attendees: 92,
    status: 'Completed',
    description: 'The grand finale of DEWA\'s first AI Hackathon. Teams presented live demos to a panel of executive judges. Winners awarded AED 50,000 in prizes. Top 3 projects shortlisted for POC funding and fast-track into DEWA\'s AI project pipeline.',
    speakers: [
      { name: 'H.E. Ahmed Al Mansouri', title: 'Chief Digital Officer', division: 'Corporate' },
      { name: 'Aisha Al Muhairi', title: 'Cybersecurity Specialist', division: 'IT & Digital' },
      { name: 'Dr. Sarah Al Hashimi', title: 'Head of AI Research', division: 'IT & Digital' },
    ],
    attendeesList: [
      { name: 'Ahmed Al Mansoori', division: 'IT & Digital' },
      { name: 'Maitha Al Suwaidi', division: 'IT & Digital' },
      { name: 'Yousuf Al Hammadi', division: 'Transmission' },
      { name: 'Noura Al Dhaheri', division: 'Distribution' },
      { name: 'Khalid Nasser', division: 'Generation' },
    ],
    outcomes: [
      '1st Place: "PredictGen" — AI turbine failure prediction (Team Generation+IT)',
      '2nd Place: "SmartCX Bot" — Multilingual customer service AI (Team CS)',
      '3rd Place: "GridSense" — Real-time load anomaly detection (Team Transmission)',
      'AED 120,000 total in prize money and POC funding committed',
    ],
  },
  {
    id: 'e10',
    programId: 'p5',
    title: 'ML in Grid Operations — Pilot Review Seminar',
    type: 'Seminar',
    date: '2026-03-18',
    time: '13:30 – 16:00',
    location: 'Grid Control Centre — Briefing Room',
    attendees: 40,
    status: 'Completed',
    description: 'Internal review seminar presenting results from the 3-month ML pilot in Generation and Transmission operations. Data from 12 sub-stations analyzed using anomaly detection models. Senior engineers and managers reviewed model performance and failure predictions.',
    speakers: [
      { name: 'Rashid Al Shamsi', title: 'Grid Operations Engineer', division: 'Transmission' },
      { name: 'Yousuf Al Hammadi', title: 'Electrical Engineer', division: 'Transmission' },
    ],
    attendeesList: [
      { name: 'Khalid Nasser', division: 'Generation' },
      { name: 'Ibrahim Al Nuaimi', division: 'Generation' },
      { name: 'Noura Al Dhaheri', division: 'Distribution' },
      { name: 'Mohammed Al Rashidi', division: 'Distribution' },
    ],
    outcomes: [
      'ML model achieved 87% accuracy in anomaly detection across pilot sub-stations',
      'Phase 2 expansion approved — 40 additional sub-stations by Q3 2026',
      'Integration with SCADA systems approved for development',
    ],
  },

  // ── UPCOMING ────────────────────────────────────────────────

  {
    id: 'e11',
    programId: 'p5',
    title: 'AI in Smart Grid Operations — Webinar Series Ep.1',
    type: 'Webinar',
    date: '2026-03-26',
    time: '11:00 – 12:30',
    location: 'Virtual — Microsoft Teams (link sent to registrants)',
    attendees: 200,
    status: 'Upcoming',
    description: 'First episode of the Smart Grid AI Webinar Series, covering AI applications in demand forecasting, fault detection, and renewable energy integration. International experts from the IEA and Siemens Energy join as guest speakers.',
    speakers: [
      { name: 'Yousuf Al Hammadi', title: 'Electrical Engineer', division: 'Transmission' },
      { name: 'Dr. Klaus Weber', title: 'Smart Grid AI Lead', division: 'Siemens Energy (Guest)' },
    ],
    attendeesList: [],
    outcomes: [],
  },
  {
    id: 'e12',
    programId: 'p2',
    title: 'Prompt Engineering Masterclass',
    type: 'Workshop',
    date: '2026-04-02',
    time: '09:00 – 13:00',
    location: 'Innovation Hub — Lab 1',
    attendees: 35,
    status: 'Upcoming',
    description: 'Advanced half-day workshop teaching systematic prompt design for business applications. Participants will master chain-of-thought prompting, few-shot learning, and building reusable prompt libraries for DEWA-specific workflows.',
    speakers: [
      { name: 'Sara Al Hashimi', title: 'Data Scientist', division: 'IT & Digital' },
      { name: 'Ahmed Al Mansoori', title: 'Senior Software Engineer', division: 'IT & Digital' },
    ],
    attendeesList: [],
    outcomes: [],
  },
  {
    id: 'e13',
    programId: 'p1',
    title: 'AI Leaders Forum — Q2 2026',
    type: 'Seminar',
    date: '2026-04-09',
    time: '14:00 – 17:30',
    location: 'Main Auditorium — DEWA HQ',
    attendees: 150,
    status: 'Upcoming',
    description: 'Quarterly forum bringing together DEWA senior leadership to review AI program progress, celebrate milestones, and align on Q3 priorities. Features a "State of AI at DEWA" presentation and panel discussion with division AI champions.',
    speakers: [
      { name: 'H.E. Ahmed Al Mansouri', title: 'Chief Digital Officer', division: 'Corporate' },
      { name: 'Dr. Sarah Al Hashimi', title: 'Head of AI Research', division: 'IT & Digital' },
      { name: 'Aisha Al Muhairi', title: 'Cybersecurity Specialist', division: 'IT & Digital' },
    ],
    attendeesList: [],
    outcomes: [],
  },
  {
    id: 'e14',
    programId: 'p2',
    title: 'Azure AI Services Deep Dive',
    type: 'Workshop',
    date: '2026-04-14',
    time: '09:00 – 16:30',
    location: 'Training Centre — Room C',
    attendees: 40,
    status: 'Upcoming',
    description: 'Full-day advanced technical workshop on Azure Cognitive Services, Azure OpenAI Service, and AI Builder in Power Platform. Participants build a working AI solution prototype using DEWA infrastructure by end of day.',
    speakers: [
      { name: 'Maitha Al Suwaidi', title: 'Cloud Architect', division: 'IT & Digital' },
      { name: 'Aisha Al Muhairi', title: 'Cybersecurity Specialist', division: 'IT & Digital' },
    ],
    attendeesList: [],
    outcomes: [],
  },
  {
    id: 'e15',
    programId: 'p1',
    title: 'COE Town Hall — AI Roadmap Q2 Update',
    type: 'Town Hall',
    date: '2026-04-22',
    time: '10:00 – 11:30',
    location: 'Main Auditorium + Virtual Broadcast',
    attendees: 400,
    status: 'Upcoming',
    description: 'Company-wide town hall broadcast presenting the latest AI initiative progress, Q1 outcomes, upcoming program launches, and open Q&A with the COE leadership team. Available live and on-demand for all DEWA employees globally.',
    speakers: [
      { name: 'H.E. Ahmed Al Mansouri', title: 'Chief Digital Officer', division: 'Corporate' },
      { name: 'Hassan Al Mazrouei', title: 'Strategy Analyst', division: 'Corporate' },
    ],
    attendeesList: [],
    outcomes: [],
  },
  {
    id: 'e16',
    programId: 'p6',
    title: 'AI Safety & Compliance Workshop',
    type: 'Workshop',
    date: '2026-04-28',
    time: '09:00 – 13:00',
    location: 'DEWA HQ — Room 201, Level 5',
    attendees: 50,
    status: 'Upcoming',
    description: 'Practical workshop on AI system security, model governance, data compliance (GDPR / UAE PDPL), and incident response planning for AI failures. Jointly delivered by Legal, IT Security, and the COE.',
    speakers: [
      { name: 'Aisha Al Muhairi', title: 'Cybersecurity Specialist', division: 'IT & Digital' },
      { name: 'Saif Al Qubaisi', title: 'Communications Specialist', division: 'Corporate' },
    ],
    attendeesList: [],
    outcomes: [],
  },
]

// ─── Helpers ─────────────────────────────────────────────────
export function getEventsByProgram(programId: string): AppEvent[] {
  return EVENTS.filter(e => e.programId === programId)
}
