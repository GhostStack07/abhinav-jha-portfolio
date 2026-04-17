export interface WorkItem {
  n: string
  title: string
  copy: string
  kpi: { v: string; u: string; k: string }
  tags: string[]
}

export interface XpItem {
  date: string
  dateBold: string
  role: string
  co: string
  loc: string
  items: string[]
}

export interface StackColumn {
  n: string
  title: string
  eyebrow: string
  items: [string, string][]
}

export const WORK: WorkItem[] = [
  {
    n: '001',
    title: 'Resort Campaigns — <i>42× ROAS</i> seasonal push',
    copy: "Full-stack conversion tracking across Google Tag Manager, Meta Pixel, and GA4 + remarketing strategy that compounded. The media wasn't magic — the plumbing was.",
    kpi: { v: '42', u: '×', k: 'Peak ROAS' },
    tags: ['Meta Ads', 'Google Ads', 'GTM', 'GA4', 'Hospitality'],
  },
  {
    n: '002',
    title: 'Four <i>AI agents</i>, shipped to production',
    copy: 'Built and deployed agents for blog generation, client research, ad-copy creation, and social-media planning. Content turnaround compressed from days to hours; creative briefs became self-serve.',
    kpi: { v: '4', u: '', k: 'Agents shipped' },
    tags: ['Claude', 'GPT', 'Agents', 'Content Ops'],
  },
  {
    n: '003',
    title: 'Automated lead routing — <i>hours → seconds</i>',
    copy: 'Make.com + 2Chat pipeline that delivers qualified leads directly into client WhatsApp groups the moment they convert. Response time collapsed from hours to seconds — and conversion followed.',
    kpi: { v: '20', u: '%', k: 'Conversion lift' },
    tags: ['Make.com', '2Chat', 'WhatsApp API', 'CRM'],
  },
  {
    n: '004',
    title: 'Custom WordPress booking plugin (<i>Claude-built</i>)',
    copy: 'Worked with Claude to design and ship a WordPress plugin handling ticketing, capacity management, and reporting. Replaced a spreadsheet-stitched manual process with a single source of truth.',
    kpi: { v: '1', u: '', k: 'Plugin · live in prod' },
    tags: ['WordPress', 'Claude', 'PHP', 'Plugin Dev'],
  },
  {
    n: '005',
    title: 'PPC &amp; SEM — <i>INR 90L+</i> revenue engine',
    copy: 'Performance marketing program across paid search and social generating INR 90L+ in client revenue at 7.5× ROAS. Contributed up to 30% of overall client business.',
    kpi: { v: '7.5', u: '×', k: 'ROAS (blended)' },
    tags: ['Google Ads', 'Meta Ads', 'SEM', 'Performance'],
  },
  {
    n: '006',
    title: 'Seasonal campaign — <i>INR 55L</i> in 8 weeks',
    copy: 'Delivered INR 55L of seasonal campaign revenue at ~5× ROAS by reallocating budget through weekly data reviews and sharpening the remarketing stack.',
    kpi: { v: '55L', u: '₹', k: 'Seasonal revenue' },
    tags: ['Remarketing', 'Budget Ops', 'Seasonal'],
  },
  {
    n: '007',
    title: 'Real-time dashboards &amp; <i>faster lead response</i>',
    copy: 'Real-time dashboards plus a lead-response SLA that the team actually hit — because the dashboards made laggards obvious. 20% lift in conversion rates.',
    kpi: { v: '20', u: '%', k: 'Conversion rate ↑' },
    tags: ['Dashboards', 'Looker', 'CRM', 'Ops'],
  },
  {
    n: '008',
    title: 'Agency growth — <i>20% YoY</i>, 10+ new clients/yr',
    copy: 'Led automation adoption (Make / Zapier / Pabbly) across agency workflows, closed 10+ new clients annually, and contributed to 20% YoY agency revenue growth.',
    kpi: { v: '20', u: '%', k: 'YoY agency growth' },
    tags: ['Leadership', 'BD', 'Automation'],
  },
]

