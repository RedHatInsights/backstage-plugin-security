import { useState, useEffect } from 'react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';

export const GetGrypeData = (service: string) => {
    const [result, setResult] = useState<any>({});
    const [loaded, setLoaded] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [projectId, setProjectId] = useState<string>("");

    // Get Backstage objects
    const config = useApi(configApiRef);
    const backendUrl = config.getString('backend.baseUrl');

    const getGrypeRepoData = async () => {
        // get grype data from the security plugin's backend
        await fetch(`${backendUrl}/api/security/grype?service=${service.service}`)
            .then(response => response.json())
            .then(response => {
                console.log(response)
                setResult(response)
                setLoaded(true)
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
