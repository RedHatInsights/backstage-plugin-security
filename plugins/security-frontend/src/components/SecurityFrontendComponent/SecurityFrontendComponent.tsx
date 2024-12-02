import React, { useState, useEffect } from 'react';
import { Box, Grid, Tab, Tabs, Typography } from '@material-ui/core';
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

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

export const SecurityFrontendComponent = () => {
    const title: string = "Security Dashboard"

    const [deployedHash, setDeployedHash] = useState<string>('');
    const [value, setValue] = React.useState(0);

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

    const CustomTabPanel = (props: TabPanelProps) => {
        const { children, value, index, ...other } = props;
    
        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
            </div>
        );
    }

    function a11yProps(index: number) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const DisplayGrypeData = () => {
        return (
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
            </Grid>
        )
    }

    const DisplaySnykData = () => {
        return (
            <div>
                <Typography>COMING SOON!</Typography>
                <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Box gap={2} p={2} sx={{ width: '100%', height: '480px' }} overflow="auto">
                        <Typography>Snyk</Typography>
                        <SnykComponent />
                    </Box>
                </Grid>
            </div>
        )
    }

    useEffect(() => {
        setDeployedHash(hash)
    }, [hash]);
    

    const serviceName = getEntityServiceName()
    console.log("entity name", serviceName)

    return (
        <InfoCard title={title}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="security tabs">
                    <Tab label="Grype" {...a11yProps(0)} />
                    <Tab label="Snyk" {...a11yProps(1)} />
                </Tabs>
                </Box>
                <CustomTabPanel value={value} index={0}>
                    <DisplayGrypeData />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    <DisplaySnykData />
                </CustomTabPanel>
            <Box />
        </InfoCard>
    )
}
