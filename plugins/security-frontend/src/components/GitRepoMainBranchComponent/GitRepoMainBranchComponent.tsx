import React from 'react';
import { Typography, Grid, Box } from '@material-ui/core';
import {
    InfoCard,
    Header,
    Page,
    Content,
    ContentHeader,
} from '@backstage/core-components';
import { PaginatedTable } from '../PaginatedTable';
import { GetGrypeData } from '../../common/getGrypeData';

export function GitRepoMainBranchComponent() {
    const { result: GrypeResult, loaded: grypeLoaded, error: grypeError } = GetGrypeData()

    console.log(GrypeResult)

    return (
        <div>
            <PaginatedTable />
        </div>
    )
}
