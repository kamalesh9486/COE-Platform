const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, PageBreak, Header, Footer
} = require('docx');
const fs = require('fs');

// ── Colors ──────────────────────────────────────────────────────
const NAVY    = '1B3A5C';
const GOLD    = 'B8860B';
const GOLD_LT = 'FDF6E4';
const TEAL    = '1A6B5E';
const TEAL_LT = 'EAF4F2';
const SLATE   = '2D4A6B';
const RED_LT  = 'FBF0EE';
const RED_DK  = 'C0442D';
const GRN_LT  = 'EDF6F1';
const GRN_DK  = '2E7D4F';
const AMB_LT  = 'FEF6E4';
const AMB_DK  = 'B06010';
const PUR_LT  = 'F0EEF9';
const PUR_DK  = '5C4A9E';
const BLU_LT  = 'E6F1FB';
const BLU_DK  = '185FA5';
const MID     = 'CCCCCC';
const LT_GRY  = 'F5F5F5';
const DK_GRY  = '444444';
const WHITE   = 'FFFFFF';

// ── Border helpers ───────────────────────────────────────────────
const b  = (c=MID,s=1) => ({ style: BorderStyle.SINGLE, size: s, color: c });
const nb = ()           => ({ style: BorderStyle.NIL,    size: 0, color: WHITE });
const allB  = (c) => ({ top:b(c), bottom:b(c), left:b(c), right:b(c) });
const noB   = ()  => ({ top:nb(), bottom:nb(), left:nb(), right:nb() });
const btmB  = (c,s=6) => ({ top:nb(), bottom:b(c,s), left:nb(), right:nb() });

// ── Spacing helper ───────────────────────────────────────────────
const sp = (bf=0,af=0) => ({ spacing:{ before:bf, after:af } });

// ── Paragraph helpers ────────────────────────────────────────────
const gap = (n=120) => new Paragraph({ children:[new TextRun('')], spacing:{before:n,after:0} });

const hr = (color=GOLD) => new Paragraph({
  children:[new TextRun('')],
  border:{ bottom:{ style:BorderStyle.SINGLE, size:10, color, space:1 } },
  spacing:{ before:60, after:60 }
});

const secLabel = (text, color=GOLD) => new Paragraph({
  children:[new TextRun({ text:text.toUpperCase(), font:'Arial', size:18, bold:true, color, characterSpacing:80 })],
  spacing:{ before:320, after:80 }
});

const h1 = (text) => new Paragraph({
  children:[new TextRun({ text, font:'Arial', size:48, bold:true, color:NAVY })],
  spacing:{ before:0, after:140 }
});

const h2 = (text,color=NAVY) => new Paragraph({
  children:[new TextRun({ text, font:'Arial', size:28, bold:true, color })],
  spacing:{ before:240, after:100 }
});

const h3 = (text,color=DK_GRY) => new Paragraph({
  children:[new TextRun({ text, font:'Arial', size:22, bold:true, color })],
  spacing:{ before:180, after:60 }
});

const body = (text,opts={}) => new Paragraph({
  children:[new TextRun({ text, font:'Arial', size:20, color:DK_GRY, ...opts })],
  spacing:{ before:50, after:50 },
  alignment: AlignmentType.JUSTIFIED
});

const bullet = (text, ref='blt') => new Paragraph({
  numbering:{ reference:ref, level:0 },
  children:[new TextRun({ text, font:'Arial', size:20, color:DK_GRY })],
  spacing:{ before:40, after:40 }
});

const tick = (text, color=GRN_DK) => new Paragraph({
  children:[
    new TextRun({ text:'✓   ', font:'Arial', size:20, bold:true, color }),
    new TextRun({ text, font:'Arial', size:20, color:DK_GRY })
  ],
  spacing:{ before:50, after:50 },
  indent:{ left:200 }
});

const cross = (text) => new Paragraph({
  children:[
    new TextRun({ text:'✗   ', font:'Arial', size:20, bold:true, color:RED_DK }),
    new TextRun({ text, font:'Arial', size:20, color:DK_GRY })
  ],
  spacing:{ before:50, after:50 },
  indent:{ left:200 }
});

// ── Cell helper ──────────────────────────────────────────────────
const cell = (children, w, opts={}) => new TableCell({
  borders: opts.borders || noB(),
  width:{ size:w, type:WidthType.DXA },
  shading:{ fill: opts.fill||WHITE, type:ShadingType.CLEAR },
  margins:{ top:opts.mt||100, bottom:opts.mb||100, left:opts.ml||160, right:opts.mr||160 },
  verticalAlign: opts.va || undefined,
  columnSpan: opts.span || undefined,
  children
});

const hdrCell = (text, w, fill=NAVY, color=WHITE) => new TableCell({
  borders: noB(),
  width:{ size:w, type:WidthType.DXA },
  shading:{ fill, type:ShadingType.CLEAR },
  margins:{ top:120, bottom:120, left:160, right:160 },
  children:[new Paragraph({ children:[new TextRun({ text, font:'Arial', size:18, bold:true, color })], alignment:AlignmentType.CENTER })]
});

