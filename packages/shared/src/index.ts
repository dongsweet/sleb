import { z } from 'zod';

export const membershipLevelIds = [1, 2, 3] as const;

export const membershipLevelSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export type MembershipLevelId = z.infer<typeof membershipLevelSchema>;

export const membershipLevels = [
  {
    id: 1,
    name: 'Basic',
    displayPrice: 'S$0.00 / year',
    maxConnectedAccounts: 5,
    summary: 'Self-assessment tools and My Buildings.'
  },
  {
    id: 2,
    name: 'Standard',
    displayPrice: 'S$299 / year',
    maxConnectedAccounts: 5,
    summary: 'Basic plus downloadable SMEEA reports and My Services.'
  },
  {
    id: 3,
    name: 'Premium',
    displayPrice: 'S$499 / year',
    maxConnectedAccounts: 20,
    summary: 'Standard plus My Technology listings.'
  }
] as const;

export const membershipStatuses = {
  active: 0,
  applicationInReview: 1,
  approvedAwaitingPayment: 2,
  expired: 3,
  upgradeInReview: 4,
  upgradeApprovedAwaitingPayment: 5
} as const;

export type MembershipStatus = (typeof membershipStatuses)[keyof typeof membershipStatuses];

export const registrationStatuses = {
  pending: 0,
  approved: 1,
  rejected: 2
} as const;

export const membershipStatusDescriptions = [
  {
    status: -1,
    label: 'No membership',
    description: 'Logged-in user has no corporate membership association.'
  },
  {
    status: membershipStatuses.active,
    label: 'Active',
    description: 'Membership is valid and feature access follows the plan level.'
  },
  {
    status: membershipStatuses.applicationInReview,
    label: 'Application in review',
    description: 'Membership application is pending or rejected based on register status.'
  },
  {
    status: membershipStatuses.approvedAwaitingPayment,
    label: 'Approved awaiting payment',
    description: 'Application is approved, but membership is not active until payment completes.'
  },
  {
    status: membershipStatuses.expired,
    label: 'Expired',
    description: 'Membership is expired and requires renewal.'
  },
  {
    status: membershipStatuses.upgradeInReview,
    label: 'Upgrade in review',
    description: 'Current membership remains visible while an upgrade request is pending.'
  },
  {
    status: membershipStatuses.upgradeApprovedAwaitingPayment,
    label: 'Upgrade approved awaiting payment',
    description: 'Upgrade has been approved and awaits payment.'
  }
] as const;

export const memberFeatureMatrix = [
  {
    key: 'my-buildings',
    label: 'My Buildings',
    minimumLevel: 'Basic'
  },
  {
    key: 'beea',
    label: 'BEEA',
    minimumLevel: 'Basic'
  },
  {
    key: 'smeea',
    label: 'SMEEA self-assessment',
    minimumLevel: 'Basic'
  },
  {
    key: 'ai-calculator',
    label: 'AI Calculator',
    minimumLevel: 'Basic'
  },
  {
    key: 'my-services',
    label: 'My Services',
    minimumLevel: 'Standard'
  },
  {
    key: 'smeea-report-download',
    label: 'SMEEA report download',
    minimumLevel: 'Standard'
  },
  {
    key: 'my-technologies',
    label: 'My Technology',
    minimumLevel: 'Premium'
  }
] as const;

export const directoryTypes = ['building', 'technology', 'service', 'term', 'project'] as const;

export type DirectoryType = (typeof directoryTypes)[number];

export const auditActionSchema = z.enum([
  'created',
  'updated',
  'submitted',
  'approved',
  'rejected',
  'published',
  'unpublished',
  'deleted'
]);

export type AuditAction = z.infer<typeof auditActionSchema>;
