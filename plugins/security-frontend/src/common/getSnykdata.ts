import { useState, useEffect } from 'react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';

export const getSnykData = () => {
    const [result, setResult] = useState<any>({});
    const [loaded, setLoaded] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [projectId, setProjectId] = useState<string>("");

    // Get Backstage objects
    const config = useApi(configApiRef);
    const backendUrl = config.getString('backend.baseUrl');

    // const { result: grypeResult, loaded: grypeLoaded, error: grypeError } = QueryGithubActionsRunsData();

    const getProjectId = (data: Array<String>) => {
        data.map((projTarget) => {
            if (projTarget?.attributes?.display_name === "insights-platform/malware-detection-backend") {
                console.log(projTarget?.id)
                return projTarget?.id
            }

            return ""
        })
    }

    const getGrypeRepoData = async () => {
        const requestOptions = {
            version: "2024-08-25",
            limit: 100,
        };

        // Find project ID
        await fetch(`${backendUrl}/api/proxy/snyk/rest/orgs/${ORG_ID}/targets?version=2024-08-25&limit=100`, requestOptions)
            .then(response => response.json())
            .then(response => {
                const projId = setProjectId(getProjectId(response.data))

                console.log(response)
            })
            .catch((_error) => {
                setError(true)
                console.error(`Error fetching Snyk project target data: ${_error}`);
            })
    }

    useEffect(() => {
        getGrypeRepoData()
    }, []);

    return { result, loaded, error }
}
