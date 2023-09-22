
const axios = require('axios');

const githubToken = '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'; 
const organizationName = "mksvkdevops"
const keepOnlyLatestVersions = 0

const headers = {
  Authorization: `Bearer ${githubToken}`,
  Accept: 'application/vnd.github.v3+json',
};



async function getAllPaginationPackages() {
  const allPackages = [];
  let nextPage = `https://api.github.com/orgs/${organizationName}/packages?package_type=npm`;

  while (nextPage) {
    try {
      const response = await axios.get(nextPage , {headers});
      const packages = response.data;
      allPackages.push(...packages);

      // Check if there is a "next" page in the Link header
      const linkHeader = response.headers.link;
      if (linkHeader) {
        const nextPageMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
        if (nextPageMatch) {
          nextPage = nextPageMatch[1];
        } else {
          nextPage = null; // No more pages
        }
      } else {
        nextPage = null; // No more pages
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      break;
    }
  }

  return allPackages;
}


async function getAllPaginationVersions(listVersionsUrl) {
  const allVersions = [];
  let nextPage = listVersionsUrl;

  while (nextPage) {
    try {
      const response = await axios.get(nextPage , {headers});
      const versions = response.data;
      allVersions.push(...versions);

      // Check if there is a "next" page in the Link header
      const linkHeader = response.headers.link;
      if (linkHeader) {
        const nextPageMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
        if (nextPageMatch) {
          nextPage = nextPageMatch[1];
        } else {
          nextPage = null; // No more pages
        }
      } else {
        nextPage = null; // No more pages
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      break;
    }
  }

  return allVersions;
}

function separateAndKeepLatestVersions(versions) {
  const versionCategories = {};

  versions.forEach((version) => {
    const labelsMatch = version.name.match(/-(\w+)/);
    if (labelsMatch) {
      const label = labelsMatch[1];
      if (!versionCategories[label]) {
        versionCategories[label] = [];
      }
      versionCategories[label].push(version);
    }
  });

  return versionCategories;
}



async function deleteVersionsExceptLatestThree(categorizedVersions,x) {
  try {
    for (const category in categorizedVersions) {
      const versions = categorizedVersions[category];

      versions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Keep only the latest 3 versions
      const versionsToDelete = versions.slice(keepOnlyLatestVersions);
      console.log(x)

      for (const versions of versionsToDelete){
        console.log(versions.name)
      }
      
      // for (const version of versionsToDelete) {
      //   const deleteUrl = version.url; // Use the URL to delete the version
      //   const response = await axios.delete(deleteUrl, { headers });

      //   if (response.status === 204) {
      //     console.log(`IN PACKAGE : ${x}`)
      //     console.log(`Deleted version: ${version.name} in category: ${category}`);
      //   } else {
      //     console.error(`Failed to delete version: ${version.name} in category: ${category}`);
      //   }
      // }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}


async function listAndDeletePackageVersions(x) {
  let versions; // Declare the variable here
  const packageType = 'npm'; 
  const packageName = x ; 
  const listVersionsUrl = `https://api.github.com/orgs/mksvkdevops/packages/${packageType}/${packageName}/versions`;
  try {
    
      getAllPaginationVersions(listVersionsUrl).then((versions)=>{
      
        const categorizedVersions = separateAndKeepLatestVersions(versions);
        deleteVersionsExceptLatestThree(categorizedVersions,x);

      })
     
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}


async function listPackages() {
  try {

  getAllPaginationPackages()
  .then((packages) => {
    packages.forEach((pkg) => {
        
      console.log(`Package Name: ${pkg.name}`);
      console.log(`Package Type: ${pkg.package_type}`);
      console.log(`Visibility: ${pkg.visibility}`);
      console.log(`URL: ${pkg.html_url}`);
      console.log('---');
      const x =  pkg.name
      listAndDeletePackageVersions(x)
  
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });
  

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Call the function to list packages
listPackages();

