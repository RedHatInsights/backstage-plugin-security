import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';

import { QueryGithubActionsRunsData } from './common/getGrypeGitRepoBranchData'

import health from './routes/health.router';
import grype from './routes/grype.router';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const backendUrl = config.getString('backend.baseUrl');
  logger.info('PONG!');
  logger.info(backendUrl)

  const router = Router();

  router.use(express.json());
  
  // router.use("/health", health)
  router.get('/health', (_, response) => {
    response.json({ status: 'ok' });
  });

  // router.use("/grype", grype)
  router.get('/grype', (req, response) => {
    response.json({ response: QueryGithubActionsRunsData(backendUrl) })
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
