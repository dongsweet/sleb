import { memberFeatureMatrix, membershipLevels } from '@sleb/shared';

export type PublicPage = {
  path: string;
  legacyPath?: string;
  title: string;
  group: string;
  kicker: string;
  summary: string;
  owner: string;
  status: 'public' | 'member' | 'tool' | 'policy';
  contentModel: string;
  publishRoles: string[];
  actions: string[];
  records: string[];
};

export type AdminSection = {
  path: string;
  title: string;
  summary: string;
  queue: string;
  owners: string[];
  metrics: Array<{ label: string; value: string }>;
  workItems: Array<{ title: string; state: string; owner: string }>;
};

export type PublishingRole = {
  id: string;
  title: string;
  level: string;
  mission: string;
  canDraft: string[];
  canPublish: string[];
  reviewBoundary: string;
};

export const primaryNav = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Buildings', href: '/buildings/green-mark-directory' },
  { label: 'Technologies', href: '/technologies' },
  { label: 'Services', href: '/services' },
  { label: 'AI Calculator', href: '/ai-calculator' },
  { label: 'Membership', href: '/membership' },
  { label: 'Login', href: '/account/login' }
] as const;

export const publicPages: PublicPage[] = [
  {
    path: 'about',
    legacyPath: '/About',
    title: 'About SLEB',
    group: 'Organisation',
    kicker: 'Singapore built environment platform',
    summary:
      'Position the alliance, mission, partners, programme focus, and the transition into a maintained digital platform.',
    owner: 'Content team',
    status: 'public',
    contentModel: 'Static page with partner callouts and reusable content blocks',
    publishRoles: ['Content Author', 'Content Publisher'],
    actions: ['Contact the secretariat', 'View membership plans'],
    records: ['Mission statement', 'Advisory partners', 'Programme pillars']
  },
  {
    path: 'news',
    legacyPath: '/News',
    title: 'News',
    group: 'Resources',
    kicker: 'Updates and announcements',
    summary:
      'Editorial listing for platform updates, industry announcements, partner stories, and archived news posts.',
    owner: 'Content team',
    status: 'public',
    contentModel: 'Article collection with tags, hero image, excerpt, body, author, and publish date',
    publishRoles: ['Content Author', 'Content Publisher'],
    actions: ['Filter by topic', 'Open article detail'],
    records: ['Announcement', 'Industry story', 'Partner update']
  },
  {
    path: 'events',
    legacyPath: '/Events',
    title: 'Events',
    group: 'Resources',
    kicker: 'Programmes and workshops',
    summary:
      'Event calendar for webinars, workshops, training sessions, and industry gatherings with registration links.',
    owner: 'Content team',
    status: 'public',
    contentModel: 'Event collection with date, venue, registration URL, agenda, and speakers',
    publishRoles: ['Content Author', 'Content Publisher'],
    actions: ['Browse upcoming events', 'Review past events'],
    records: ['Webinar', 'Workshop', 'Industry forum']
  },
  {
    path: 'publications',
    legacyPath: '/Publications',
    title: 'Publications',
    group: 'Resources',
    kicker: 'Guides and downloadable references',
    summary:
      'Library of reports, playbooks, technical guides, circulars, and policy references with controlled downloads.',
    owner: 'Content team',
    status: 'public',
    contentModel: 'Document collection with file object, cover image, abstract, topic, and access level',
    publishRoles: ['Content Author', 'Content Publisher'],
    actions: ['Download document', 'Filter by topic'],
    records: ['Guide', 'Report', 'Circular']
  },
  {
    path: 'grants-and-incentives',
    legacyPath: '/Grants',
    title: 'Grants and Incentives',
    group: 'Resources',
    kicker: 'Funding and support pathways',
    summary:
      'Structured list of grants, incentives, eligibility notes, deadlines, and application links for green building adoption.',
    owner: 'Content team',
    status: 'public',
    contentModel: 'Reusable incentive records with eligibility, agency, application URL, and deadline',
    publishRoles: ['Content Author', 'Content Publisher'],
    actions: ['Compare schemes', 'Open agency page'],
    records: ['Grant', 'Tax incentive', 'Support programme']
  },
  {
    path: 'buildings/green-mark-directory',
    legacyPath: '/Building',
    title: 'Green Mark Buildings Directory',
    group: 'Directories',
    kicker: 'Certified buildings and project evidence',
    summary:
      'Searchable directory for Green Mark buildings with certification metadata, address, map location, and project attributes.',
    owner: 'Directory team',
    status: 'public',
    contentModel: 'Directory entry with certification fields, geometry, owner, and imported legacy metadata',
    publishRoles: ['Directory Reviewer', 'Platform Admin'],
    actions: ['Search buildings', 'Open map view', 'Review building detail'],
    records: ['Building listing', 'Certification record', 'Map marker']
  },
  {
    path: 'buildings/energy-benchmarking',
    legacyPath: '/EnergyBenchmarking',
    title: 'Energy Benchmarking',
    group: 'Tools',
    kicker: 'Performance comparison',
    summary:
      'Public explanation and member-linked workspace for building energy benchmarking, indicators, and comparison cohorts.',
    owner: 'Assessment team',
    status: 'tool',
    contentModel: 'Tool landing page with guidance blocks, benchmark definitions, and assessment records',
    publishRoles: ['Assessment Manager', 'Platform Admin'],
    actions: ['Start benchmarking', 'Review methodology'],
    records: ['Benchmark metric', 'Assessment record', 'Methodology note']
  },
  {
    path: 'technologies',
    legacyPath: '/Technologies',
    title: 'Technologies Directory',
    group: 'Directories',
    kicker: 'Solutions and products',
    summary:
      'Directory for green building technologies, product submissions, performance claims, suppliers, and evidence links.',
    owner: 'Directory team',
    status: 'public',
    contentModel: 'Technology listing with category, supplier, claimed benefits, documents, and review status',
    publishRoles: ['Directory Reviewer', 'Platform Admin'],
    actions: ['Filter technologies', 'Compare entries', 'Submit as member'],
    records: ['Technology listing', 'Supplier profile', 'Evidence document']
  },
  {
    path: 'services',
    legacyPath: '/ServiceDirectory',
    title: 'Service Directory',
    group: 'Directories',
    kicker: 'Qualified service providers',
    summary:
      'Directory for consultants, solution providers, energy specialists, and implementation partners submitted by members.',
    owner: 'Directory team',
    status: 'public',
    contentModel: 'Service listing with service type, company owner, contact channel, and approval trail',
    publishRoles: ['Directory Reviewer', 'Platform Admin'],
    actions: ['Find provider', 'Open company profile', 'Submit service'],
    records: ['Service listing', 'Provider profile', 'Approval note']
  },
  {
    path: 'terms-dictionary',
    legacyPath: '/Term',
    title: 'Terms Dictionary',
    group: 'Resources',
    kicker: 'Built environment glossary',
    summary:
      'A-Z dictionary for green building, efficiency, certification, and assessment terminology used across the site.',
    owner: 'Content team',
    status: 'public',
    contentModel: 'Glossary entry with term, definition, related terms, source, and revision history',
    publishRoles: ['Content Publisher', 'Directory Reviewer'],
    actions: ['Search terms', 'Browse alphabetically'],
    records: ['Term', 'Definition', 'Related term']
  },
  {
    path: 'projects',
    legacyPath: '/Project',
    title: 'Project Map',
    group: 'Projects',
    kicker: 'Research, pilots, and built examples',
    summary:
      'Map and list view for R&D projects, pilot deployments, case studies, and location-based reference projects.',
    owner: 'Directory team',
    status: 'public',
    contentModel: 'Project entry with geometry, partners, category, findings, and linked publications',
    publishRoles: ['Directory Reviewer', 'Content Publisher'],
    actions: ['Open map', 'Filter by project type'],
    records: ['R&D project', 'Pilot project', 'Case study']
  },
  {
    path: 'ai-calculator',
    legacyPath: '/AICalculator',
    title: 'AI Calculator',
    group: 'Tools',
    kicker: 'Member self-assessment workflow',
    summary:
      'Landing and workspace entry for the AI calculator, with method content separated from calculation rules and report records.',
    owner: 'Assessment team',
    status: 'tool',
    contentModel: 'Tool session with inputs, derived results, report object, and audit trail',
    publishRoles: ['Assessment Manager', 'Platform Admin'],
    actions: ['Start calculation', 'Resume saved draft'],
    records: ['Calculator session', 'Input set', 'Generated report']
  },
  {
    path: 'beea',
    legacyPath: '/BEEA',
    title: 'BEEA',
    group: 'Tools',
    kicker: 'Building energy efficiency assessment',
    summary:
      'Member assessment workspace for BEEA records, evidence capture, result review, and future report generation.',
    owner: 'Assessment team',
    status: 'member',
    contentModel: 'Assessment record with building link, answers, evidence uploads, scoring, and reviewer notes',
    publishRoles: ['Assessment Manager', 'Platform Admin'],
    actions: ['Create assessment', 'Review draft assessments'],
    records: ['BEEA draft', 'Evidence file', 'Assessment score']
  },
  {
    path: 'smeea',
    legacyPath: '/SMEEA',
    title: 'SMEEA',
    group: 'Tools',
    kicker: 'SME energy efficiency assessment',
    summary:
      'Member tool for SME assessment records, self-assessment flow, report download gating, and future review states.',
    owner: 'Assessment team',
    status: 'member',
    contentModel: 'Assessment record with company owner, answers, score, report entitlement, and export state',
    publishRoles: ['Assessment Manager', 'Platform Admin'],
    actions: ['Start self-assessment', 'Download eligible reports'],
    records: ['SMEEA draft', 'SMEEA report', 'Score summary']
  },
  {
    path: 'membership',
    legacyPath: '/Membership',
    title: 'Membership',
    group: 'Membership',
    kicker: 'Corporate membership lifecycle',
    summary:
      'Plans, account state, company application, active membership dashboard, and feature access based on company plan.',
    owner: 'Membership team',
    status: 'member',
    contentModel: 'Membership plan, company application, payment status, entitlement map, and account association',
    publishRoles: ['Membership Reviewer', 'Platform Admin'],
    actions: ['Compare plans', 'Start application', 'Review feature access'],
    records: membershipLevels.map((level) => `${level.name}: ${level.summary}`)
  },
  {
    path: 'membership/register',
    legacyPath: '/Membership/Register',
    title: 'Membership Application',
    group: 'Membership',
    kicker: 'Company application form',
    summary:
      'Company profile, plan selection, attachments, declaration, and review handoff for a new corporate membership.',
    owner: 'Membership team',
    status: 'member',
    contentModel: 'Application form with company data, requested plan, attachments, status, and reviewer fields',
    publishRoles: ['Membership Reviewer', 'Platform Admin'],
    actions: ['Save draft', 'Submit application'],
    records: ['Company profile', 'Plan request', 'Attachment set']
  },
  {
    path: 'account/login',
    legacyPath: '/Account/AjaxLogin',
    title: 'Account Login',
    group: 'Account',
    kicker: 'Secure account entry',
    summary:
      'Login entry for individual users, future LinkedIn/OAuth support, reset password, and session handoff.',
    owner: 'Platform team',
    status: 'member',
    contentModel: 'Authentication form and account recovery states',
    publishRoles: ['Platform Admin'],
    actions: ['Sign in', 'Reset password'],
    records: ['Email login', 'Account recovery', 'Session']
  },
  {
    path: 'account/register',
    legacyPath: '/Account/Register',
    title: 'Account Registration',
    group: 'Account',
    kicker: 'Individual account setup',
    summary:
      'New user registration before company membership association, email verification, and profile completion.',
    owner: 'Platform team',
    status: 'member',
    contentModel: 'User profile, email verification state, consent, and company association request',
    publishRoles: ['Platform Admin'],
    actions: ['Create account', 'Verify email'],
    records: ['User account', 'Email verification', 'Consent record']
  },
  {
    path: 'contact',
    legacyPath: '/Contact',
    title: 'Contact',
    group: 'Organisation',
    kicker: 'Enquiry routing',
    summary:
      'Contact page for general enquiries, membership questions, directory updates, and feedback routing.',
    owner: 'Content team',
    status: 'public',
    contentModel: 'Static contact blocks plus enquiry categories for backend triage',
    publishRoles: ['Content Publisher', 'Platform Admin'],
    actions: ['Send enquiry', 'Locate office'],
    records: ['Contact channel', 'Enquiry category', 'Office address']
  },
  {
    path: 'privacy-policy',
    legacyPath: '/Privacy',
    title: 'Privacy Policy',
    group: 'Policies',
    kicker: 'Data handling notice',
    summary:
      'Policy content for personal data, cookies, analytics, user accounts, uploaded records, and retention expectations.',
    owner: 'Governance team',
    status: 'policy',
    contentModel: 'Versioned legal page with approval metadata and effective date',
    publishRoles: ['Content Publisher', 'Platform Admin'],
    actions: ['Review latest policy', 'Open revision history'],
    records: ['Policy version', 'Effective date', 'Approval note']
  },
  {
    path: 'terms-and-conditions',
    legacyPath: '/Terms',
    title: 'Terms and Conditions',
    group: 'Policies',
    kicker: 'Platform terms',
    summary:
      'Terms for account use, directory submissions, membership content, downloadable files, and assessment outputs.',
    owner: 'Governance team',
    status: 'policy',
    contentModel: 'Versioned legal page with approval metadata and effective date',
    publishRoles: ['Content Publisher', 'Platform Admin'],
    actions: ['Review terms', 'Open revision history'],
    records: ['Terms version', 'Effective date', 'Approval note']
  },
  {
    path: 'sitemap',
    legacyPath: '/Sitemap',
    title: 'Sitemap',
    group: 'Policies',
    kicker: 'Route inventory',
    summary:
      'Human-readable route inventory for public pages, member workspaces, policies, and backend administration.',
    owner: 'Platform team',
    status: 'public',
    contentModel: 'Generated page list from the route registry',
    publishRoles: ['Platform Admin'],
    actions: ['Audit routes', 'Open legacy mapping'],
    records: ['Public route', 'Admin route', 'Legacy route']
  }
];