// ── Cover page ───────────────────────────────────────────────────
function coverPage() {
  return [
    gap(600),
    new Paragraph({
      children:[new TextRun({ text:'AI AGENT INTEGRATION', font:'Arial', size:76, bold:true, color:NAVY, characterSpacing:60 })],
      alignment:AlignmentType.CENTER
    }),
    new Paragraph({
      children:[new TextRun({ text:'PROJECT PLAN & PROPOSAL', font:'Arial', size:40, bold:false, color:GOLD, characterSpacing:80 })],
      alignment:AlignmentType.CENTER,
      spacing:{ before:80, after:60 }
    }),
    new Paragraph({
      children:[new TextRun({ text:'────────────────────────────────────────', font:'Arial', size:24, color:GOLD })],
      alignment:AlignmentType.CENTER,
      spacing:{ before:60, after:60 }
    }),
    new Paragraph({
      children:[new TextRun({ text:'GoIndiaNepal Travel Platform', font:'Arial', size:28, color:DK_GRY, italics:true })],
      alignment:AlignmentType.CENTER,
      spacing:{ before:40, after:400 }
    }),
    gap(200),

    // Info table
    new Table({
      width:{ size:7200, type:WidthType.DXA },
      columnWidths:[3600,3600],
      rows:[
        new TableRow({ children:[
          cell([new Paragraph({ children:[new TextRun({ text:'Prepared for', font:'Arial', size:18, bold:true, color:GOLD })], spacing:{before:0,after:40} }),
                new Paragraph({ children:[new TextRun({ text:'GoIndiaNepal', font:'Arial', size:24, bold:true, color:NAVY })], spacing:{before:0,after:0} })],
               3600,{ fill:GOLD_LT, borders:allB('E8D5A0'), ml:200, mr:200, mt:160, mb:160 }),
          cell([new Paragraph({ children:[new TextRun({ text:'Project Type', font:'Arial', size:18, bold:true, color:GOLD })], spacing:{before:0,after:40} }),
                new Paragraph({ children:[new TextRun({ text:'AI Agent Development', font:'Arial', size:24, bold:true, color:NAVY })], spacing:{before:0,after:0} })],
               3600,{ fill:GOLD_LT, borders:allB('E8D5A0'), ml:200, mr:200, mt:160, mb:160 })
        ]}),
        new TableRow({ children:[
          cell([new Paragraph({ children:[new TextRun({ text:'Prepared by', font:'Arial', size:18, bold:true, color:GOLD })], spacing:{before:0,after:40} }),
                new Paragraph({ children:[new TextRun({ text:'Development Team', font:'Arial', size:24, bold:true, color:NAVY })], spacing:{before:0,after:0} })],
               3600,{ fill:GOLD_LT, borders:allB('E8D5A0'), ml:200, mr:200, mt:160, mb:160 }),
          cell([new Paragraph({ children:[new TextRun({ text:'Date', font:'Arial', size:18, bold:true, color:GOLD })], spacing:{before:0,after:40} }),
                new Paragraph({ children:[new TextRun({ text:'May 2026', font:'Arial', size:24, bold:true, color:NAVY })], spacing:{before:0,after:0} })],
               3600,{ fill:GOLD_LT, borders:allB('E8D5A0'), ml:200, mr:200, mt:160, mb:160 })
        ]}),
        new TableRow({ children:[
          cell([new Paragraph({ children:[new TextRun({ text:'Total Timeline', font:'Arial', size:18, bold:true, color:GOLD })], spacing:{before:0,after:40} }),
                new Paragraph({ children:[new TextRun({ text:'46 Working Days  (2 hrs/day)', font:'Arial', size:24, bold:true, color:NAVY })], spacing:{before:0,after:0} })],
               3600,{ fill:GOLD_LT, borders:allB('E8D5A0'), ml:200, mr:200, mt:160, mb:160 }),
          cell([new Paragraph({ children:[new TextRun({ text:'Agents to Build', font:'Arial', size:18, bold:true, color:GOLD })], spacing:{before:0,after:40} }),
                new Paragraph({ children:[new TextRun({ text:'5 AI-Powered Agents', font:'Arial', size:24, bold:true, color:NAVY })], spacing:{before:0,after:0} })],
               3600,{ fill:GOLD_LT, borders:allB('E8D5A0'), ml:200, mr:200, mt:160, mb:160 })
        ]})
      ]
    }),
    gap(400),
    new Paragraph({
      children:[new TextRun({ text:'Confidential — Prepared exclusively for GoIndiaNepal', font:'Arial', size:18, color:GOLD, italics:true })],
      alignment:AlignmentType.CENTER
    }),
    new Paragraph({ children:[new PageBreak()] })
  ];
}

// ── Executive Summary ─────────────────────────────────────────────
function executiveSummary() {
  return [
    secLabel('Section 1'),
    h1('Executive Summary'),
    body('This document outlines the complete plan to integrate five AI-powered agents into the existing GoIndiaNepal travel platform. The agents will automate key business functions — from trip planning and content publishing to customer feedback management and advertising — allowing the GoIndiaNepal team to serve more customers, respond faster, and operate more efficiently without adding headcount.'),
    gap(80),
    body('The integration builds on top of the existing website and systems. We will not rebuild what already exists. Instead, we connect AI intelligence to the tools and platforms GoIndiaNepal already uses, adding new capabilities without disrupting current operations.'),
    gap(120),

    // Stats row
    new Table({
      width:{ size:9360, type:WidthType.DXA },
      columnWidths:[2340,2340,2340,2340],
      rows:[new TableRow({ children:[
        ...[ ['5','AI Agents'], ['46','Working Days'], ['2hrs','Per Day'], ['0','Existing Rebuilds'] ]
          .map(([v,l]) => cell([
            new Paragraph({ children:[new TextRun({ text:v, font:'Arial', size:52, bold:true, color:GOLD })], alignment:AlignmentType.CENTER }),
            new Paragraph({ children:[new TextRun({ text:l, font:'Arial', size:18, color:WHITE })], alignment:AlignmentType.CENTER })
          ], 2340, { fill:NAVY, mt:180, mb:180 }))
      ]})]
    }),
    gap(120),
    h3('What this project is NOT'),
    cross('A full website rebuild or redesign'),
    cross('A replacement of any existing system or database'),
    cross('A standalone app built from scratch'),
    gap(60),
    h3('What this project IS'),
    tick('New AI agent modules plugged into the existing GoIndiaNepal platform'),
    tick('Intelligent automation that works alongside the current team'),
    tick('Connected to existing tools: CMS, social media, Google Ads, database'),
    tick('Built to run 2 hours per day — practical, sustainable, deliverable'),
    new Paragraph({ children:[new PageBreak()] })
  ];
}

