// ── Discovery Catalog — Demand to Delivery mock data ─────────

export type DemandStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'In Development'
  | 'In Testing'
  | 'Delivered'
  | 'Rejected'
  | 'On Hold'

export type ApprovalStatus = 'Pending' | 'Approved' | 'Conditional' | 'Rejected'
export type DemandType = 'AI' | 'Non-AI'
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low'
export type Complexity = 'Simple' | 'Medium' | 'Complex'

export interface Demand {
  id: string                     // e.g. D2D-2025-001
  title: string
  description: string

  // Classification
  type: DemandType
  category: string               // Computer Vision, NLP, RPA, Cloud, etc.
  technology: string             // specific tech stack / tool
  priority: Priority
  complexity: Complexity

  // Organisational
  department: string
  division: string
  raisedBy: string
  projectSponsor: string

  // Timeline
  submissionDate: string         // ISO date
  expectedDeliveryDate: string
  actualDeliveryDate?: string

  // Approval
  approver: string
  approvalStatus: ApprovalStatus
  approvalDate?: string
  approvalRemarks?: string

  // Status
  status: DemandStatus

  // Business value
  benefitDescription: string
  quantifiedBenefit: string      // e.g. "~AED 1.2M annual saving"
  roi: number                    // percentage
  businessValueScore: number     // 1-10

  // Integration
  demandUrl: string
}