export const adminSections: AdminSection[] = [
  {
    path: 'content',
    title: 'Content Desk',
    summary: 'Draft, edit, schedule, and publish public pages, articles, events, publications, grants, and policies.',
    queue: 'Editorial publishing',
    owners: ['Content Author', 'Content Publisher'],
    metrics: [
      { label: 'Drafts', value: '18' },
      { label: 'In review', value: '7' },
      { label: 'Scheduled', value: '3' }
    ],
    workItems: [
      { title: 'Green retrofit grant update', state: 'In review', owner: 'Content Publisher' },
      { title: 'May workshop landing page', state: 'Draft', owner: 'Content Author' },
      { title: 'Privacy policy revision', state: 'Needs approval', owner: 'Platform Admin' }
    ]
  },
  {
    path: 'directories',
    title: 'Directory Console',
    summary: 'Review and publish buildings, technologies, services, terms, and project map entries.',
    queue: 'Directory moderation',
    owners: ['Directory Reviewer', 'Platform Admin'],
    metrics: [
      { label: 'Submitted', value: '26' },
      { label: 'Flagged', value: '4' },
      { label: 'Published this week', value: '31' }
    ],
    workItems: [
      { title: 'Premium member technology listing', state: 'Evidence check', owner: 'Directory Reviewer' },
      { title: 'New service provider profile', state: 'Submitted', owner: 'Directory Reviewer' },
      { title: 'Green Mark building import batch', state: 'Ready to publish', owner: 'Platform Admin' }
    ]
  },
  {
    path: 'memberships',
    title: 'Membership Review',
    summary: 'Process company applications, renewals, upgrade requests, payment handoffs, and company user associations.',
    queue: 'Membership lifecycle',
    owners: ['Membership Reviewer', 'Platform Admin'],
    metrics: [
      { label: 'Applications', value: '9' },
      { label: 'Awaiting payment', value: '5' },
      { label: 'Renewals due', value: '12' }
    ],
    workItems: [
      { title: 'Standard membership application', state: 'Pending review', owner: 'Membership Reviewer' },
      { title: 'Premium upgrade request', state: 'Approved awaiting payment', owner: 'Membership Reviewer' },
      { title: 'Company admin transfer', state: 'Needs platform approval', owner: 'Platform Admin' }
    ]
  },
  {
    path: 'tools',
    title: 'Assessment Tools',
    summary: 'Maintain BEEA, SMEEA, AI Calculator, benchmarking copy, report templates, and rule versions.',
    queue: 'Tool governance',
    owners: ['Assessment Manager', 'Platform Admin'],
    metrics: [
      { label: 'Rule drafts', value: '6' },
      { label: 'Report templates', value: '4' },
      { label: 'Open questions', value: '11' }
    ],
    workItems: [
      { title: 'SMEEA report download entitlement', state: 'Rule mapping', owner: 'Assessment Manager' },
      { title: 'BEEA evidence checklist', state: 'Draft', owner: 'Assessment Manager' },
      { title: 'AI calculator method note', state: 'Needs confirmation', owner: 'Platform Admin' }
    ]
  },
  {
    path: 'media',
    title: 'Media Library',
    summary: 'Store and reuse images, documents, publication files, attachments, and content media with audit metadata.',
    queue: 'Media governance',
    owners: ['Content Author', 'Content Publisher', 'Platform Admin'],
    metrics: [
      { label: 'Files', value: '142' },
      { label: 'Unattached', value: '17' },
      { label: 'Needs alt text', value: '8' }
    ],
    workItems: [
      { title: 'Publication cover set', state: 'Ready', owner: 'Content Author' },
      { title: 'Directory evidence upload', state: 'Linked to review', owner: 'Directory Reviewer' },
      { title: 'Legacy PDF import', state: 'Needs owner', owner: 'Platform Admin' }
    ]
  },
  {
    path: 'roles',
    title: 'Roles and Permissions',
    summary: 'Define who can draft, review, publish, approve memberships, and override platform-wide settings.',
    queue: 'Permission design',
    owners: ['Platform Admin'],
    metrics: [
      { label: 'Publishing roles', value: '7' },
      { label: 'Member roles', value: '2' },
      { label: 'Approval boundaries', value: '5' }
    ],
    workItems: [
      { title: 'Separate author and publisher duties', state: 'Recommended', owner: 'Platform Admin' },
      { title: 'Company admin submission rights', state: 'Mapped', owner: 'Membership Reviewer' },
      { title: 'Tool manager boundary', state: 'Needs client confirmation', owner: 'Platform Admin' }
    ]
  }
];