// ── Existing System Access ─────────────────────────────────────────
function existingSystemAccess() {
  return [
    secLabel('Section 2'),
    h1('Existing System Access Required'),
    body('Because we are building on top of the existing GoIndiaNepal platform rather than starting from scratch, the development team requires full access to the following systems before work can begin. Delays in providing access will delay the timeline proportionally.'),
    gap(100),

    h2('2.1  Frontend Codebase Access'),
    new Table({
      width:{ size:9360, type:WidthType.DXA },
      columnWidths:[3120,3120,3120],
      rows:[
        new TableRow({ children:[
          hdrCell('What We Need', 3120, NAVY),
          hdrCell('Why We Need It', 3120, NAVY),
          hdrCell('How to Share', 3120, NAVY)
        ]}),
        ...([
          ['GitHub / GitLab repository access (read + write)', 'To add agent UI components into the existing frontend without breaking current pages', 'Add developer as collaborator on the repo'],
          ['Frontend framework and version', 'Agent components must match the existing stack (React, Next.js, Vue, etc.) exactly', 'Share package.json file or confirm framework'],
          ['Design system or UI library in use', 'All new agent interfaces must match the existing visual style', 'Share Figma files or CSS/Tailwind config'],
          ['Environment variables (.env file structure)', 'New API keys must follow existing patterns and be added correctly', 'Share .env.example with all current variable names'],
          ['Current routing structure', 'Agent pages must fit within the existing URL structure without conflicts', 'Share sitemap or routing file'],
        ]).map(([w,y,h],i) => new TableRow({ children:[
          cell([new Paragraph({ children:[new TextRun({ text:w, font:'Arial', size:19, bold:true, color:NAVY })] })], 3120, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 }),
          cell([new Paragraph({ children:[new TextRun({ text:y, font:'Arial', size:18, color:DK_GRY })] })], 3120, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 }),
          cell([new Paragraph({ children:[new TextRun({ text:h, font:'Arial', size:18, color:TEAL })] })], 3120, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 })
        ]}))
      ]
    }),

    gap(120),
    h2('2.2  Backend / Server Access'),
    new Table({
      width:{ size:9360, type:WidthType.DXA },
      columnWidths:[3120,3120,3120],
      rows:[
        new TableRow({ children:[
          hdrCell('What We Need', 3120, SLATE),
          hdrCell('Why We Need It', 3120, SLATE),
          hdrCell('How to Share', 3120, SLATE)
        ]}),
        ...([
          ['Server hosting credentials (Vercel / Railway / Render / cPanel)', 'To deploy new agent API routes alongside the existing backend', 'Share login credentials or add developer to the hosting dashboard'],
          ['Existing API routes or backend codebase', 'Agents must connect to the same data layer the current site uses', 'Share via GitHub or zip of the /api or /server directory'],
          ['Database connection string or ORM config', 'Agent 1 (Trip Planner) and Agent 5 (Feedback Reply) write to the database', 'Share as environment variable — never plain text in chat'],
          ['Any existing middleware or auth system', 'Admin agent tools must sit behind the same authentication the current admin uses', 'Share auth library/config files (NextAuth, Clerk, custom JWT)'],
          ['Existing CMS credentials (WordPress / Sanity / Contentful)', 'Agent 2 (Blog Publisher) publishes directly to the current CMS', 'Share CMS admin login or generate an API write token'],
        ]).map(([w,y,h],i) => new TableRow({ children:[
          cell([new Paragraph({ children:[new TextRun({ text:w, font:'Arial', size:19, bold:true, color:NAVY })] })], 3120, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 }),
          cell([new Paragraph({ children:[new TextRun({ text:y, font:'Arial', size:18, color:DK_GRY })] })], 3120, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 }),
          cell([new Paragraph({ children:[new TextRun({ text:h, font:'Arial', size:18, color:TEAL })] })], 3120, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 })
        ]}))
      ]
    }),

    gap(120),
    h2('2.3  Third-Party Platform Access'),
    new Table({
      width:{ size:9360, type:WidthType.DXA },
      columnWidths:[2800,3360,3200],
      rows:[
        new TableRow({ children:[
          hdrCell('Platform', 2800, TEAL),
          hdrCell('Access Required', 3360, TEAL),
          hdrCell('Used by Agent', 3200, TEAL)
        ]}),
        ...([
          ['Anthropic Console','API key from console.anthropic.com','All 5 agents — the core AI brain'],
          ['Meta Business Suite','Facebook Page access token + Instagram Business account connected to a Page','Agent 2 (Blog Publisher)'],
          ['Google Ads','Google Ads account access + Google Cloud OAuth2 credentials + Developer token (apply in Week 1)','Agent 3 (Google Ads)'],
          ['Google Analytics (optional)','Read access to GA4 to inform ad targeting','Agent 3 (Google Ads)'],
          ['Amadeus for Developers','Free sandbox account at developers.amadeus.com','Agent 4 (Trip Comparison)'],
          ['Supabase (or existing DB)','Create tables in existing database OR create new free Supabase project','Agents 1 and 5'],
          ['Resend (email API)','Free account at resend.com — for sending approved feedback replies','Agent 5 (Feedback Reply)'],
        ]).map(([p,a,u],i) => new TableRow({ children:[
          cell([new Paragraph({ children:[new TextRun({ text:p, font:'Arial', size:19, bold:true, color:NAVY })] })], 2800, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 }),
          cell([new Paragraph({ children:[new TextRun({ text:a, font:'Arial', size:18, color:DK_GRY })] })], 3360, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 }),
          cell([new Paragraph({ children:[new TextRun({ text:u, font:'Arial', size:18, color:TEAL })] })], 3200, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 })
        ]}))
      ]
    }),
    new Paragraph({ children:[new PageBreak()] })
  ];
}

// ── Prerequisites ──────────────────────────────────────────────────
function prerequisites() {
  return [
    secLabel('Section 3'),
    h1('Prerequisites & Requirements'),
    gap(60),

    h2('3.1  Software & Tools (Developer Machine)'),
    new Table({
      width:{ size:9360, type:WidthType.DXA },
      columnWidths:[2800,2600,3960],
      rows:[
        new TableRow({ children:[
          hdrCell('Tool', 2800, NAVY),
          hdrCell('Minimum Version', 2600, NAVY),
          hdrCell('Purpose', 3960, NAVY)
        ]}),
        ...([
          ['Node.js',       '18.0+',   'Runtime for all server-side agent code'],
          ['npm or yarn',   '9.0+',    'Package management'],
          ['Git',           'Latest',  'Version control — clone and push to shared repo'],
          ['VS Code',       'Latest',  'Recommended IDE — with ESLint and Prettier extensions'],
          ['Postman',       'Latest',  'Testing API routes during development'],
          ['Claude Code',   'Latest',  'AI-assisted coding — speeds up development significantly'],
        ]).map(([t,v,p],i) => new TableRow({ children:[
          cell([new Paragraph({ children:[new TextRun({ text:t, font:'Arial', size:20, bold:true, color:NAVY })] })], 2800, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 }),
          cell([new Paragraph({ children:[new TextRun({ text:v, font:'Arial', size:19, color:TEAL, bold:true })] })], 2600, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 }),
          cell([new Paragraph({ children:[new TextRun({ text:p, font:'Arial', size:19, color:DK_GRY })] })], 3960, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 })
        ]}))
      ]
    }),

    gap(120),
    h2('3.2  Environment Variables to Configure'),
    body('All API keys must be stored as environment variables — never hardcoded into source files. The following variables must be set before development begins on each agent:'),
    gap(80),

    new Table({
      width:{ size:9360, type:WidthType.DXA },
      columnWidths:[3600,2200,3560],
      rows:[
        new TableRow({ children:[
          hdrCell('Variable Name', 3600, SLATE),
          hdrCell('Used by Agent', 2200, SLATE),
          hdrCell('Where to Get It', 3560, SLATE)
        ]}),
        ...([
          ['ANTHROPIC_API_KEY',        'All 5',   'console.anthropic.com → API Keys'],
          ['SUPABASE_URL',             '1 & 5',   'Supabase project → Settings → API'],
          ['SUPABASE_ANON_KEY',        '1 & 5',   'Supabase project → Settings → API'],
          ['WORDPRESS_URL',            '2',       'Your WordPress site URL'],
          ['WORDPRESS_APP_PASSWORD',   '2',       'WP Admin → Users → Application Passwords'],
          ['META_PAGE_ACCESS_TOKEN',   '2',       'Meta Business Suite → Settings → Page Access Tokens'],
          ['META_INSTAGRAM_ID',        '2',       'Meta Business Suite → Instagram Account ID'],
          ['GOOGLE_ADS_CLIENT_ID',     '3',       'Google Cloud Console → OAuth2 Credentials'],
          ['GOOGLE_ADS_CLIENT_SECRET', '3',       'Google Cloud Console → OAuth2 Credentials'],
          ['GOOGLE_ADS_REFRESH_TOKEN', '3',       'Generated after OAuth2 authentication flow'],
          ['GOOGLE_ADS_DEVELOPER_TOKEN','3',      'Google Ads API Center → apply at developers.google.com/google-ads/api'],
          ['GOOGLE_ADS_CUSTOMER_ID',   '3',       'Google Ads account → Account ID (without hyphens)'],
          ['AMADEUS_CLIENT_ID',        '4',       'developers.amadeus.com → My Apps'],
          ['AMADEUS_CLIENT_SECRET',    '4',       'developers.amadeus.com → My Apps'],
          ['RESEND_API_KEY',           '5',       'resend.com → API Keys'],
          ['FROM_EMAIL',               '5',       'Verified sender email in Resend dashboard'],
        ]).map(([k,a,w],i) => new TableRow({ children:[
          cell([new Paragraph({ children:[new TextRun({ text:k, font:'Courier New', size:18, color:PUR_DK })] })], 3600, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:90, mb:90 }),
          cell([new Paragraph({ children:[new TextRun({ text:'Agent '+a, font:'Arial', size:18, bold:true, color:TEAL })] })], 2200, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:90, mb:90 }),
          cell([new Paragraph({ children:[new TextRun({ text:w, font:'Arial', size:17, color:DK_GRY })] })], 3560, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:90, mb:90 })
        ]}))
      ]
    }),
    new Paragraph({ children:[new PageBreak()] })
  ];
}

