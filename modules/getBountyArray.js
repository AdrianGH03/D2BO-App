
import { apiKey } from './scriptbounty.js';

const url = 'https://www.bungie.net/Platform/Destiny2/Manifest/';

const requestOptions = {
  headers: {
    'X-API-Key': apiKey
  }
};


/////////////////////////////////////
// Finds bounties, and creates image
// with their respective icon
////////////////////////////////////
export let bountyArray = [];

const getBountyArray = async () => {
  try {
    fetch(url, requestOptions)
      .then(response => response.json())
      .then(data => {
        const inventoryItemDefUrl = `https://www.bungie.net${data.Response.jsonWorldComponentContentPaths.en.DestinyInventoryItemDefinition}`;

        
        fetch(inventoryItemDefUrl)
          .then(response => response.json())
          .then(itemData => {
            

            /////////////////////////////////////
            // Gets bounties (they are items of type 26)
            ////////////////////////////////////
            const keysWithItemType26 = Object.keys(itemData).filter(key => itemData[key].itemType === 26);

        
            const keysWithNestedKeys = keysWithItemType26.map(key => {
              const nestedKeys = Object.keys(itemData[key]);
              const nestedKeyValues = nestedKeys.reduce((result, nestedKey) => {
                result[nestedKey] = itemData[key][nestedKey];
                return result;
              }, {});
              return { key, nestedKeyValues };
            });

            bountyArray.push(...keysWithNestedKeys);

          })
          .catch(error => {
            console.log('Error fetching item data:', error);
          });
      })
      .catch(error => {
        console.log('Error:', error);
        
      });
  } catch (error) {
    console.log('User fetch error', error);
  }
}


await getBountyArray();
const bountyArrayWait = async () => {
  while (bountyArray == []) {
    await new Promise(resolve => setTimeout(resolve, 100)); 
  }
};

await bountyArrayWait(); 
