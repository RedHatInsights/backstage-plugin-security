import express from 'express';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import axios from 'axios';
// import yauzl from 'yauzl';

const grype = express.Router();

// Get Backstage objects
const config = useApi(configApiRef);
const backendUrl = config.getString('backend.baseUrl');

grype.get('/', async (req, response) => {
    async function downloadAndExtractFile(url: any, fileNameToExtract: any) {
        try {
          // Download the ZIP file into memory
          const response = await axios({
            method: 'get',
            url: url,
            responseType: 'arraybuffer'
          });
      
          const buffer = Buffer.from(response.data);
        } catch (error) {
          console.error('Error downloading or extracting file:', error);
        }
      }
      
      // Example usage:
      const zipUrl = `${backendUrl}/api/proxy/grype/repos/RedHatInsights/clowder/actions/artifacts`;
      const fileName = 'output.zip';
      downloadAndExtractFile(zipUrl, fileName);

    response.json({ status: 'ok' });
});

export default grype;
