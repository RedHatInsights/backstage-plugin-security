import React, { useState } from 'react';
import { Typography, Grid, Box } from '@material-ui/core';
import {
    InfoCard,
    Header,
    Page,
    Content,
    ContentHeader,
} from '@backstage/core-components';
import { GetGrypeData } from '../../common/getGrypeData';
import { PaginatedTable } from '../PaginatedTable';

export function CurrentProductionDeploymentComponent() {
    const { result: grypeResult, loaded: grypeLoaded, error: grypeError } = GetGrypeData()
    
    console.log(grypeResult)
    
    return (
        <div>
            <PaginatedTable grypeData={grypeResult} />
        </div>
    )
}