export const publishingRoles: PublishingRole[] = [
  {
    id: 'platform-admin',
    title: 'Platform Admin',
    level: 'System',
    mission:
      'Owns users, roles, platform settings, emergency publish/unpublish, imports, redirects, and final override authority.',
    canDraft: ['Any content type'],
    canPublish: ['All public content', 'All directory entries', 'Policies', 'Tool templates'],
    reviewBoundary: 'Should be rare in day-to-day publishing; keep as governance and recovery authority.'
  },
  {
    id: 'content-author',
    title: 'Content Author',
    level: 'Editorial',
    mission:
      'Creates and maintains drafts for news, events, publications, grants, static pages, and policy copy.',
    canDraft: ['News', 'Events', 'Publications', 'Grants', 'Static pages'],
    canPublish: ['None'],
    reviewBoundary: 'Cannot publish directly; sends work to Content Publisher.'
  },
  {
    id: 'content-publisher',
    title: 'Content Publisher',
    level: 'Editorial',
    mission:
      'Reviews editorial quality, SEO, link safety, media readiness, and publishes public editorial content.',
    canDraft: ['Editorial corrections', 'Policy revision notes'],
    canPublish: ['News', 'Events', 'Publications', 'Grants', 'Static pages', 'Terms dictionary'],
    reviewBoundary: 'Does not approve member directory claims or membership applications.'
  },
  {
    id: 'company-admin',
    title: 'Company Admin',
    level: 'Member',
    mission:
      'Manages the company profile, connected users, and member-owned submissions for buildings, services, and technologies.',
    canDraft: ['Company profile', 'My Buildings', 'My Services', 'My Technology'],
    canPublish: ['None'],
    reviewBoundary: 'Submits records into review; cannot publish public directory pages.'
  },
  {
    id: 'directory-reviewer',
    title: 'Directory Reviewer',
    level: 'Directory',
    mission:
      'Checks submitted buildings, technologies, services, terms, and project records before public directory publication.',
    canDraft: ['Directory corrections', 'Import cleanup notes'],
    canPublish: ['Buildings', 'Technologies', 'Services', 'Terms', 'Projects'],
    reviewBoundary: 'Focuses on listing quality and evidence; does not manage membership payments.'
  },
  {
    id: 'membership-reviewer',
    title: 'Membership Reviewer',
    level: 'Membership',
    mission:
      'Reviews company membership applications, renewal or upgrade requests, and company user association changes.',
    canDraft: ['Review notes', 'Rejection reasons', 'Approval records'],
    canPublish: ['Membership state changes'],
    reviewBoundary: 'Approves access lifecycle, not editorial content or public directory claims.'
  },
  {
    id: 'assessment-manager',
    title: 'Assessment Manager',
    level: 'Tools',
    mission:
      'Maintains BEEA, SMEEA, AI Calculator, benchmarking pages, method notes, report templates, and rule versions.',
    canDraft: ['Tool copy', 'Rule version notes', 'Report templates'],
    canPublish: ['Tool landing pages', 'Method notes', 'Report templates'],
    reviewBoundary: 'Needs business-rule signoff before changing scoring or calculation logic.'
  }
];

export const memberFeatureRows = memberFeatureMatrix.map((feature) => ({
  feature: feature.label,
  minimumLevel: feature.minimumLevel
}));

export const pageGroups = Array.from(new Set(publicPages.map((page) => page.group)));

export function getPublicPage(slug: string) {
  return publicPages.find((page) => page.path === slug);
}

export function getAdminSection(slug?: string) {
  if (!slug) {
    return undefined;
  }

  return adminSections.find((section) => section.path === slug);
}

export function getPagesByGroup(group: string) {
  return publicPages.filter((page) => page.group === group);
}
