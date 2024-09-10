import React from 'react';
import { Typography, Grid, Box } from '@material-ui/core';
import {
    InfoCard,
    Header,
    Page,
    Content,
    ContentHeader,
} from '@backstage/core-components';
import { getSnykData } from '../../common/getSnykdata';

export function SnykComponent() {
    const { result: grypeResult, loaded: grypeLoaded, error: grypeError } = getSnykData();

    return (
        <InfoCard>
            test
        </InfoCard>
    )
}
