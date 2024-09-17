import React, { useState } from 'react';
import { Typography, Grid, Box } from '@material-ui/core';
import {
    InfoCard,
    Header,
    Page,
    Content,
    ContentHeader,
} from '@backstage/core-components';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import { GetGrypeData } from '../../common/getGrypeData';
import { PaginatedTable } from '../PaginatedTable';

export function CurrentProductionDeploymentComponent() {
    const { result: grypeResult, loaded: grypeLoaded, error: grypeError } = GetGrypeData()
    
    const useStyles = makeStyles(theme => ({
        root: {
          width: '100%',
          '& > * + *': {
            marginTop: theme.spacing(2),
          },
        },
    }));

    const classes = useStyles();

    if (grypeError) {
        return (
          <InfoCard>
            <Typography align="center" variant="button">
              Error retrieving data from Github workflow artifact.
            </Typography>
          </InfoCard>
        );
    }

    if (!grypeLoaded) {
        return (
          <InfoCard className={classes.root}>
            <LinearProgress />
          </InfoCard>
        );
    }

    return (
        <div>
            <PaginatedTable grypeData={grypeResult} />
        </div>
    )
}
