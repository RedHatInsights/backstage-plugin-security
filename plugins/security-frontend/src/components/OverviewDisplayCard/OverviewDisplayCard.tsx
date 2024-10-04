import * as React from 'react';
import { Typography, Grid } from '@material-ui/core';
import {
    InfoCard,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

export const OverviewDisplayCard = () => {
    const { entity } = useEntity();

    const getEntityServiceName = () => {
        if (entity?.metadata?.annotations?.["github.com/project-slug"]) {
            return entity?.metadata?.annotations?.["github.com/project-slug"].split('/')[1];
        }

        return "";
    }

    const serviceName = getEntityServiceName();

    return (
        <InfoCard>
            <Grid container>
                <Grid item xs={3}>
                    <Typography alignItems="center">Github Repo</Typography>
                    <Typography alignItems="center">(Main Branch)</Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography alignItems="center">Prod Deployment</Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography alignItems="center">Snyk (SAST) Detection</Typography>
                </Grid>
            </Grid>
        </InfoCard>
    )
}