import type { FastifyInstance } from 'fastify';
import {
  membershipLevels,
  membershipStatusDescriptions,
  memberFeatureMatrix
} from '@sleb/shared';

export async function registerMembershipRoutes(app: FastifyInstance) {
  app.get('/membership/plans', async () => ({
    plans: membershipLevels,
    featureMatrix: memberFeatureMatrix
  }));

  app.get('/membership/statuses', async () => ({
    statuses: membershipStatusDescriptions
  }));
}
