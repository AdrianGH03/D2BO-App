import { membershipType, membershipId, userName, userPFP } from './getMemberShipTypeAndId.js';
import { apiKey, accessToken } from './scriptbounty.js';
import { bountyArray } from './getBountyArray.js';
import { bountyMap } from './bountyNames.js';

const requestOptions = {
  headers: {
    'X-API-Key': apiKey,
    'Authorization': `Bearer ${accessToken}`
  }
};


//////////////////////////////////////////
// Gets charIds, creates character buttons, sets styling,
// adds buttons to container, fills charItemInstance Array
//////////////////////////////////////////
const loadingContainer = document.querySelector(".loading-container");
const whichCharacter = async () => {
  try {

    const url = `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=200`;
    const response = await fetch(url, requestOptions);
    const data = await response.json();

    const characterData = data.Response.characters.data;

    let selectedButton = null;

    for (const [key, value] of Object.entries(characterData)) {
      const characterId = value.characterId;
      const classType = value.classType;
      let charClass = getCharacterClass(classType);
      setTimeout(() => {
        document.querySelector('.usageGuide').classList.remove('hidden');
        
      }, 1000)

      const buttonElement = createCharacterButton(charClass, value.emblemBackgroundPath);
      buttonElement.addEventListener("click", async () => {
        
        document.querySelector('.usageGuide').classList.add('hidden');
        loadingContainer.classList.remove('hidden');

        await handleCharacterSelection(buttonElement, characterId);

        loadingContainer.classList.add('hidden');
        
      });

      const charButtonsDiv = document.querySelector(".charButtons");
      charButtonsDiv.appendChild(buttonElement);

      characterItemInstanceArrays.push({ characterId, itemInstanceIds: [] });
    }

    loadingContainer.classList.add('hidden');
  } catch (error) {
    console.log("Error:", error);
  }
};

//////////////////////////////////////////
// Helper function: Get character class based on class type
//////////////////////////////////////////
const getCharacterClass = (classType) => {
  switch (classType) {
    case 0:
      return "Titan";
    case 1:
      return "Hunter";
    case 2:
      return "Warlock";
    default:
      return "";
  }
};

//////////////////////////////////////////
// Helper function: Create character button element
//////////////////////////////////////////
const createCharacterButton = (charClass, emblemBackgroundPath) => {
  document.querySelector('.charButtons').classList.remove('hidden');
  const buttonElement = document.createElement("button");
  buttonElement.textContent = charClass;
  buttonElement.classList.add("charButton");
  
  buttonElement.style.backgroundImage = `url(https://www.bungie.net${emblemBackgroundPath})`;
  document.querySelector('#titleLogo').src = "../Pictures/d2bologo.png"
  document.querySelector('.userName').innerText = userName;
  document.querySelector('.userPFP').src = `https://www.bungie.net${userPFP}`;
  document.querySelector('.container').classList.remove("hidden");

  //CSS ANIMATIONS BELOW
  buttonElement.classList.add("slide-right")
  document.querySelector('#titleLogo').classList.add("slide-right")
  document.querySelector('.userName').classList.add("slide-right")
  document.querySelector('.userPFP').classList.add("slide-right")
  document.querySelector('.container').classList.add("slide-left");

  return buttonElement;
};

//////////////////////////////////////////
// Helper function: Handle character selection
//////////////////////////////////////////
let selectedButton = null;
const handleCharacterSelection = async (buttonElement, characterId) => {
  if (selectedButton) { 
    selectedButton.classList.remove("selectedChar");
    const subCatElements = document.querySelectorAll('.subCat');
    subCatElements.forEach((subCatElement) => {
      subCatElement.classList.remove('hidden');
    });
  }
  buttonElement.classList.add("selectedChar"); 
  selectedButton = buttonElement;

  localStorage.setItem('charId', characterId); 

  
  resetBountyContainers();
  resetBountyCategories(); 


  hideMatchingBountiesMessage();
  
  loadingContainer.classList.remove('hidden'); 

  try {
    await getBounties(characterId);
    displayBountyCategories(); 
  } catch (error) {
    console.log("Error:", error);
  }

  loadingContainer.classList.remove('hidden'); 
  loadingContainer.classList.add('hidden'); 
  
};

