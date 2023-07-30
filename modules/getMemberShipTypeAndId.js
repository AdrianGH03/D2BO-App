import { apiKey, accessToken } from './scriptbounty.js';

/////////////////////////////////////
// Gets the user's Membership Type 
// and Membership Id
////////////////////////////////////
export let membershipType = '';
export let membershipId = '';
export let userName = '';
export let userPFP = '';


const getUserData = async () => {
    try {
      while (!accessToken) {
          await new Promise(resolve => setTimeout(resolve, 100)); 
        }
      const responseUser = await fetch('https://www.bungie.net/Platform/User/GetMembershipsForCurrentUser/', {
        headers: {
          'X-API-Key': apiKey,
          'Authorization': `Bearer ${accessToken}`
        }
      });
  
      const data = await responseUser.json();
      
      userName = data.Response.bungieNetUser.uniqueName;
      userPFP = data.Response.bungieNetUser.profilePicturePath;
      membershipType = data.Response.destinyMemberships[0].membershipType;
      membershipId = data.Response.destinyMemberships[0].membershipId;
      
    } catch (error) {
      console.log('User fetch error', error);
    }
  };

await getUserData(); 


const waitForUserData = async () => {
    while (membershipType === '' && membershipId === '') {
      await new Promise(resolve => setTimeout(resolve, 100)); 
    }
};
await waitForUserData();