export const XP: XpItem[] = [
  {
    date: 'May 2019 — Present',
    dateBold: '~ 7 years',
    role: 'Operations &amp; Account <i>Management Head</i>',
    co: 'Internet Moguls · <b>Full-time</b>',
    loc: 'New Delhi / Bangalore',
    items: [
      '<b>Shipped 4 AI agents</b> — blog generation, client research, ad copy, social planning — collapsing content turnaround from days to hours',
      '<b>Automated lead routing</b> via Make.com + 2Chat dropping leads into client WhatsApp groups; response time cut from hours to seconds',
      '<b>Built a custom WordPress booking plugin</b> with Claude — ticketing, capacity management, and reporting in one place',
      '<b>42× ROAS</b> on resort campaigns via full-stack tracking (GTM, Meta Pixel, GA4) and remarketing',
      '<b>INR 90L+ revenue</b> from PPC/SEM at 7.5× ROAS — contributing up to 30% of client business',
      '<b>INR 55L seasonal revenue</b> at ~5× ROAS through budget reallocation and data-led remarketing',
      '<b>Led a team of 30+</b> across marketing, content, and client servicing',
      '<b>+20% conversion rate</b> via real-time dashboards and faster lead-response systems',
      '<b>+20% YoY agency growth</b>; closed 10+ new clients annually',
    ],
  },
  {
    date: 'Jan 2019 — May 2019',
    dateBold: '5 months',
    role: 'Digital Marketing <i>Specialist</i>',
    co: 'Wintage Group of Companies · <b>Full-time</b>',
    loc: 'New Delhi',
    items: [
      '<b>Managed marketplace ops</b> — Amazon, Flipkart, Myntra — including listings and AMS campaigns',
      '<b>+15% revenue</b> via PPC advertising across marketplaces',
      '<b>Resolved 200+ SKU inconsistencies</b> through detailed data analysis, improving catalog accuracy and performance',
    ],
  },
  {
    date: 'Dec 2018',
    dateBold: 'Internship',
    role: 'Digital Marketing <i>Intern</i>',
    co: 'Drona Training Academy · <b>Intern</b>',
    loc: 'New Delhi',
    items: ['<b>Generated 50+ leads</b> via Facebook Ads, Google Ads PPC, and email campaigns'],
  },
]

export const STACK: StackColumn[] = [
  {
    n: '01',
    title: 'AI & <i>Automation</i>',
    eyebrow: 'Ship agents, not slides',
    items: [
      ['AI Agents (Claude, GPT)', 'expert'],
      ['Make.com', 'expert'],
      ['Zapier', 'expert'],
      ['Pabbly', 'advanced'],
      ['Workflow orchestration', 'expert'],
      ['AI Website Generation', 'advanced'],
      ['Prompt design', 'expert'],
    ],
  },
  {
    n: '02',
    title: 'Paid Media & <i>Analytics</i>',
    eyebrow: 'Numbers that survive audit',
    items: [
      ['Google Ads', 'expert'],
      ['Meta Ads', 'expert'],
      ['GA4', 'expert'],
      ['Adobe Analytics', 'advanced'],
      ['SEO (SEMrush / Ahrefs)', 'advanced'],
      ['SEM / PPC', 'expert'],
      ['Data analysis', 'advanced'],
    ],
  },
  {
    n: '03',
    title: 'Technical & <i>Leadership</i>',
    eyebrow: 'Builds + people, together',
    items: [
      ['WordPress plugin dev', 'advanced'],
      ['WhatsApp Business API', 'advanced'],
      ['Webhooks', 'advanced'],
      ['HTML / CSS / JS', 'working'],
      ['Zoho CRM · HubSpot', 'expert'],
      ['Team management (30+)', 'expert'],
      ['P&L · Strategy', 'expert'],
    ],
  },
]
