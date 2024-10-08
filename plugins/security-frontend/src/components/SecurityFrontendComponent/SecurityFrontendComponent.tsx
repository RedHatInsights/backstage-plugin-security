import React, { useState, useEffect } from 'react';
import { Typography, Grid, Box } from '@material-ui/core';
import {
    InfoCard,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { GitRepoMainBranchComponent } from '../GitRepoMainBranchComponent/GitRepoMainBranchComponent';
import { CurrentProductionDeploymentComponent } from '../CurrentProductionDeploymentComponent/CurrentProductionDeploymentComponent';
import QueryQontract from '../../common/queryQontract.ts';
import { NSQuery } from '../../common/query';

export const SecurityFrontendComponent = () => {
    const title: string = "Security"

    const [deployedHash, setDeployedHash] = useState<string>('');

    const { entity } = useEntity();

    const getEntityServiceName = () => {
        if (entity?.metadata?.annotations?.["github.com/project-slug"]) {
            return entity?.metadata?.annotations?.["github.com/project-slug"].split('/')[1];
        }

        return "";
    }

    const getProdDeployedHash = (qontractResult) => {
        const result = qontractResult.find((element) => element?.namespace?.path?.split('/')[5] === "prod.yml")

        return result?.ref
    };

    const getDeployedHash = (artifacts: any) => {
        const {
          result: qontractResult,
          loaded: qontractLoaded,
          error: qontractError,
        } = QueryQontract(NSQuery);

        const prodDeployedHash = getProdDeployedHash(qontractResult)

        return prodDeployedHash
    }

    const hash = getDeployedHash()

    useEffect(() => {
        setDeployedHash(hash)
    }, [hash]);
    

    const serviceName = getEntityServiceName()

    return (
        <InfoCard title={title}>
            <Grid item xs={12}>
                <Typography>Git Repo (Main/Master Branch)</Typography>
                <Box p={3} sx={{ width: '100%' }}>
                    <GitRepoMainBranchComponent service={serviceName} />
                </Box>
            </Grid>
                <Grid item xs={12}>
                <Typography>Production Deployment (Current)</Typography>
                <Box p={3} sx={{ width: '100%' }}>
                    <CurrentProductionDeploymentComponent service={serviceName} deployedHash={deployedHash} />
                </Box>
            </Grid>
        </InfoCard>
    )
}
