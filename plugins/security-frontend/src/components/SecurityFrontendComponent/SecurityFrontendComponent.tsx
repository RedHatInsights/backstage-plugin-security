import React, { useState, useEffect } from 'react';
import { Typography, Grid, Box } from '@material-ui/core';
import {
    InfoCard,
    Header,
    Page,
    Content,
    ContentHeader,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { GitRepoMainBranchComponent } from '../GitRepoMainBranchComponent/GitRepoMainBranchComponent';
import { CurrentProductionDeploymentComponent } from '../CurrentProductionDeploymentComponent/CurrentProductionDeploymentComponent';
import { SnykComponent } from '../SnykComponent';
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
        console.log("getProdDeployedHash: ", result?.ref)

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
    console.log("entity name", serviceName)

    return (
        <InfoCard title={title}>
            <Grid container>
                <Grid container>
                    <Typography>Git Repo (Main/Master Branch)</Typography>
                    <Box gap={4} p={3} sx={{ width: '100%' }} overflow="auto">
                        <GitRepoMainBranchComponent service={serviceName} />
                    </Box>
                    <Typography>Production Deployment (Current)</Typography>
                    <Box gap={4} p={3} sx={{ width: '100%' }} overflow="auto">
                        <CurrentProductionDeploymentComponent service={serviceName} deployedHash={deployedHash} />
                    </Box>
                </Grid>
                {/* <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item xs={6}>
                        <Box gap={2} p={2} sx={{ width: '100%', height: '480px' }} overflow="auto">
                            <Typography>Snyk</Typography>
                            <SnykComponent />
                        </Box>
                    </Grid>
                </Grid> */}
            </Grid>
        </InfoCard>
    )
}
