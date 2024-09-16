import React from 'react';
import { Typography, Grid, Box } from '@material-ui/core';
import {
    InfoCard,
    Header,
    Page,
    Content,
    ContentHeader,
} from '@backstage/core-components';
import { GitRepoMainBranchComponent } from '../GitRepoMainBranchComponent/GitRepoMainBranchComponent';
import { CurrentProductionDeploymentComponent } from '../CurrentProductionDeploymentComponent/CurrentProductionDeploymentComponent';
import { SnykComponent } from '../SnykComponent';

export function SecurityFrontendComponent() {
    const title: string = "Security"

    return (
        <InfoCard title={title}>
            <Grid container rowSpacing={1} >
                <Grid item xs={6}>
                    <Typography>Git Repo (Main/Master Branch)</Typography>
                    <Box gap={2} p={2} sx={{ width: '100%', height: '480px' }} overflow="auto">
                        <GitRepoMainBranchComponent />
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Typography>Production Deployment (Current)</Typography>
                    <Box gap={4} p={2} sx={{ width: '100%', height: '480px' }} overflow="auto">
                        <CurrentProductionDeploymentComponent />
                    </Box>
                </Grid>
            </Grid>
            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                <Grid item xs={6}>
                    <Box gap={2} p={2} sx={{ width: '100%', height: '480px' }} overflow="auto">
                        <Typography>Snyk</Typography>
                        <SnykComponent />
                    </Box>
                </Grid>
            </Grid>
        </InfoCard>
    )
}