// ── Technology Stack ───────────────────────────────────────────────
function techStack() {
  return [
    secLabel('Section 4'),
    h1('Technology Stack'),
    body('The following technologies will be used to build all five AI agents. Each choice is deliberate — selected for compatibility with the existing GoIndiaNepal system, developer productivity, and long-term maintainability.'),
    gap(100),

    h2('4.1  Core Technologies'),
    new Table({
      width:{ size:9360, type:WidthType.DXA },
      columnWidths:[2200,2000,5160],
      rows:[
        new TableRow({ children:[
          hdrCell('Technology', 2200, NAVY),
          hdrCell('Version', 2000, NAVY),
          hdrCell('Role in the Project', 5160, NAVY)
        ]}),
        ...([
          ['Anthropic Claude API', 'claude-sonnet-4-20250514', 'The AI brain for all 5 agents. Handles reasoning, content generation, decision-making, and tool use (the ability to call external services).'],
          ['Next.js', '14 (App Router)', 'The web framework. All agent API routes and UI pages are built as Next.js modules that plug directly into the existing site.'],
          ['TypeScript', '5.x', 'Typed JavaScript — catches errors early and makes the codebase easier to maintain long-term.'],
          ['Tailwind CSS', '3.x', 'Styling — agent UI components will match the existing website design system.'],
          ['Node.js', '18+', 'Server runtime. Required to run the backend agent logic.'],
          ['Supabase', 'Latest', 'Database for Agents 1 and 5. Free tier. PostgreSQL under the hood — stores itineraries and feedback logs.'],
          ['Resend', 'Latest', 'Email API for Agent 5. Sends approved feedback replies to customers. Free tier covers 3,000 emails/month.'],
        ]).map(([t,v,r],i) => new TableRow({ children:[
          cell([new Paragraph({ children:[new TextRun({ text:t, font:'Arial', size:19, bold:true, color:NAVY })] })], 2200, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 }),
          cell([new Paragraph({ children:[new TextRun({ text:v, font:'Courier New', size:17, color:TEAL })] })], 2000, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 }),
          cell([new Paragraph({ children:[new TextRun({ text:r, font:'Arial', size:18, color:DK_GRY })] })], 5160, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 })
        ]}))
      ]
    }),

    gap(120),
    h2('4.2  Per-Agent External Technology'),
    new Table({
      width:{ size:9360, type:WidthType.DXA },
      columnWidths:[2000,3160,4200],
      rows:[
        new TableRow({ children:[
          hdrCell('Agent', 2000, TEAL),
          hdrCell('External Service / Package', 3160, TEAL),
          hdrCell('What it does', 4200, TEAL)
        ]}),
        ...([
          ['Agent 1  Trip Planner',    '@supabase/supabase-js',                              'Reads and writes itinerary data to the Supabase database'],
          ['Agent 2  Blog Publisher',  'WordPress REST API + Meta Graph API',                 'Publishes blog posts to the website and shares them on Facebook and Instagram'],
          ['Agent 3  Google Ads',      'google-ads-api + googleapis + Google OAuth2',         'Creates and launches advertising campaigns on Google Ads'],
          ['Agent 4  Trip Comparison', 'amadeus (npm package) + Amadeus Travel API',          'Searches real-time flight and hotel data to compare travel options'],
          ['Agent 5  Feedback Reply',  '@supabase/supabase-js + resend',                     'Logs feedback with generated replies and sends approved responses by email'],
        ]).map(([a,p,w],i) => new TableRow({ children:[
          cell([new Paragraph({ children:[new TextRun({ text:a, font:'Arial', size:18, bold:true, color:NAVY })] })], 2000, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 }),
          cell([new Paragraph({ children:[new TextRun({ text:p, font:'Courier New', size:16, color:PUR_DK })] })], 3160, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 }),
          cell([new Paragraph({ children:[new TextRun({ text:w, font:'Arial', size:18, color:DK_GRY })] })], 4200, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 })
        ]}))
      ]
    }),
    new Paragraph({ children:[new PageBreak()] })
  ];
}