//////////////////////////////////////////
// Helper Function: Hide "no bounties found" display
// text when no bounties found
//////////////////////////////////////////
const hideMatchingBountiesMessage = () => {
  const noBountiesElement = document.querySelector('#noBounty');

  if (noBountiesElement) {
    
    noBountiesElement.innerText = '';
    document.querySelector('.mainContainer').classList.remove('hidden');
  }
};

//////////////////////////////////////////
// Helper Function: Hide bounties on new character button click
//////////////////////////////////////////
const resetBountyContainers = () => {
  const containerElements = Object.values(bountyMap).map(({ class: classToRemove, selector }) => ({
    classToRemove,
    selector,
    container: document.querySelector(selector)
  }));
  
  containerElements.forEach(({ classToRemove, container }) => {
    container.classList.add('hidden');
    container.innerHTML = ''; 

    const correspondingClass = Object.values(bountyMap).find(({ class: classToAdd }) => classToAdd === classToRemove); 
    if (correspondingClass) {
      const { class: classToAdd } = correspondingClass; 
      document.querySelector(classToAdd).classList.add('hidden');
    }
  });

  const unlistedContainer = document.querySelector('.unlistedImg');
  unlistedContainer.innerHTML = '';

  const unlistedElement = document.querySelector('.unlisted');
  unlistedElement.classList.add('hidden');
};

//////////////////////////////////////////
// Helper function: Hide and display bounty categories on button clicks
//////////////////////////////////////////
const displayBountyCategories = () => {
  document.querySelector('.damtype').classList.remove('hidden');
  document.querySelector('.general').classList.remove('hidden');
  document.querySelector('.ability').classList.remove('hidden');
  document.querySelector('.misc').classList.remove('hidden');
  document.querySelector('.weapon').classList.remove('hidden');
  document.querySelector('.weapSub').classList.remove('hidden');
  const categoryElements = document.querySelectorAll('.category'); 
  categoryElements.forEach(element => {
    element.classList.add('slide-bottom');
    element.classList.add('catColumn')
  });
};
const resetBountyCategories  = () => {
  document.querySelector('.damtype').classList.add('hidden');
  document.querySelector('.general').classList.add('hidden');
  document.querySelector('.ability').classList.add('hidden');
  document.querySelector('.misc').classList.add('hidden');
  document.querySelector('.weapon').classList.add('hidden');
  document.querySelector('.weapSub').classList.add('hidden');
  const categoryElements = document.querySelectorAll('.category');
  categoryElements.forEach(element => {
    element.classList.remove('slide-bottom');
    element.classList.remove('catColumn')
  });
  
};

//////////////////////////////////////////
// Call to whichCharacter() so it runs program !Important
//////////////////////////////////////////
whichCharacter();

const characterItemInstanceArrays = []; 

//////////////////////////////////////////
// Creates Item Instance Id arrays using fetch call,
// then sends itemInstanceIds to find itemHashes
// then matches itemHashes with existing bountyArray
// to return active bounties
//////////////////////////////////////////
const getBounties = async (characterId) => {
  const characterUrl = `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/Character/${characterId}/?components=201`;

  try {
    const response = await fetch(characterUrl, requestOptions);
    const data = await response.json();

    const itemInstanceIds = getItemInstanceIds(data);
    updateCharacterItemInstanceArray(characterId, itemInstanceIds);

    const itemHashes = await fetchItemHashes(itemInstanceIds);
    const matchingBountyIndexes = findMatchingBounties(itemHashes);

    updateBountyContainers(matchingBountyIndexes);

    
    return Promise.resolve();
  } catch (error) {
    console.log("Error:", error);
    
    return Promise.reject(error);
  }
};

//////////////////////////////////////////
// Helper function: Get item instance IDs
//////////////////////////////////////////
const getItemInstanceIds = (data) => {
  return data.Response.inventory.data.items
    .map(item => item.itemInstanceId)
    .filter(item => item !== undefined);
};

//////////////////////////////////////////
// Helper function: Update character item instance array
//////////////////////////////////////////
const updateCharacterItemInstanceArray = (characterId, itemInstanceIds) => {
  characterItemInstanceArrays.find((character) => character.characterId === characterId).itemInstanceIds = itemInstanceIds;
};

//////////////////////////////////////////
// Helper function: Fetch item hashes
//////////////////////////////////////////
const fetchItemHashes = async (itemInstanceIds) => {
  const itemHashes = {};

  await Promise.all(itemInstanceIds.map(async (itemInstanceId) => {
    const { itemHash, progressToCompletion, completionValue } = await fetchItemHash(itemInstanceId);
    if (itemHash !== null) {
      const expirationDate = await fetchItemExpirationDate(itemInstanceId);
      if (!isExpired(expirationDate)) {
        itemHashes[itemHash] = { progressToCompletion, completionValue };
      }
    }
  }));
  return itemHashes;
};

