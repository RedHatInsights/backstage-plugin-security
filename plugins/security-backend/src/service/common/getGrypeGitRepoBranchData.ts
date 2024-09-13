import react, { useState, useEffect } from 'react';

import axios from 'axios';
import yauzl from 'yauzl';

export const QueryGithubActionsRunsData = async (backendUrl: string) => {

    // Backstage's proxy does not support redirect urls, therefore we are 
    // manually implementing the redirect
    const url = `${backendUrl}/api/proxy/actions/repos/RedHatInsights/clowder/actions/artifacts/1887237108/zip`;
    let location: string = "";
    let fileData = '';

    const headers = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    }

    await fetch(url, { method: "get", redirect: "manual",  headers: headers})
      .then(response => {
        location = JSON.stringify(response.headers.get("location"));
      })
      .catch((_error) => {
          console.error(`Error fetching location header information`);
      })

    console.log(location)

    // Download the ZIP file into memory
    const response = await axios({
      method: 'get',
      url: location.slice(1, -1),
      responseType: 'arraybuffer'
    });

    const buffer = Buffer.from(response.data);
    
    return new Promise<string>((resolve, reject) => {
      // Open the ZIP file from memory
      yauzl.fromBuffer(buffer, { lazyEntries: true }, (err: any, zipFile: any) => {
        if (err) reject(err);

        zipFile.readEntry();

        zipFile.on('entry', (entry: any) => {
            // Found the file we want to extract
            zipFile.openReadStream(entry, (error: any, readStream: any) => {
              if (error) throw err;

              // Process the extracted file here
              readStream.on('data', (chunk: any) => {
                fileData += chunk;
              });

              readStream.on('end', () => {
                resolve(fileData)
              //   // console.log(`Extracted file content: ${fileData}`);
              //   // zipFile.close();
              });
            });
        });
      })
    })

    // myPromise.then((res) => {
    //   console.log(res)
    //   fileData = res
    // })

    // return fileData
}