// ── Agent Descriptions ─────────────────────────────────────────────
function agentDescriptions() {
  const mkAgent = (num,name,fill,accent,purpose,howItWorks,example,tools) => [
    new Table({
      width:{ size:9360, type:WidthType.DXA },
      columnWidths:[9360],
      rows:[new TableRow({ children:[
        cell([new Paragraph({ children:[
          new TextRun({ text:`AGENT ${num}   `, font:'Arial', size:18, bold:true, color:WHITE }),
          new TextRun({ text:`${name}`, font:'Arial', size:26, bold:true, color:WHITE })
        ] })], 9360, { fill:accent, mt:160, mb:160 })
      ]})]
    }),
    new Table({
      width:{ size:9360, type:WidthType.DXA },
      columnWidths:[4680,4680],
      rows:[new TableRow({ children:[
        cell([
          new Paragraph({ children:[new TextRun({ text:'PURPOSE', font:'Arial', size:16, bold:true, color:accent, characterSpacing:60 })], spacing:{before:0,after:80} }),
          new Paragraph({ children:[new TextRun({ text:purpose, font:'Arial', size:19, color:DK_GRY })], spacing:{before:0,after:120}, alignment:AlignmentType.JUSTIFIED }),
          new Paragraph({ children:[new TextRun({ text:'HOW IT WORKS', font:'Arial', size:16, bold:true, color:accent, characterSpacing:60 })], spacing:{before:0,after:80} }),
          ...howItWorks.map((s,i) => new Paragraph({
            children:[
              new TextRun({ text:`${i+1}.  `, font:'Arial', size:18, bold:true, color:accent }),
              new TextRun({ text:s, font:'Arial', size:18, color:DK_GRY })
            ], spacing:{before:40,after:40}
          })),
          new Paragraph({ children:[new TextRun({ text:'TOOLS DEFINED FOR CLAUDE', font:'Arial', size:16, bold:true, color:accent, characterSpacing:60 })], spacing:{before:120,after:80} }),
          ...tools.map(t => new Paragraph({
            children:[
              new TextRun({ text:'▸  ', font:'Arial', size:18, bold:true, color:accent }),
              new TextRun({ text:t, font:'Courier New', size:17, color:PUR_DK })
            ], spacing:{before:30,after:30}
          }))
        ], 4680, { fill:fill, mt:160, mb:160, ml:200, mr:200 }),
        cell([
          new Paragraph({ children:[new TextRun({ text:'SIMPLE EXAMPLE', font:'Arial', size:16, bold:true, color:accent, characterSpacing:60 })], spacing:{before:0,after:80} }),
          ...example.map(([who,what]) => [
            new Paragraph({ children:[new TextRun({ text:who, font:'Arial', size:16, bold:true, color: who==='AI'||who==='System' ? TEAL : NAVY })], spacing:{before:80,after:20} }),
            new Paragraph({ children:[new TextRun({ text:what, font:'Arial', size:18, color:DK_GRY, italics: who==='AI'||who==='System' })], spacing:{before:0,after:60}, indent:{left:120} }),
          ]).flat()
        ], 4680, { fill:WHITE, mt:160, mb:160, ml:200, mr:200, borders:{ top:noB().top, bottom:noB().bottom, left:{ style:BorderStyle.SINGLE, size:4, color:accent }, right:noB().right } })
      ]})]
    }),
    gap(120)
  ];

  return [
    secLabel('Section 5'),
    h1('The 5 AI Agents'),
    body('Each agent below is a distinct module that plugs into the GoIndiaNepal platform. They share the same AI engine (Claude) but serve different business functions. A simple example is provided for each to illustrate what the experience looks like in practice.'),
    gap(120),

    ...mkAgent('01','AI Trip Planning Agent',TEAL_LT,TEAL,
      'Generates a complete, personalised travel itinerary based on what the user types — their destination, budget, travel dates, and preferences. The plan is automatically saved to the database so the user can come back, view, and edit it later.',
      [
        'User enters their travel details on the website',
        'Claude reads the input and generates a full day-by-day itinerary',
        'Claude calls the save_itinerary tool to store the plan in the database',
        'User receives their plan with a unique link to revisit or edit it anytime'
      ],
      [
        ['User',   'I want a 5-day trip to Rajasthan for 2 people, budget around $1,500. We love history and local food.'],
        ['AI',     'Perfect! Here is your personalised 5-day Rajasthan journey: Day 1 — Jaipur: Amber Fort at dawn, local thali lunch in the old city, evening at Hawa Mahal... [full itinerary continues]. I have saved this plan for you — you can access and edit it anytime using your link.'],
        ['System', 'Itinerary saved to database. Unique link generated and returned to user.']
      ],
      ['save_itinerary','get_itinerary','update_itinerary']
    ),

    ...mkAgent('02','Blog Generation & Publishing Agent',GRN_LT,GRN_DK,
      'Automatically writes a full, SEO-optimised blog article based on a topic the team enters, then publishes it directly to the website and shares it on Facebook and Instagram — all in one action after human approval.',
      [
        'Team member enters a topic and target keyword',
        'Claude writes a complete blog article with title, sections, and a CTA',
        'Team member previews and approves the content',
        'Claude calls publish_to_website, then share_to_facebook and share_to_instagram',
        'Article goes live on the site and social media simultaneously'
      ],
      [
        ['Team',   'Topic: Top 10 things to do in Pokhara, Nepal. Keyword: Pokhara travel guide.'],
        ['AI',     'Article written (1,100 words, SEO-optimised). Title: "Pokhara Travel Guide: 10 Unmissable Things to Do in Nepal\'s Lake City". Preview shown for approval.'],
        ['Team',   'Looks great — publish it.'],
        ['System', 'Published to WordPress. Shared on Facebook Page. Posted to Instagram Business account.']
      ],
      ['publish_to_website','share_to_facebook','share_to_instagram']
    ),

    ...mkAgent('03','Google Ads Posting Agent',AMB_LT,AMB_DK,
      'Takes a simple business goal — such as promoting a specific tour or season — and automatically creates a complete Google Ads campaign: writes the ad copy, selects keywords, sets the budget, and launches the campaign.',
      [
        'Team enters a goal, target audience, keywords, and daily budget',
        'Claude generates compelling ad headlines and descriptions (up to 15 headlines)',
        'Claude calls create_campaign to set up the campaign structure',
        'Claude calls create_ad_group with the selected keywords',
        'Claude calls create_responsive_search_ad with the ad copy',
        'Campaign goes live on Google — team receives campaign ID to track performance'
      ],
      [
        ['Team',   'Promote our Rajasthan tour to families in the UAE. Budget $20/day. Run for 30 days.'],
        ['AI',     'Campaign created: "GoIndiaNepal — Rajasthan Family Tours". Keywords selected: "India family holiday", "Rajasthan tour package", "India tour from Dubai". 12 headlines and 4 descriptions written. Campaign launched.'],
        ['System', 'Campaign ID: 123456789. Live on Google Ads. Estimated 800–1,200 impressions per day.']
      ],
      ['create_campaign','create_ad_group','create_responsive_search_ad','get_campaign_performance']
    ),

    ...mkAgent('04','Trip Comparison Agent',BLU_LT,BLU_DK,
      'Searches real-time flight and hotel data from live travel APIs, compares multiple options side by side based on price, duration, ratings and user preferences, and recommends the best choice with clear reasoning.',
      [
        'User enters: origin, destination, travel dates, number of travelers, preferences',
        'Claude calls search_flights to fetch real-time flight options',
        'Claude calls search_hotels to fetch accommodation options',
        'Claude analyses all results — price, duration, stops, ratings',
        'Claude presents a ranked comparison with a clear recommendation'
      ],
      [
        ['User',   'Compare flights from Dubai to Delhi on 15 November for 2 adults. We prefer non-stop and value for money.'],
        ['AI',     'I searched 14 available flights. Here are the top 3: 1. Emirates — Direct — 3h 20m — $380/person (recommended). 2. Air Arabia — 1 stop — 5h 45m — $210/person. 3. IndiGo — Direct — 3h 30m — $410/person. My recommendation: Emirates offers the best combination of price and journey time for a direct flight.'],
        ['System', 'Live data from Amadeus API. Results are real-time and may change.']
      ],
      ['search_flights','search_hotels','get_price_calendar']
    ),

    ...mkAgent('05','Automated Feedback Reply Agent',RED_LT,RED_DK,
      'Reads customer reviews and feedback, analyses the sentiment and tone, and generates a professional, empathetic response. The reply is saved to a log for human review and approval before being sent — ensuring quality control at every step.',
      [
        'Feedback arrives (pasted in manually or via a webhook from Google/TripAdvisor)',
        'Claude analyses the sentiment: positive, neutral, or negative',
        'Claude generates a personalised, professional response matching the tone',
        'Claude calls save_feedback_log to record both the original and the reply',
        'Team reviews and approves the reply',
        'Approved reply is sent to the customer via email using the Resend API'
      ],
      [
        ['Customer Review', '"The hotel suggested was not clean and the driver was 20 minutes late. Very disappointing."'],
        ['AI',     '"Thank you for sharing your experience with us. We sincerely apologise — the standard of accommodation and punctuality you described falls short of what GoIndiaNepal promises. We have noted your feedback and are addressing both issues directly. We would welcome the opportunity to make this right. Please contact us at info@goindianepal.com. — The GoIndiaNepal Team"'],
        ['System', 'Reply saved to database with status: pending. Awaiting team approval before sending.']
      ],
      ['save_feedback_log','send_reply_email']
    ),

    new Paragraph({ children:[new PageBreak()] })
  ];
}

