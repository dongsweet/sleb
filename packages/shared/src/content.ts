import { z } from 'zod';

export const contentTypes = [
  'news',
  'event',
  'grant',
  'incentive',
  'publication',
  'static_page',
  'policy'
] as const;

export const contentStatuses = [
  'draft',
  'in_review',
  'published',
  'scheduled',
  'archived'
] as const;

export const aiSuggestionKinds = [
  'expand',
  'summarize',
  'seo',
  'alt_text',
  'image_prompt'
] as const;

export const contentTypeSchema = z.enum(contentTypes);
export const contentStatusSchema = z.enum(contentStatuses);
export const aiSuggestionKindSchema = z.enum(aiSuggestionKinds);

export type ContentType = z.infer<typeof contentTypeSchema>;
export type ContentStatus = z.infer<typeof contentStatusSchema>;
export type AiSuggestionKind = z.infer<typeof aiSuggestionKindSchema>;

export type ContentFieldKind = 'text' | 'date' | 'datetime' | 'url' | 'file';

export type ContentTypeConfig = {
  type: ContentType;
  label: string;
  description: string;
  workflowOwner: string;
  template: 'article' | 'event' | 'funding' | 'document' | 'page' | 'policy';
  fields: Array<{
    key: string;
    label: string;
    kind: ContentFieldKind;
    required?: boolean;
  }>;
};

export type ContentItem = {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  summary: string;
  body: string;
  status: ContentStatus;
  heroImage?: string;
  metadata: Record<string, string>;
  seo: {
    title?: string;
    description?: string;
  };
  authorName: string;
  reviewerName?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  publishedAt?: string;
  scheduledFor?: string;
};

export type ContentVersion = {
  id: string;
  itemId: string;
  versionNumber: number;
  snapshot: ContentItem;
  createdByName: string;
  createdAt: string;
};

export type ContentWorkflowEvent = {
  id: string;
  itemId: string;
  action:
    | 'created'
    | 'updated'
    | 'submitted'
    | 'published'
    | 'unpublished'
    | 'archived';
  actorName: string;
  note?: string;
  createdAt: string;
};

export type AiSuggestion = {
  id: string;
  itemId?: string;
  kind: AiSuggestionKind;
  input: string;
  output: string;
  status: 'draft' | 'accepted' | 'dismissed';
  createdByName: string;
  createdAt: string;
};

export type MediaAsset = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  altText?: string;
  caption?: string;
  createdByName: string;
  createdAt: string;
};

export type ContentUpsertInput = {
  type: ContentType;
  title: string;
  slug?: string;
  summary?: string;
  body?: string;
  status?: ContentStatus;
  heroImage?: string;
  metadata?: Record<string, string>;
  seo?: {
    title?: string;
    description?: string;
  };
  scheduledFor?: string;
};

export const contentTypeConfigs: ContentTypeConfig[] = [
  {
    type: 'news',
    label: 'News',
    description:
      'Announcements, industry updates, partner stories, and platform news.',
    workflowOwner: 'Content Publisher',
    template: 'article',
    fields: [
      { key: 'source', label: 'Source', kind: 'text' },
      { key: 'topic', label: 'Topic', kind: 'text' }
    ]
  },
  {
    type: 'event',
    label: 'Events',
    description: 'Webinars, workshops, forums, and programme calendar entries.',
    workflowOwner: 'Content Publisher',
    template: 'event',
    fields: [
      {
        key: 'startsAt',
        label: 'Start date and time',
        kind: 'datetime',
        required: true
      },
      { key: 'endsAt', label: 'End date and time', kind: 'datetime' },
      { key: 'venue', label: 'Venue', kind: 'text' },
      { key: 'registrationUrl', label: 'Registration URL', kind: 'url' }
    ]
  },
  {
    type: 'grant',
    label: 'Grants',
    description:
      'Funding schemes, calls for proposals, and application notices.',
    workflowOwner: 'Content Publisher',
    template: 'funding',
    fields: [
      { key: 'agency', label: 'Agency', kind: 'text', required: true },
      { key: 'eligibility', label: 'Eligibility', kind: 'text' },
      { key: 'deadline', label: 'Deadline', kind: 'date' },
      { key: 'applicationUrl', label: 'Application URL', kind: 'url' }
    ]
  },
  {
    type: 'incentive',
    label: 'Incentives',
    description: 'Tax incentives, support programmes, and adoption pathways.',
    workflowOwner: 'Content Publisher',
    template: 'funding',
    fields: [
      { key: 'agency', label: 'Agency', kind: 'text' },
      { key: 'benefit', label: 'Benefit', kind: 'text' },
      { key: 'applicationUrl', label: 'Application URL', kind: 'url' }
    ]
  },
  {
    type: 'publication',
    label: 'Publications',
    description: 'Guides, reports, newsletters, and downloadable references.',
    workflowOwner: 'Content Publisher',
    template: 'document',
    fields: [
      {
        key: 'documentUrl',
        label: 'Document URL',
        kind: 'file',
        required: true
      },
      { key: 'publishedOn', label: 'Publication date', kind: 'date' }
    ]
  },
  {
    type: 'static_page',
    label: 'Static Pages',
    description: 'Managed public pages that need editorial ownership.',
    workflowOwner: 'Content Publisher',
    template: 'page',
    fields: [{ key: 'section', label: 'Section', kind: 'text' }]
  },
  {
    type: 'policy',
    label: 'Policies',
    description: 'Versioned legal, privacy, and governance pages.',
    workflowOwner: 'Platform Admin',
    template: 'policy',
    fields: [
      {
        key: 'effectiveDate',
        label: 'Effective date',
        kind: 'date',
        required: true
      },
      { key: 'revisionNote', label: 'Revision note', kind: 'text' }
    ]
  }
];

