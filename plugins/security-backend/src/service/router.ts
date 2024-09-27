// import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';

import { QueryGithubActionsRunsData } from './common/getGrypeGitRepoBranchData'

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

  // const middleware = MiddlewareFactory.create({ logger, config });

  // router.use(middleware.error());

  // TODO: move these routes to separate router files
  router.get('/health', (_, response) => {
    response.json({ status: 'ok' });
  });

  router.get('/grype/main', (req, res) => {
    const serviceName = req.query.service;
    const deployedHash = req.query.deployedHash;
    
    return QueryGithubActionsRunsData(backendUrl, serviceName, deployedHash)
      .then((data) => {
        res.status(200).send(JSON.stringify(data))
      })
  });

  router.get('/grype/deployed', (req, res) => {
    const serviceName = req.query.service;
    const deployedHash = req.query.deployedHash;

    console.log("QUERYDATA: ", req.query)
    console.log("SERVICENAME: ", serviceName);
    console.log("DEPLOYEDHASH: ", deployedHash);
    
    return QueryGithubActionsRunsData(backendUrl, serviceName, deployedHash)
      .then((data) => {
        res.status(200).send(JSON.stringify(data))
      })
  });

  return router;
}
