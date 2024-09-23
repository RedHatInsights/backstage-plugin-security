import react, { useState, useEffect } from 'react';

import axios from 'axios';
import yauzl from 'yauzl';

export const QueryGithubActionsRunsData = async (backendUrl: string, serviceName: string, deployedHash: string) => {
    const artifactUrl = `${backendUrl}/api/proxy/actions/repos/RedHatInsights/${serviceName}/actions/artifacts`;
    let location: string = "";
    let artifactJobId: number = 0;
    let fileData = '';

    const headers = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    }

    console.log("DEPLOYEDHASH WORK PLEASE: ", deployedHash)

    const getMainBranchJob = (artifacts: any) => {
      for (let i = 0; i < artifacts.length; i++) {
        const headBranch = artifacts[i].workflow_run.head_branch;
        
        if (headBranch === "main" || headBranch === "master") {
          return artifacts[i].id;
        }
      };

      return {}
    }

    const getDeployedJob = (artifacts: any) => {
      for (let i = 0; i < artifacts.length; i++) {
        const headSha = artifacts[i].workflow_run.head_sha;
        
        if (headSha === deployedHash) {
          return artifacts[i].id;
        }
      };

      return {}
    }

    await fetch(`${artifactUrl}?per_page=100`, { method: "get", redirect: "manual",  headers: headers})
      .then(response => response.json())
      .then(response => {
        console.log(response.artifacts[0].workflow_run.head_sha);
        console.log(response.artifacts[0].workflow_run.head_branch);

        console.log("LINE 49: ", deployedHash)
        if (deployedHash) {
          artifactJobId = getDeployedJob(response.artifacts)
        } else {
          artifactJobId = getMainBranchJob(response.artifacts);
        }
        
        console.log("RESPONSE: ", response.artifacts.length)
        console.log("LINE 36: ", artifactJobId);
      })
      .catch((_error) => {
          console.error(`Error fetching list of artifacts: `, _error);
      })

    // Backstage's proxy does not support redirect urls, therefore we are 
    // manually implementing the redirect
    await fetch(`${artifactUrl}/${artifactJobId}/zip`, { method: "get", redirect: "manual",  headers: headers})
      .then(response => {
        location = JSON.stringify(response.headers.get("location"));
      })
      .catch((_error) => {
          console.error(`Error fetching location header information: `, _error);
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
                resolve(JSON.parse(fileData))
              });
            });
        });
      })
    })
}
