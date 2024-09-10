import { useState, useEffect } from 'react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';

export const GetGrypeData = () => {
    const [result, setResult] = useState<any>({});
    const [loaded, setLoaded] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [projectId, setProjectId] = useState<string>("");

    // Get Backstage objects
    const config = useApi(configApiRef);
    const backendUrl = config.getString('backend.baseUrl');

    const getGrypeRepoData = async () => {
        const requestOptions = {
            version: "2024-08-25",
            limit: 100,
        };

        // Find project ID
        await fetch(`${backendUrl}/api/security/grype`)
            .then(response => {
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

    console.log(result)

    return { result, loaded, error }
}