// ── Timeline ──────────────────────────────────────────────────────
function timeline() {
  const phaseRow = (phase, days, total, color, tasks) => [
    new TableRow({ children:[
      cell([new Paragraph({ children:[new TextRun({ text:phase, font:'Arial', size:20, bold:true, color:WHITE })] })], 4160, { fill:color, mt:120, mb:120, span:1 }),
      cell([new Paragraph({ children:[new TextRun({ text:days, font:'Arial', size:20, bold:true, color:WHITE })], alignment:AlignmentType.CENTER })], 1600, { fill:color, mt:120, mb:120 }),
      cell([new Paragraph({ children:[new TextRun({ text:total, font:'Arial', size:20, bold:true, color:WHITE })], alignment:AlignmentType.CENTER })], 1600, { fill:color, mt:120, mb:120 }),
      cell([new Paragraph({ children:[new TextRun({ text:'~2 hrs/day', font:'Arial', size:18, color:WHITE })], alignment:AlignmentType.CENTER })], 2000, { fill:color, mt:120, mb:120 })
    ]}),
    ...tasks.map(([day, task]) => new TableRow({ children:[
      cell([new Paragraph({ children:[new TextRun({ text:'    ' + task, font:'Arial', size:18, color:DK_GRY })] })], 4160, { fill:LT_GRY, borders:{ top:noB().top, bottom:b(MID,1), left:noB().left, right:noB().right }, mt:80, mb:80 }),
      cell([new Paragraph({ children:[new TextRun({ text:day, font:'Arial', size:17, color:TEAL, bold:true })], alignment:AlignmentType.CENTER })], 1600, { fill:LT_GRY, borders:{ top:noB().top, bottom:b(MID,1), left:noB().left, right:noB().right }, mt:80, mb:80 }),
      cell([new Paragraph({ children:[] })], 1600, { fill:LT_GRY, borders:{ top:noB().top, bottom:b(MID,1), left:noB().left, right:noB().right }, mt:80, mb:80 }),
      cell([new Paragraph({ children:[] })], 2000, { fill:LT_GRY, borders:{ top:noB().top, bottom:b(MID,1), left:noB().left, right:noB().right }, mt:80, mb:80 })
    ]}))
  ];

  return [
    secLabel('Section 6'),
    h1('Project Timeline'),
    body('The timeline below is calculated at 2 working hours per day. Every task is scoped to be achievable within that window. The build order is intentional — simpler agents are built first so the team learns the pattern before tackling more complex integrations.'),
    gap(60),

    // Summary stats
    new Table({
      width:{ size:9360, type:WidthType.DXA },
      columnWidths:[1872,1872,1872,1872,1872],
      rows:[new TableRow({ children:[
        ...[ ['46','Total Days'], ['92hrs','Total Work'], ['5','Agents Built'], ['2hrs','Per Day'], ['6','Phases'] ]
          .map(([v,l]) => cell([
            new Paragraph({ children:[new TextRun({ text:v, font:'Arial', size:44, bold:true, color:GOLD })], alignment:AlignmentType.CENTER }),
            new Paragraph({ children:[new TextRun({ text:l, font:'Arial', size:17, color:WHITE })], alignment:AlignmentType.CENTER })
          ], 1872, { fill:NAVY, mt:160, mb:160 }))
      ]})]
    }),

    gap(120),
    new Table({
      width:{ size:9360, type:WidthType.DXA },
      columnWidths:[4160,1600,1600,2000],
      rows:[
        new TableRow({ children:[
          hdrCell('Task', 4160, SLATE),
          hdrCell('Day(s)', 1600, SLATE),
          hdrCell('Cumulative', 1600, SLATE),
          hdrCell('Daily Hours', 2000, SLATE)
        ]}),

        // Phase 0
        ...phaseRow('Phase 0 — Setup & Access (Before Day 1)', 'Days 0–3', '4 days', SLATE, [
          ['Day 0',  'Receive all system access: GitHub repo, hosting, CMS, DB credentials'],
          ['Day 1',  'Clone existing repo, set up local environment, install dependencies'],
          ['Day 2',  'Create all API accounts: Anthropic, Supabase, Amadeus, Resend'],
          ['Day 3',  'Apply for Google Ads developer token (approval takes 1–3 days — do this now)'],
        ]),

        // Phase 1
        ...phaseRow('Phase 1 — Agent 5: Feedback Reply Agent (Easiest First)', 'Days 4–11', '8 days', RED_DK, [
          ['Day 4',  'Create Supabase table for feedback_replies. Set up .env variables'],
          ['Day 5',  'Build API route: app/api/feedback-reply/route.ts with Claude tool_use'],
          ['Day 6',  'Define save_feedback_log and send_reply_email tool functions'],
          ['Day 7',  'Build frontend component: paste review → see generated reply'],
          ['Day 8',  'Add star rating selector + platform toggle (Google / TripAdvisor)'],
          ['Day 9',  'Connect Resend API — send approved reply to customer email'],
          ['Day 10', 'Add admin log page showing all feedback history and statuses'],
          ['Day 11', 'Test end-to-end: positive review, negative review, email delivery'],
        ]),

        // Phase 2
        ...phaseRow('Phase 2 — Agent 1: Trip Planning Agent', 'Days 12–21', '10 days', TEAL, [
          ['Day 12', 'Create Supabase itineraries table with all required columns'],
          ['Day 13', 'Build API route with Claude tool_use: save_itinerary, get_itinerary, update_itinerary'],
          ['Day 14', 'Write the trip planner system prompt — Babu\'s voice, day-by-day format'],
          ['Day 15', 'Build streaming chat UI component for the trip planner page'],
          ['Day 16', 'Add user input form: destination, budget, dates, travel style, group type'],
          ['Day 17', 'Connect save tool — itinerary saves automatically after generation'],
          ['Day 18', 'Build itinerary view page — user visits unique link to see saved plan'],
          ['Day 19', 'Add edit functionality — user can update trip details and regenerate'],
          ['Day 20', 'Add WhatsApp CTA after itinerary is generated ("Send to Babu")'],
          ['Day 21', 'Full end-to-end test: generate, save, revisit, edit, WhatsApp link'],
        ]),

        // Phase 3
        ...phaseRow('Phase 3 — Agent 4: Trip Comparison Agent', 'Days 22–30', '9 days', BLU_DK, [
          ['Day 22', 'Set up Amadeus sandbox account and test API credentials in Postman'],
          ['Day 23', 'Build search_flights tool function using Amadeus flightOffersSearch'],
          ['Day 24', 'Build search_hotels tool function using Amadeus hotelOffers'],
          ['Day 25', 'Build API route: app/api/trip-comparison/route.ts with both tools'],
          ['Day 26', 'Write Claude system prompt for comparison and recommendation'],
          ['Day 27', 'Build frontend: origin/destination inputs, date pickers, traveler count'],
          ['Day 28', 'Display comparison results in a structured, readable format'],
          ['Day 29', 'Add booking CTA after recommendation ("Contact Babu to Book")'],
          ['Day 30', 'Test with real routes: Dubai→Delhi, Dubai→Kathmandu, etc.'],
        ]),

        // Phase 4
        ...phaseRow('Phase 4 — Agent 2: Blog Publishing Agent', 'Days 31–38', '8 days', GRN_DK, [
          ['Day 31', 'Test WordPress REST API connection with Application Password credentials'],
          ['Day 32', 'Build publish_to_website tool function (POST to /wp-json/wp/v2/posts)'],
          ['Day 33', 'Build Claude API route with content generation system prompt'],
          ['Day 34', 'Test Meta Graph API — post to Facebook Page in sandbox mode'],
          ['Day 35', 'Build share_to_facebook and share_to_instagram tool functions'],
          ['Day 36', 'Build admin UI: topic input → AI writes → preview → approve → publish'],
          ['Day 37', 'Add approval gate — nothing publishes without explicit team confirmation'],
          ['Day 38', 'Full test: generate article, preview, approve, publish to site + social'],
        ]),

        // Phase 5
        ...phaseRow('Phase 5 — Agent 3: Google Ads Agent (Most Complex)', 'Days 39–46', '8 days', AMB_DK, [
          ['Day 39', 'Confirm Google Ads developer token approved (applied on Day 3). Set up OAuth2 flow.'],
          ['Day 40', 'Build create_campaign tool function using google-ads-api package'],
          ['Day 41', 'Build create_ad_group tool with keyword targeting and bid settings'],
          ['Day 42', 'Build create_responsive_search_ad tool with headlines and descriptions'],
          ['Day 43', 'Build API route with all 3 campaign tools + Claude system prompt'],
          ['Day 44', 'Build get_campaign_performance tool — pull live stats into the dashboard'],
          ['Day 45', 'Build admin UI: enter goal → AI generates ad copy → preview → launch'],
          ['Day 46', 'Final test: create campaign in Google Ads sandbox, verify it appears in dashboard'],
        ]),
      ]
    }),

    gap(120),

    // Milestone table
    h2('6.1  Key Milestones'),
    new Table({
      width:{ size:9360, type:WidthType.DXA },
      columnWidths:[1600,4560,3200],
      rows:[
        new TableRow({ children:[
          hdrCell('Day', 1600, GOLD),
          hdrCell('Milestone', 4560, GOLD),
          hdrCell('Deliverable', 3200, GOLD)
        ]}),
        ...([
          ['Day 3',  'All access obtained, all accounts created',    'Developer environment fully operational'],
          ['Day 11', 'Agent 5 live',                                  'Feedback reply tool working end-to-end'],
          ['Day 21', 'Agent 1 live',                                  'Users can generate and save trip plans'],
          ['Day 30', 'Agent 4 live',                                  'Real-time flight and hotel comparison working'],
          ['Day 38', 'Agent 2 live',                                  'Blog articles publishing to site and social media'],
          ['Day 46', 'Agent 3 live — Project Complete',               'Google Ads campaigns launching from the platform'],
        ]).map(([d,m,dl],i) => new TableRow({ children:[
          cell([new Paragraph({ children:[new TextRun({ text:d, font:'Arial', size:19, bold:true, color:GOLD })] })], 1600, { fill:GOLD_LT, borders:allB('E8D5A0'), mt:100, mb:100 }),
          cell([new Paragraph({ children:[new TextRun({ text:m, font:'Arial', size:19, color:NAVY, bold:true })] })], 4560, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 }),
          cell([new Paragraph({ children:[new TextRun({ text:dl, font:'Arial', size:18, color:DK_GRY })] })], 3200, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 })
        ]}))
      ]
    }),
    new Paragraph({ children:[new PageBreak()] })
  ];
}

