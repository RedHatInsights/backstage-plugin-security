import React from 'react';
import { Typography } from '@material-ui/core';
import {
    InfoCard,
} from '@backstage/core-components';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import { GetGrypeDataDeployed } from '../../common/getGrypeDataDeployed';
import { PaginatedTable } from '../PaginatedTable';

export const CurrentProductionDeploymentComponent = (data: Object) => {
    const { result: grypeResult, loaded: grypeLoaded, error: grypeError } = GetGrypeDataDeployed(data)

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