const fetchItemHash = async (itemInstanceId) => {
  const itemUrl = `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/Item/${itemInstanceId}/?components=307,301`;

  try {
    const response = await fetch(itemUrl, requestOptions);
    const data = await response.json();
    const progressToCompletion = data.Response.objectives.data.objectives[0].progress;
    const completionValue = data.Response.objectives.data.objectives[0].completionValue;
    const itemHash = data.Response.item.data.itemHash;
    return { itemHash, progressToCompletion, completionValue };
  } catch (error) {
    return { itemHash: null, progressToCompletion: null, completionValue: null };
  }
};

//////////////////////////////////////////
// Helper function: Fetch item expiration date
//////////////////////////////////////////
const fetchItemExpirationDate = async (itemInstanceId) => {
  const itemUrl = `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/Item/${itemInstanceId}/?components=307`;

  try {
    const response = await fetch(itemUrl, requestOptions);
    const data = await response.json();

    const expirationDate = data.Response.item.data.expirationDate;
    return expirationDate;
  } catch (error) {
    console.log("Error:", error);
    return null;
  }
};

//////////////////////////////////////////
// Helper function: Check if item is expired
//////////////////////////////////////////
const isExpired = (expirationDate) => {
  const currentTimestamp = Date.now();
  const expirationTimestamp = new Date(expirationDate).getTime();

  return expirationTimestamp < currentTimestamp;
};

//////////////////////////////////////////
// Helper function: Find matching bounties
//////////////////////////////////////////
const findMatchingBounties = (itemHashes) => {
  const matchingBounties = bountyArray.filter((bounty) => itemHashes.hasOwnProperty(bounty.nestedKeyValues.hash));

  matchingBounties.forEach((matchingBounty) => {
    const itemHash = matchingBounty.nestedKeyValues.hash;
    if (itemHashes.hasOwnProperty(itemHash)) {
      const { progressToCompletion, completionValue } = itemHashes[itemHash];
      matchingBounty.nestedKeyValues.progressToCompletion = progressToCompletion;
      matchingBounty.nestedKeyValues.completionValue = completionValue;
    }
  });

  if (matchingBounties.length === 0) {
    const noBountiesElement = document.querySelector('#noBounty');
    noBountiesElement.innerText = 'No bounties found.';
    document.querySelector('.mainContainer').classList.add('hidden');
  }
  return matchingBounties;
};