// ── Risks & Assumptions ───────────────────────────────────────────
function risksAndAssumptions() {
  return [
    secLabel('Section 7'),
    h1('Risks, Assumptions & Rules'),
    gap(60),

    h2('7.1  Risks & Mitigations'),
    new Table({
      width:{ size:9360, type:WidthType.DXA },
      columnWidths:[3200,1400,4760],
      rows:[
        new TableRow({ children:[
          hdrCell('Risk', 3200, NAVY),
          hdrCell('Impact', 1400, NAVY),
          hdrCell('Mitigation', 4760, NAVY)
        ]}),
        ...([
          ['Google Ads developer token not approved in time', 'High', 'Apply on Day 3. Build Agent 3 last (Days 39–46). If still waiting, mock the API locally and integrate when approved.'],
          ['Access credentials not provided before Day 1', 'High', 'Timeline does not start until all Phase 0 items are confirmed received. Each day of delay = one day added to delivery.'],
          ['Meta API permissions rejected for Instagram publishing', 'Medium', 'Test with Facebook-only publishing first. Instagram requires Business account linked to a Page — confirm this is set up before Day 31.'],
          ['Existing codebase is not Next.js (uses a different framework)', 'Medium', 'Agent API routes can be built as a separate Express.js microservice that the existing site calls. Add 3 days to timeline.'],
          ['Amadeus sandbox data does not reflect real routes', 'Low', 'Sandbox has full coverage of major routes. Test with Dubai→Delhi, Dubai→Kathmandu, London→Mumbai to confirm before going live.'],
        ]).map(([r,imp,m],i) => new TableRow({ children:[
          cell([new Paragraph({ children:[new TextRun({ text:r, font:'Arial', size:18, color:DK_GRY })] })], 3200, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 }),
          cell([new Paragraph({ children:[new TextRun({ text:imp, font:'Arial', size:18, bold:true, color: imp==='High'?RED_DK : imp==='Medium'?AMB_DK : GRN_DK })], alignment:AlignmentType.CENTER })], 1400, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 }),
          cell([new Paragraph({ children:[new TextRun({ text:m, font:'Arial', size:18, color:DK_GRY })] })], 4760, { fill:i%2===0?LT_GRY:WHITE, borders:allB(MID), mt:100, mb:100 })
        ]}))
      ]
    }),

    gap(120),
    h2('7.2  Key Assumptions'),
    body('The following assumptions are built into the timeline. If any of these are incorrect, the timeline will need to be revised before work begins.'),
    gap(60),
    tick('The existing GoIndiaNepal platform uses Next.js or a compatible Node.js framework'),
    tick('All system access listed in Section 2 will be provided before Day 1 of development'),
    tick('A human reviewer will be available to approve blog posts and feedback replies within 24 hours'),
    tick('The Google Ads account has an active billing method and at least one existing campaign (required for API access)'),
    tick('The GoIndiaNepal team will not make major changes to the existing codebase during the development period'),
    tick('The WordPress site is self-hosted or on a plan that allows REST API and Application Password access'),
    tick('The Instagram account is a Business or Creator account connected to a Facebook Page'),

    gap(120),
    h2('7.3  Non-Negotiable Rules'),
    body('The following rules apply to all 5 agents and cannot be bypassed under any circumstances.'),
    gap(60),
    cross('No blog post will ever be published without explicit human approval'),
    cross('No Google Ads campaign will ever launch without explicit human review and confirmation'),
    cross('No customer feedback reply will ever be sent without human approval first'),
    cross('No API keys or credentials will ever be stored in source code — environment variables only'),
    cross('No live Google Ads spending will occur during development — test in sandbox mode only'),

    new Paragraph({ children:[new PageBreak()] })
  ];
}