export const DEMANDS: Demand[] = [
  {
    id: 'D2D-2025-001',
    title: 'AI-Powered Predictive Maintenance for HV Assets',
    description:
      'Deploy a machine-learning model to predict failures in high-voltage transformers and switchgear using IoT sensor data, reducing unplanned outages by early fault detection.',
    type: 'AI',
    category: 'Predictive Analytics',
    technology: 'Azure ML, IoT Hub, Python',
    priority: 'Critical',
    complexity: 'Complex',
    department: 'Network Operations',
    division: 'Electricity Distribution',
    raisedBy: 'Ahmed Al Mansoori',
    projectSponsor: 'Eng. Khalid Al Suwaidi',
    submissionDate: '2025-01-10',
    expectedDeliveryDate: '2025-09-30',
    approver: 'Dr. Reem Al Falasi',
    approvalStatus: 'Approved',
    approvalDate: '2025-01-28',
    approvalRemarks: 'Aligned with Grid Modernisation strategy; proceed with pilot on 50 assets.',
    status: 'In Development',
    benefitDescription:
      'Reduce unplanned outages by 35 %, cut corrective maintenance spend, and extend asset life cycle by 2+ years.',
    quantifiedBenefit: '~AED 4.8M annual saving',
    roi: 312,
    businessValueScore: 10,
    demandUrl: 'https://d2d.dewa.gov.ae/demands/D2D-2025-001',
  },
  {
    id: 'D2D-2025-002',
    title: 'Smart Meter Data Analytics Platform',
    description:
      'Build a centralised analytics platform aggregating AMI smart-meter data to provide real-time consumption dashboards, anomaly detection, and billing reconciliation for 900K+ customers.',
    type: 'AI',
    category: 'Data Analytics',
    technology: 'Power BI, Azure Synapse, Databricks',
    priority: 'High',
    complexity: 'Complex',
    department: 'Customer Affairs',
    division: 'Commercial Operations',
    raisedBy: 'Sara Al Hashimi',
    projectSponsor: 'Mariam Al Qassimi',
    submissionDate: '2025-01-22',
    expectedDeliveryDate: '2025-10-31',
    approver: 'Mohammed Al Rashidi',
    approvalStatus: 'Approved',
    approvalDate: '2025-02-10',
    status: 'In Development',
    benefitDescription:
      'Improve billing accuracy, reduce revenue leakage, and enable demand-response programmes.',
    quantifiedBenefit: '~AED 2.1M revenue protection',
    roi: 185,
    businessValueScore: 9,
    demandUrl: 'https://d2d.dewa.gov.ae/demands/D2D-2025-002',
  },
  {
    id: 'D2D-2025-003',
    title: 'Chatbot for Internal HR Queries',
    description:
      'NLP-based conversational AI integrated with SAP SuccessFactors to answer employee questions on leave balances, payslips, HR policies, and IT support—available 24/7 on Teams.',
    type: 'AI',
    category: 'NLP / Conversational AI',
    technology: 'Azure OpenAI, Bot Framework, SAP API',
    priority: 'Medium',
    complexity: 'Medium',
    department: 'Human Resources',
    division: 'Corporate Services',
    raisedBy: 'Fatima Al Dhaheri',
    projectSponsor: 'Ali Al Khoori',
    submissionDate: '2025-02-05',
    expectedDeliveryDate: '2025-07-15',
    actualDeliveryDate: '2025-07-20',
    approver: 'Dr. Reem Al Falasi',
    approvalStatus: 'Approved',
    approvalDate: '2025-02-20',
    status: 'Delivered',
    benefitDescription:
      'Deflect ~60 % of Tier-1 HR calls, reduce HR staff time on FAQs, improve employee satisfaction.',
    quantifiedBenefit: '~AED 0.8M annual HR effort saving',
    roi: 220,
    businessValueScore: 7,
    demandUrl: 'https://d2d.dewa.gov.ae/demands/D2D-2025-003',
  },
  {
    id: 'D2D-2025-004',
    title: 'Document Intelligence for Contract Management',
    description:
      'Automate extraction of key clauses, obligations, and renewal dates from PDF contracts using Azure Form Recogniser and OpenAI, feeding a searchable contract repository.',
    type: 'AI',
    category: 'Document Intelligence',
    technology: 'Azure Form Recogniser, OpenAI GPT-4o',
    priority: 'High',
    complexity: 'Medium',
    department: 'Legal & Contracts',
    division: 'Corporate Services',
    raisedBy: 'Omar Al Mazrouei',
    projectSponsor: 'Hessa Al Marri',
    submissionDate: '2025-02-18',
    expectedDeliveryDate: '2025-08-31',
    approver: 'Mohammed Al Rashidi',
    approvalStatus: 'Approved',
    approvalDate: '2025-03-05',
    status: 'In Testing',
    benefitDescription:
      'Cut contract review cycle from 5 days to <4 hours, eliminate missed renewals worth AED millions.',
    quantifiedBenefit: '~AED 1.4M risk avoidance + effort saving',
    roi: 275,
    businessValueScore: 8,
    demandUrl: 'https://d2d.dewa.gov.ae/demands/D2D-2025-004',
  },
  {
    id: 'D2D-2025-005',
    title: 'RPA for Finance Invoice Processing',
    description:
      'Robotic Process Automation bots to process supplier invoices end-to-end in Oracle ERP: validation, 3-way matching, exception flagging, and posting—targeting 5,000+ invoices/month.',
    type: 'AI',
    category: 'RPA',
    technology: 'UiPath, Oracle ERP Integration',
    priority: 'High',
    complexity: 'Medium',
    department: 'Finance & Accounts',
    division: 'Financial Services',
    raisedBy: 'Noura Al Blooshi',
    projectSponsor: 'Yousuf Al Hamad',
    submissionDate: '2025-03-01',
    expectedDeliveryDate: '2025-06-30',
    actualDeliveryDate: '2025-06-28',
    approver: 'Dr. Reem Al Falasi',
    approvalStatus: 'Approved',
    approvalDate: '2025-03-15',
    status: 'Delivered',
    benefitDescription:
      'Achieve 90 % STP rate, free up 3 FTEs for higher-value analysis, reduce late-payment penalties.',
    quantifiedBenefit: '~AED 1.1M annual FTE + penalty saving',
    roi: 195,
    businessValueScore: 8,
    demandUrl: 'https://d2d.dewa.gov.ae/demands/D2D-2025-005',
  },
  {
    id: 'D2D-2025-006',
    title: 'Vision AI for Solar Panel Inspection',
    description:
      'Use drone-mounted cameras and computer-vision models to detect hot spots, soiling, and cracked cells on DEWA solar-farm panels, replacing manual rope-access inspections.',
    type: 'AI',
    category: 'Computer Vision',
    technology: 'PyTorch, Azure Custom Vision, Drone API',
    priority: 'High',
    complexity: 'Complex',
    department: 'Renewable Energy',
    division: 'Green Energy',
    raisedBy: 'Khalid Al Shehhi',
    projectSponsor: 'Eng. Layla Al Awadhi',
    submissionDate: '2025-03-14',
    expectedDeliveryDate: '2025-12-31',
    approver: 'Mohammed Al Rashidi',
    approvalStatus: 'Approved',
    approvalDate: '2025-04-02',
    status: 'In Development',
    benefitDescription:
      'Reduce inspection cost by 70 %, improve defect-detection accuracy to >95 %, prevent yield loss.',
    quantifiedBenefit: '~AED 3.2M annual inspection & yield saving',
    roi: 290,
    businessValueScore: 9,
    demandUrl: 'https://d2d.dewa.gov.ae/demands/D2D-2025-006',
  },
  {
    id: 'D2D-2025-007',
    title: 'Digital Twin for Water Network Simulation',
    description:
      'Create a real-time digital twin of the primary water distribution network to simulate pressure zones, pipe burst risk, and demand-supply balance under multiple scenarios.',
    type: 'Non-AI',
    category: 'Digital Twin / IoT',
    technology: 'Bentley WaterGEMS, Azure IoT, Power BI',
    priority: 'Critical',
    complexity: 'Complex',
    department: 'Water Networks',
    division: 'Water Services',
    raisedBy: 'Tariq Al Naqbi',
    projectSponsor: 'Dr. Amna Al Muhairi',
    submissionDate: '2025-01-30',
    expectedDeliveryDate: '2026-03-31',
    approver: 'Dr. Reem Al Falasi',
    approvalStatus: 'Approved',
    approvalDate: '2025-02-25',
    status: 'In Development',
    benefitDescription:
      'Reduce non-revenue water losses by 2 %, prevent reactive main replacements, support CAPEX optimisation.',
    quantifiedBenefit: '~AED 5.5M NRW reduction + capex saving',
    roi: 340,
    businessValueScore: 10,
    demandUrl: 'https://d2d.dewa.gov.ae/demands/D2D-2025-007',
  },
  {
    id: 'D2D-2025-008',
    title: 'Customer Self-Service Portal Enhancement',
    description:
      'Upgrade the myDEWA portal with AI-assisted bill estimation, paperless service requests, real-time outage tracking, and personalised energy-saving recommendations.',
    type: 'AI',
    category: 'Customer Experience',
    technology: 'React, Azure Personaliser, Node.js',
    priority: 'High',
    complexity: 'Medium',
    department: 'Customer Affairs',
    division: 'Commercial Operations',
    raisedBy: 'Shaikha Al Suwaidi',
    projectSponsor: 'Mariam Al Qassimi',
    submissionDate: '2025-04-01',
    expectedDeliveryDate: '2025-11-30',
    approver: 'Mohammed Al Rashidi',
    approvalStatus: 'Conditional',
    approvalDate: '2025-04-20',
    approvalRemarks: 'Approved pending data-privacy sign-off from Legal.',
    status: 'Under Review',
    benefitDescription:
      'Increase digital transactions by 25 %, reduce call-centre volume, improve CSAT scores.',
    quantifiedBenefit: '~AED 1.6M call-centre cost reduction',
    roi: 165,
    businessValueScore: 8,
    demandUrl: 'https://d2d.dewa.gov.ae/demands/D2D-2025-008',
  },
  {
    id: 'D2D-2025-009',
    title: 'AI-Based Cybersecurity Threat Detection',
    description:
      'Deploy a SIEM-integrated ML model to detect anomalous user behaviour, lateral movement, and zero-day exploits across DEWA OT/IT networks in near-real-time.',
    type: 'AI',
    category: 'Cybersecurity / AI',
    technology: 'Microsoft Sentinel, Azure ML, Defender XDR',
    priority: 'Critical',
    complexity: 'Complex',
    department: 'Information Security',
    division: 'Digital Infrastructure',
    raisedBy: 'Saeed Al Shamsi',
    projectSponsor: 'Eng. Waleed Al Marzouqi',
    submissionDate: '2025-04-10',
    expectedDeliveryDate: '2025-12-15',
    approver: 'Dr. Reem Al Falasi',
    approvalStatus: 'Approved',
    approvalDate: '2025-04-28',
    status: 'In Development',
    benefitDescription:
      'Reduce mean-time-to-detect from 72h to <15 min, prevent cyber incidents that cost AED millions per breach.',
    quantifiedBenefit: '~AED 8M breach-risk reduction',
    roi: 520,
    businessValueScore: 10,
    demandUrl: 'https://d2d.dewa.gov.ae/demands/D2D-2025-009',
  },
  {
    id: 'D2D-2025-010',
    title: 'Automated Meter Reading with OCR',
    description:
      'Replace field-agent manual reading of legacy electromechanical meters with mobile OCR scanning and auto-upload to billing, covering ~50 K non-AMI meters.',
    type: 'AI',
    category: 'Computer Vision / OCR',
    technology: 'Azure Cognitive Services, React Native',
    priority: 'Medium',
    complexity: 'Simple',
    department: 'Metering Services',
    division: 'Commercial Operations',
    raisedBy: 'Hamdan Al Falah',
    projectSponsor: 'Mariam Al Qassimi',
    submissionDate: '2025-02-25',
    expectedDeliveryDate: '2025-06-01',
    actualDeliveryDate: '2025-05-29',
    approver: 'Mohammed Al Rashidi',
    approvalStatus: 'Approved',
    approvalDate: '2025-03-10',
    status: 'Delivered',
    benefitDescription:
      'Eliminate 2 FTEs of manual reading, cut read-to-bill cycle from 3 days to same-day, reduce estimated bills.',
    quantifiedBenefit: '~AED 0.6M annual FTE saving',
    roi: 140,
    businessValueScore: 6,
    demandUrl: 'https://d2d.dewa.gov.ae/demands/D2D-2025-010',
  },
  {
    id: 'D2D-2025-011',
    title: 'ERP Upgrade to SAP S/4HANA',
    description:
      'Full migration of legacy SAP ECC to SAP S/4HANA on Azure, covering Finance, MM, PM, and HR modules across all DEWA business units with a Fit-to-Standard approach.',
    type: 'Non-AI',
    category: 'ERP / Cloud Migration',
    technology: 'SAP S/4HANA, Azure, Rise with SAP',
    priority: 'Critical',
    complexity: 'Complex',
    department: 'IT & Digital Transformation',
    division: 'Digital Infrastructure',
    raisedBy: 'Rashid Al Kaabi',
    projectSponsor: 'HE Director General',
    submissionDate: '2024-11-01',
    expectedDeliveryDate: '2026-06-30',
    approver: 'Board Committee',
    approvalStatus: 'Approved',
    approvalDate: '2024-12-15',
    status: 'In Development',
    benefitDescription:
      'Consolidate 40+ legacy integrations, real-time financial reporting, TCO reduction post-migration.',
    quantifiedBenefit: '~AED 12M TCO saving over 5 years',
    roi: 210,
    businessValueScore: 10,
    demandUrl: 'https://d2d.dewa.gov.ae/demands/D2D-2025-011',
  },
  {
    id: 'D2D-2025-012',
    title: 'Generative AI Knowledge Management System',
    description:
      'Internal enterprise knowledge base powered by GPT-4o with RAG over DEWA procedures, technical manuals, and project lessons-learned to serve as an always-on expert assistant.',
    type: 'AI',
    category: 'Generative AI / RAG',
    technology: 'Azure OpenAI, Azure AI Search, SharePoint',
    priority: 'High',
    complexity: 'Medium',
    department: 'Knowledge Management',
    division: 'Corporate Services',
    raisedBy: 'Latifa Al Hammadi',
    projectSponsor: 'Ali Al Khoori',
    submissionDate: '2025-05-03',
    expectedDeliveryDate: '2025-10-15',
    approver: 'Dr. Reem Al Falasi',
    approvalStatus: 'Pending',
    status: 'Submitted',
    benefitDescription:
      'Reduce time engineers spend searching for information by 50 %, accelerate onboarding, preserve institutional knowledge.',
    quantifiedBenefit: '~AED 2.4M annual productivity gain',
    roi: 245,
    businessValueScore: 8,
    demandUrl: 'https://d2d.dewa.gov.ae/demands/D2D-2025-012',
  },
  {
    id: 'D2D-2025-013',
    title: 'BIM-Based Construction Progress Monitoring',
    description:
      'Overlay drone photogrammetry point clouds against BIM models to compute as-built vs. as-planned deviation, automating weekly progress reports for capital projects.',
    type: 'Non-AI',
    category: 'BIM / Digital Construction',
    technology: 'Autodesk Revit, Navisworks, DJI Terra',
    priority: 'Medium',
    complexity: 'Medium',
    department: 'Projects & Engineering',
    division: 'Capital Projects',
    raisedBy: 'Majid Al Zaabi',
    projectSponsor: 'Eng. Khalid Al Suwaidi',
    submissionDate: '2025-03-20',
    expectedDeliveryDate: '2025-09-30',
    approver: 'Mohammed Al Rashidi',
    approvalStatus: 'Approved',
    approvalDate: '2025-04-08',
    status: 'In Development',
    benefitDescription:
      'Reduce rework from ~8 % to <3 %, improve schedule adherence, cut report preparation time by 80 %.',
    quantifiedBenefit: '~AED 3.0M rework and schedule saving',
    roi: 260,
    businessValueScore: 8,
    demandUrl: 'https://d2d.dewa.gov.ae/demands/D2D-2025-013',
  },
  {
    id: 'D2D-2025-014',
    title: 'Fleet Optimisation with Telematics AI',
    description:
      'AI routing and scheduling system for DEWA field-service fleet (1,200+ vehicles) using telematics data to minimise travel time, fuel consumption, and idle hours.',
    type: 'AI',
    category: 'Optimisation / AI',
    technology: 'Python, OR-Tools, Azure Maps, GPS API',
    priority: 'Medium',
    complexity: 'Medium',
    department: 'Fleet Management',
    division: 'Operations & Maintenance',
    raisedBy: 'Abdullah Al Farsi',
    projectSponsor: 'Hessa Al Marri',
    submissionDate: '2025-04-22',
    expectedDeliveryDate: '2025-11-30',
    approver: 'Dr. Reem Al Falasi',
    approvalStatus: 'Approved',
    approvalDate: '2025-05-10',
    status: 'Under Review',
    benefitDescription:
      'Reduce fuel spend by 18 %, lower CO₂ emissions, extend vehicle life, improve SLA compliance for field jobs.',
    quantifiedBenefit: '~AED 1.8M annual fuel & maintenance saving',
    roi: 175,
    businessValueScore: 7,
    demandUrl: 'https://d2d.dewa.gov.ae/demands/D2D-2025-014',
  },
  {
    id: 'D2D-2025-015',
    title: 'Automated Regulatory Reporting (GCAA / DEWA Board)',
    description:
      'Auto-generate structured regulatory reports (GCAA safety metrics, Board KPI packs) from live ERP and SCADA data, eliminating 4 weeks of manual Excel consolidation per quarter.',
    type: 'Non-AI',
    category: 'Process Automation / Reporting',
    technology: 'Power Automate, Power BI, SharePoint',
    priority: 'High',
    complexity: 'Simple',
    department: 'Regulatory Affairs',
    division: 'Corporate Services',
    raisedBy: 'Maryam Al Obaidli',
    projectSponsor: 'Yousuf Al Hamad',
    submissionDate: '2025-02-10',
    expectedDeliveryDate: '2025-05-31',
    actualDeliveryDate: '2025-06-05',
    approver: 'Mohammed Al Rashidi',
    approvalStatus: 'Approved',
    approvalDate: '2025-02-28',
    status: 'Delivered',
    benefitDescription:
      'Save 1.5 FTE-weeks per quarter on report production, improve data accuracy, and ensure submission deadlines.',
    quantifiedBenefit: '~AED 0.4M annual effort saving',
    roi: 125,
    businessValueScore: 6,
    demandUrl: 'https://d2d.dewa.gov.ae/demands/D2D-2025-015',
  },
  {
    id: 'D2D-2025-016',
    title: 'AI Demand Forecasting for Water Production',
    description:
      'Build an ML forecasting model integrating weather, population growth, tourism, and Ramadan patterns to predict daily water demand with 48-hour horizon, optimising desalination schedules.',
    type: 'AI',
    category: 'Forecasting / ML',
    technology: 'Python, Azure ML, ARIMA, Prophet',
    priority: 'High',
    complexity: 'Complex',
    department: 'Water Production',
    division: 'Water Services',
    raisedBy: 'Hussain Al Matrooshi',
    projectSponsor: 'Dr. Amna Al Muhairi',
    submissionDate: '2025-05-15',
    expectedDeliveryDate: '2026-01-31',
    approver: 'Dr. Reem Al Falasi',
    approvalStatus: 'Pending',
    status: 'Submitted',
    benefitDescription:
      'Reduce over-production by 8 %, lower energy cost of desalination, prevent under-supply events.',
    quantifiedBenefit: '~AED 6.5M energy and production saving',
    roi: 380,
    businessValueScore: 9,
    demandUrl: 'https://d2d.dewa.gov.ae/demands/D2D-2025-016',
  },
  {
    id: 'D2D-2025-017',
    title: 'Supply Chain Supplier Risk Intelligence',
    description:
      'AI-driven supplier risk scoring using external news feeds, financial data, ESG ratings, and delivery history to flag at-risk suppliers before contract renewal or critical orders.',
    type: 'AI',
    category: 'Supply Chain AI',
    technology: 'Azure OpenAI, Power BI, Dun & Bradstreet API',
    priority: 'Medium',
    complexity: 'Medium',
    department: 'Supply Chain',
    division: 'Financial Services',
    raisedBy: 'Rashed Al Mulla',
    projectSponsor: 'Yousuf Al Hamad',
    submissionDate: '2025-05-28',
    expectedDeliveryDate: '2025-12-31',
    approver: 'Mohammed Al Rashidi',
    approvalStatus: 'Rejected',
    approvalDate: '2025-06-15',
    approvalRemarks: 'Budget not available in FY2025; resubmit in Q1 2026 budget cycle.',
    status: 'Rejected',
    benefitDescription:
      'Reduce supply-chain disruptions, avoid emergency procurement premiums, improve ESG score.',
    quantifiedBenefit: '~AED 1.0M disruption cost avoidance',
    roi: 150,
    businessValueScore: 6,
    demandUrl: 'https://d2d.dewa.gov.ae/demands/D2D-2025-017',
  },
  {
    id: 'D2D-2025-018',
    title: 'Smart Building Energy Management (DEWA HQ)',
    description:
      'IoT sensor + ML system to optimise HVAC, lighting, and lift scheduling in DEWA HQ towers based on occupancy, ambient conditions, and time-of-use tariffs.',
    type: 'AI',
    category: 'Smart Building / IoT',
    technology: 'Siemens Desigo CC, Azure IoT, ML Studio',
    priority: 'Medium',
    complexity: 'Medium',
    department: 'Facilities Management',
    division: 'Corporate Services',
    raisedBy: 'Amira Al Rashidi',
    projectSponsor: 'Ali Al Khoori',
    submissionDate: '2025-04-05',
    expectedDeliveryDate: '2025-10-31',
    approver: 'Dr. Reem Al Falasi',
    approvalStatus: 'Approved',
    approvalDate: '2025-04-25',
    status: 'In Testing',
    benefitDescription:
      'Achieve 22 % reduction in HQ building energy consumption, advance DEWA green-building certifications.',
    quantifiedBenefit: '~AED 0.9M annual energy saving',
    roi: 180,
    businessValueScore: 7,
    demandUrl: 'https://d2d.dewa.gov.ae/demands/D2D-2025-018',
  },
  {
    id: 'D2D-2025-019',
    title: 'Workforce Planning & Succession AI',
    description:
      'ML model analysing skills inventory, retirement projections, and role criticality to generate workforce gap analysis and succession recommendations for C-suite planning.',
    type: 'AI',
    category: 'HR Analytics / AI',
    technology: 'Python, Power BI, SAP SuccessFactors API',
    priority: 'Medium',
    complexity: 'Medium',
    department: 'Human Resources',
    division: 'Corporate Services',
    raisedBy: 'Fatima Al Dhaheri',
    projectSponsor: 'Ali Al Khoori',
    submissionDate: '2025-06-01',
    expectedDeliveryDate: '2025-12-31',
    approver: 'Dr. Reem Al Falasi',
    approvalStatus: 'Pending',
    status: 'Submitted',
    benefitDescription:
      'Proactively address critical-role vacancies, reduce time-to-fill, retain institutional knowledge.',
    quantifiedBenefit: '~AED 1.5M recruitment & productivity saving',
    roi: 195,
    businessValueScore: 7,
    demandUrl: 'https://d2d.dewa.gov.ae/demands/D2D-2025-019',
  },
  {
    id: 'D2D-2025-020',
    title: 'Hyperconverged Infrastructure Refresh',
    description:
      'Replace end-of-life VMware on Cisco UCS with HPE SimpliVity hyperconverged infrastructure to modernise the secondary data centre and enable faster DR failover (<15 min RTO).',
    type: 'Non-AI',
    category: 'Infrastructure / Cloud',
    technology: 'HPE SimpliVity, VMware vSphere 8',
    priority: 'High',
    complexity: 'Complex',
    department: 'IT & Digital Transformation',
    division: 'Digital Infrastructure',
    raisedBy: 'Rashid Al Kaabi',
    projectSponsor: 'Eng. Waleed Al Marzouqi',
    submissionDate: '2025-03-08',
    expectedDeliveryDate: '2025-11-30',
    approver: 'Mohammed Al Rashidi',
    approvalStatus: 'Approved',
    approvalDate: '2025-03-28',
    status: 'On Hold',
    approvalRemarks: 'On hold pending vendor selection outcome expected Q3 2025.',
    benefitDescription:
      'Improve uptime SLA to 99.99 %, reduce DR test time, lower data-centre power by 30 %.',
    quantifiedBenefit: '~AED 2.2M TCO + downtime risk saving',
    roi: 155,
    businessValueScore: 8,
    demandUrl: 'https://d2d.dewa.gov.ae/demands/D2D-2025-020',
  },
]

// ── Derived helpers ───────────────────────────────────────────

export const DEPARTMENTS = Array.from(new Set(DEMANDS.map(d => d.department))).sort()
export const DIVISIONS   = Array.from(new Set(DEMANDS.map(d => d.division))).sort()
export const CATEGORIES  = Array.from(new Set(DEMANDS.map(d => d.category))).sort()