//////////////////////////////////////////
// Helper function: Update bounty containers
//////////////////////////////////////////
const updateBountyContainers = (matchingBountyIndexes) => {
  const containerElements = Object.values(bountyMap).map(({ class: classToRemove, selector }) => ({
    classToRemove,
    selector,
    container: document.querySelector(selector)
  }));

  containerElements.forEach(({ classToRemove, container }) => {
    container.classList.add('hidden');
    container.innerHTML = '';

    const correspondingClass = Object.values(bountyMap).find(({ class: classToAdd }) => classToAdd === classToRemove);
    if (correspondingClass) {
      const { class: classToAdd } = correspondingClass;
      document.querySelector(classToAdd).classList.add('hidden');
    }
  });

  const unlistedContainer = document.querySelector('.unlistedImg');
  unlistedContainer.innerHTML = '';

  const unlistedElement = document.querySelector('.unlisted');
  unlistedElement.classList.add('hidden');

  

  matchingBountyIndexes.forEach((matchingBounty, index) => {
    const bountyIconUrl = `https://www.bungie.net${matchingBounty.nestedKeyValues.displayProperties.icon}`;
    const bountyDescription = matchingBounty.nestedKeyValues.displayProperties.description.toLowerCase();
    const bountyName = matchingBounty.nestedKeyValues.displayProperties.name;
    const bountyType = matchingBounty.nestedKeyValues.itemTypeDisplayName;
    const bountyQuote = matchingBounty.nestedKeyValues.displaySource;
    const bountyProgress = matchingBounty.nestedKeyValues.progressToCompletion;
    const bountyCompletion = matchingBounty.nestedKeyValues.completionValue;

    const bountyKeywords = Object.entries(bountyMap).filter(([desc, _]) => bountyDescription.includes(desc));

    if (bountyKeywords.length > 0) {
      bountyKeywords.forEach(([desc, { class: classToAdd, selector }]) => {
        document.querySelector(classToAdd).classList.remove('hidden');

        const bountyContainer = document.createElement('div');
        bountyContainer.classList.add('bountyContainer');

        // Create the progress bar
        const progressBar = document.createElement('div');
        progressBar.classList.add('progressBar');
        const progressFill = document.createElement('div');
        progressFill.classList.add('progressFill');
        const progressText = document.createElement('div');
        progressText.classList.add('progressText');
        
        progressFill.style.width = `${(bountyProgress / bountyCompletion) * 100}%`;
        progressBar.appendChild(progressFill);
        progressBar.appendChild(progressText);

        const indexNumber = document.createElement('span');
        indexNumber.classList.add('indexNumber');
        indexNumber.textContent = index + 1;

        const imgElement = document.createElement('img');
        imgElement.src = bountyIconUrl;
        imgElement.classList.add('tooltipIcon');

        imgElement.addEventListener('click', () => {
          const indexNumbers = document.querySelectorAll('.indexNumber');
          indexNumbers.forEach((indexNum) => {
            if (indexNum.textContent === indexNumber.textContent) {
              indexNum.classList.add('highlight');
              setTimeout(() => {
                indexNum.classList.remove('highlight');
              }, 2000);
            }
          });
        });

        bountyContainer.appendChild(indexNumber);
        bountyContainer.appendChild(imgElement);
        bountyContainer.appendChild(progressBar);

        const tooltipContent = document.createElement('div');
        tooltipContent.classList.add('tooltipContent');
        tooltipContent.innerHTML = `
          <div class="top">
            <h4>${bountyName}</h4>
            <span>${bountyType}</span>
          </div>
          <div class="bottom">
            <p>${bountyDescription}</p>
            <div class="progressBar">
              <div class="progressFill" style="width: ${(bountyProgress / bountyCompletion) * 100}%"></div>
              <div class="progressText">${bountyProgress}/${bountyCompletion}</div>
            </div>
          </div>
        `;

        const tooltipContainer = document.createElement('div');
        tooltipContainer.classList.add('tooltipContainer');
        tooltipContainer.appendChild(bountyContainer);
        tooltipContainer.appendChild(tooltipContent);

        document.querySelector(selector).appendChild(tooltipContainer);

        imgElement.addEventListener('mouseover', () => {
          tooltipContent.style.display = 'block';
        });

        imgElement.addEventListener('mouseout', () => {
          tooltipContent.style.display = 'none';
        });

      });
    } else {
      const unlistedContainer = document.querySelector('.unlistedImg');
      const unlistedElement = document.querySelector('.unlisted');
      unlistedElement.classList.remove('hidden');

      const unlistedIcon = document.createElement('img');
      unlistedIcon.src = bountyIconUrl;
      unlistedIcon.classList.add('tooltipIcon');

      const unlistedTooltipContent = document.createElement('div');
      unlistedTooltipContent.classList.add('tooltipContent');
      unlistedTooltipContent.innerHTML = `
        <div class="top">
          <h4>${bountyName}</h4>
          <span>${bountyType}</span>
        </div>
        <div class="bottom">
          <p>${bountyDescription}</p>
        </div>
      `;

      const unlistedTooltipContainer = document.createElement('div');
      unlistedTooltipContainer.classList.add('tooltipContainer');
      unlistedTooltipContainer.appendChild(unlistedIcon);
      unlistedTooltipContainer.appendChild(unlistedTooltipContent);

      const indexNumber = document.createElement('span');
      indexNumber.classList.add('indexNumber');
      indexNumber.textContent = index + 1;
      unlistedTooltipContainer.appendChild(indexNumber);
      unlistedContainer.appendChild(unlistedTooltipContainer);

      unlistedIcon.addEventListener('mouseover', () => {
        unlistedTooltipContent.style.display = 'block';
      });

      unlistedIcon.addEventListener('mouseout', () => {
        unlistedTooltipContent.style.display = 'none';
      });
    }
  });
  
  const subCatList = document.querySelectorAll('ul.subCat');

 
  subCatList.forEach((ul) => {
    
    const liList = ul.querySelectorAll('li');

 
    const allHidden = Array.from(liList).every((li) => {
      return li.classList.contains('hidden');
    });

    
    if (allHidden) {
      ul.classList.add('hidden');
    }
  });
};