// ── Closing ───────────────────────────────────────────────────────
function closing() {
  return [
    secLabel('Next Steps'),
    h1('What Happens Next'),
    body('To begin the project, the following three steps need to happen in order. Once Step 3 is complete, development can start immediately.'),
    gap(100),

    new Table({
      width:{ size:9360, type:WidthType.DXA },
      columnWidths:[800,8560],
      rows:[
        ...([
          ['1', 'Approve this project plan', 'Sign off on the timeline, scope, and technology stack outlined in this document. Any changes to scope should be agreed before Day 1 to avoid timeline impact.'],
          ['2', 'Provide all system access (Phase 0)', 'Share all credentials listed in Section 2: GitHub repo, hosting login, CMS admin or API token, database connection, Meta Business Suite access, and Google Ads account access. The timeline clock starts when this is complete.'],
          ['3', 'Create all third-party accounts', 'The GoIndiaNepal team should create accounts for: Anthropic Console, Supabase (or confirm existing DB), Amadeus for Developers, Resend. The development team will create the Google Cloud project and apply for the Google Ads developer token on Day 3.'],
        ]).map(([n,title,desc]) => new TableRow({ children:[
          cell([new Paragraph({ children:[new TextRun({ text:n, font:'Arial', size:32, bold:true, color:GOLD })], alignment:AlignmentType.CENTER })], 800, { fill:GOLD_LT, borders:allB('E8D5A0'), mt:160, mb:160 }),
          cell([
            new Paragraph({ children:[new TextRun({ text:title, font:'Arial', size:20, bold:true, color:NAVY })], spacing:{before:0,after:60} }),
            new Paragraph({ children:[new TextRun({ text:desc, font:'Arial', size:18, color:DK_GRY })], alignment:AlignmentType.JUSTIFIED })
          ], 8560, { borders:allB(MID), mt:160, mb:160 })
        ]})
        )
      ]
    }),

    gap(160),
    hr(GOLD),
    gap(80),
    new Paragraph({
      children:[new TextRun({ text:'"If you\'re happy, I\'m happy."  — Babu, GoIndiaNepal', font:'Arial', size:26, italics:true, color:GOLD })],
      alignment:AlignmentType.CENTER,
      spacing:{ before:160, after:160 }
    }),
    hr(GOLD),
    gap(80),
    new Paragraph({
      children:[new TextRun({ text:'GoIndiaNepal  ·  info@goindianepal.com  ·  +91 981 090 9368  ·  goindianepal.com', font:'Arial', size:18, color:GOLD })],
      alignment:AlignmentType.CENTER
    })
  ];
}

// ── Build document ─────────────────────────────────────────────────
const doc = new Document({
  numbering:{
    config:[
      { reference:'blt', levels:[{ level:0, format:LevelFormat.BULLET, text:'•', alignment:AlignmentType.LEFT,
          style:{ paragraph:{ indent:{ left:540, hanging:360 } } } }] }
    ]
  },
  styles:{
    default:{ document:{ run:{ font:'Arial', size:22, color:DK_GRY } } },
    paragraphStyles:[
      { id:'Heading1', name:'Heading 1', basedOn:'Normal', next:'Normal', quickFormat:true,
        run:{ size:44, bold:true, font:'Arial', color:NAVY },
        paragraph:{ spacing:{ before:240, after:160 }, outlineLevel:0 } },
      { id:'Heading2', name:'Heading 2', basedOn:'Normal', next:'Normal', quickFormat:true,
        run:{ size:28, bold:true, font:'Arial', color:NAVY },
        paragraph:{ spacing:{ before:200, after:120 }, outlineLevel:1 } }
    ]
  },
  sections:[{
    properties:{
      page:{
        size:{ width:12240, height:15840 },
        margin:{ top:1080, right:1080, bottom:1080, left:1080 }
      }
    },
    headers:{
      default: new Header({ children:[
        new Paragraph({
          children:[
            new TextRun({ text:'GoIndiaNepal  —  AI Agent Integration Project Plan', font:'Arial', size:16, color:NAVY, bold:true }),
            new TextRun({ text:'        Confidential · May 2026', font:'Arial', size:16, color:GOLD })
          ],
          border:{ bottom:{ style:BorderStyle.SINGLE, size:6, color:GOLD, space:1 } },
          spacing:{ before:0, after:60 }
        })
      ]})
    },
    footers:{
      default: new Footer({ children:[
        new Paragraph({
          children:[
            new TextRun({ text:'goindianepal.com        ', font:'Arial', size:16, color:GOLD }),
            new TextRun({ text:'Page ', font:'Arial', size:16, color:DK_GRY }),
            new TextRun({ children:[PageNumber.CURRENT], font:'Arial', size:16, color:DK_GRY }),
            new TextRun({ text:' of ', font:'Arial', size:16, color:DK_GRY }),
            new TextRun({ children:[PageNumber.TOTAL_PAGES], font:'Arial', size:16, color:DK_GRY }),
          ],
          border:{ top:{ style:BorderStyle.SINGLE, size:6, color:GOLD, space:1 } },
          spacing:{ before:60, after:0 },
          alignment: AlignmentType.RIGHT
        })
      ]})
    },
    children:[
      ...coverPage(),
      ...executiveSummary(),
      ...existingSystemAccess(),
      ...prerequisites(),
      ...techStack(),
      ...agentDescriptions(),
      ...timeline(),
      ...risksAndAssumptions(),
      ...closing()
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  const outPath = require('path').join(__dirname, 'GoIndiaNepal_AI_Project_Plan.docx');
  fs.writeFileSync(outPath, buf);
  console.log('Done →', outPath);
});