export const contentStatusLabels: Record<ContentStatus, string> = {
  draft: 'Draft',
  in_review: 'In review',
  published: 'Published',
  scheduled: 'Scheduled',
  archived: 'Archived'
};

export const contentItemInputSchema = z.object({
  type: contentTypeSchema,
  title: z.string().trim().min(2).max(280),
  slug: z.string().trim().max(320).optional(),
  summary: z.string().trim().max(1000).optional(),
  body: z.string().trim().max(50000).optional(),
  status: contentStatusSchema.optional(),
  heroImage: z.string().trim().max(1000).optional(),
  metadata: z.record(z.string()).optional(),
  seo: z
    .object({
      title: z.string().trim().max(280).optional(),
      description: z.string().trim().max(500).optional()
    })
    .optional(),
  scheduledFor: z.string().trim().optional()
});

export const aiSuggestionInputSchema = z.object({
  itemId: z.string().trim().optional(),
  kind: aiSuggestionKindSchema,
  input: z.string().trim().min(2).max(8000)
});

export const seedContentItems: ContentItem[] = [
  {
    id: 'event-ieec-faq',
    type: 'event',
    title:
      'Frequently Asked Questions About Intelligent Energy Efficiency Calculator',
    slug: 'intelligent-energy-efficiency-calculator-faq',
    summary:
      'A practical question-and-answer session on using intelligent calculators in Green Mark submissions.',
    body: 'This session explains common questions about the Intelligent Energy Efficiency Calculator, including inputs, evidence expectations, and Green Mark alignment.',
    status: 'published',
    metadata: {
      startsAt: '2026-06-18T09:30:00+08:00',
      venue: 'Online',
      registrationUrl: 'https://www.sleb.sg/Context/ContentDetails/46/23'
    },
    seo: {
      title: 'Intelligent Energy Efficiency Calculator FAQ',
      description:
        'Frequently asked questions for the SLEB Intelligent Energy Efficiency Calculator.'
    },
    authorName: 'Content Author',
    reviewerName: 'Content Publisher',
    createdAt: '2026-05-01T02:00:00.000Z',
    updatedAt: '2026-05-03T02:00:00.000Z',
    submittedAt: '2026-05-02T02:00:00.000Z',
    publishedAt: '2026-05-03T02:00:00.000Z'
  },
  {
    id: 'event-ibew-2021',
    type: 'event',
    title: 'IBEW 2021 Returns With Enhanced Digital Format in September',
    slug: 'ibew-2021-enhanced-digital-format',
    summary:
      'International Built Environment Week returns with digital programming for the built environment sector.',
    body: 'The event brings together policy, technology, and industry leaders to discuss progress in sustainable built environment practices.',
    status: 'published',
    metadata: {
      startsAt: '2026-09-03T10:00:00+08:00',
      venue: 'Hybrid'
    },
    seo: {},
    authorName: 'Content Author',
    reviewerName: 'Content Publisher',
    createdAt: '2026-04-24T02:00:00.000Z',
    updatedAt: '2026-04-26T02:00:00.000Z',
    publishedAt: '2026-04-26T02:00:00.000Z'
  },
  {
    id: 'event-pilot-calculator',
    type: 'event',
    title: 'Pilot Intelligent Energy Efficiency Calculator for Green Mark',
    slug: 'pilot-intelligent-energy-efficiency-calculator',
    summary:
      'A pilot programme introducing calculator-assisted evaluation for Green Mark project teams.',
    body: 'Participants will learn the calculator workflow, required evidence, and expected review boundaries for pilot use cases.',
    status: 'in_review',
    metadata: {
      startsAt: '2026-07-10T14:00:00+08:00',
      venue: 'BCA Academy'
    },
    seo: {},
    authorName: 'Content Author',
    createdAt: '2026-05-05T02:00:00.000Z',
    updatedAt: '2026-05-09T02:00:00.000Z',
    submittedAt: '2026-05-09T02:00:00.000Z'
  },
  {
    id: 'news-green-mark-sle',
    type: 'news',
    title: 'Green Mark Super Low Energy Solutions Package',
    slug: 'green-mark-super-low-energy-solutions-package',
    summary:
      'New package guidance helps project teams identify energy-saving solutions for Green Mark targets.',
    body: 'The package consolidates super low energy solution options, submission considerations, and references for project teams.',
    status: 'published',
    metadata: {
      topic: 'Green Mark'
    },
    seo: {},
    authorName: 'Content Author',
    reviewerName: 'Content Publisher',
    createdAt: '2026-04-18T02:00:00.000Z',
    updatedAt: '2026-04-19T02:00:00.000Z',
    publishedAt: '2026-04-19T02:00:00.000Z'
  },
  {
    id: 'news-green-mark-2021',
    type: 'news',
    title: 'BCA Green Mark 2021 is Refreshed',
    slug: 'bca-green-mark-2021-is-refreshed',
    summary:
      'Green Mark 2021 refresh highlights stronger sustainability outcomes and performance pathways.',
    body: 'The refreshed Green Mark framework encourages better energy performance, maintainability, and measurable outcomes.',
    status: 'published',
    metadata: {
      topic: 'Certification'
    },
    seo: {},
    authorName: 'Content Author',
    reviewerName: 'Content Publisher',
    createdAt: '2026-04-13T02:00:00.000Z',
    updatedAt: '2026-04-15T02:00:00.000Z',
    publishedAt: '2026-04-15T02:00:00.000Z'
  },
  {
    id: 'news-ieec-green-mark',
    type: 'news',
    title: 'Intelligent Energy Efficiency Calculator for Green Mark',
    slug: 'intelligent-energy-efficiency-calculator-for-green-mark',
    summary:
      'Calculator-assisted workflows support early evaluation of energy efficiency measures.',
    body: 'The Intelligent Energy Efficiency Calculator helps users explore measures, compare options, and prepare project decisions.',
    status: 'draft',
    metadata: {
      topic: 'Tools'
    },
    seo: {},
    authorName: 'Content Author',
    createdAt: '2026-05-07T02:00:00.000Z',
    updatedAt: '2026-05-07T02:00:00.000Z'
  },
  {
    id: 'grant-transnational-rd',
    type: 'grant',
    title:
      'Launch of Transnational R&D Challenge Call for Next-Generation Green Building Technologies',
    slug: 'transnational-rd-challenge-call-next-generation-green-building-technologies',
    summary:
      'A challenge call inviting proposals for next-generation green building technologies.',
    body: 'The call supports collaborative research and development projects that can accelerate adoption of advanced green building solutions.',
    status: 'published',
    metadata: {
      agency: 'BCA',
      eligibility: 'Research teams and industry consortia',
      deadline: '2026-08-31',
      applicationUrl: 'https://www.sleb.sg/Context/ContentDetails/8/20'
    },
    seo: {},
    authorName: 'Content Author',
    reviewerName: 'Content Publisher',
    createdAt: '2026-03-28T02:00:00.000Z',
    updatedAt: '2026-04-01T02:00:00.000Z',
    publishedAt: '2026-04-01T02:00:00.000Z'
  },
  {
    id: 'grant-joint-challenge-call',
    type: 'grant',
    title:
      '[Closed] Launch of the 3rd Joint Challenge Call by the Building and Construction Authority (BCA) and Enterprise Singapore (ESG)',
    slug: 'third-joint-challenge-call-bca-enterprise-singapore',
    summary:
      'A closed challenge call for solutions that improve building energy efficiency and sustainability.',
    body: 'The joint challenge call brought together BCA and Enterprise Singapore to support promising sustainable built environment solutions.',
    status: 'published',
    metadata: {
      agency: 'BCA / Enterprise Singapore',
      eligibility: 'Technology providers and industry partners',
      deadline: '2026-03-31'
    },
    seo: {},
    authorName: 'Content Author',
    reviewerName: 'Content Publisher',
    createdAt: '2026-02-10T02:00:00.000Z',
    updatedAt: '2026-02-18T02:00:00.000Z',
    publishedAt: '2026-02-18T02:00:00.000Z'
  }
];

export const seedTechnologyListings = [
  {
    id: 'tech-deep-energy-ai',
    title: 'Deep Energy AI',
    slug: 'deep-energy-ai',
    summary: 'AI-assisted optimisation for building energy performance.',
    href: '/technologies/deep-energy-ai'
  },
  {
    id: 'tech-chiller-plant-energy-optimization',
    title: 'Chiller Plant Energy Optimization',
    slug: 'chiller-plant-energy-optimization',
    summary: 'Controls and analytics for chiller plant performance.',
    href: '/technologies/chiller-plant-energy-optimization'
  },
  {
    id: 'tech-bapv',
    title: 'Building-attached Photovoltaic System (BaPV)',
    slug: 'building-attached-photovoltaic-system',
    summary: 'Photovoltaic system integration for building envelopes.',
    href: '/technologies/building-attached-photovoltaic-system'
  }
];
