// This was just a beginner project for me to learn API's. At the time of making this, I did not know any backend 
// frameworks/libraries/languages and storing confidential info in the front-end as seen here, is a risk. 
// But speaking with the people over @ the Bungie API discord, they assured that there is not much risk to exposing API keys, 
// etc. while using the Bungie API.  But I now understand it is better to hide all info here and place it
// on the backend and how to do so.

///////////////////////////
// Obtains code for access token using query parameters
///////////////////////////
const redirectUrl = window.location.href;
const urlParams = new URLSearchParams(new URL(redirectUrl).search);
const authorizationCode = urlParams.get('code');


///////////////////////////
// Puts code into a POST command in 
// order to exchange for access token
///////////////////////////
var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
myHeaders.append("Authorization", "dummy-code");
myHeaders.append("Cookie", "dummy-code");

///////////////////////////
// Gets access Token
///////////////////////////

var urlencoded = new URLSearchParams();
urlencoded.append("grant_type", "authorization_code");
urlencoded.append("code", authorizationCode);

export var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: urlencoded,
  redirect: 'follow'
};

/////////////////////////////////////
// Throw error if auth code doesn't exist
////////////////////////////////////
if(!authorizationCode){
  try{
    console.log('Authorization code does not exist');
    document.querySelector('.welcomeSign').innerText = "Authorization Failed. Please log in to continue\nhttps://destiny2scheduler.netlify.app";
  } catch (error) {
    console.log('Error:', error)
  }

}

/////////////////////////////////////
// Variable Declarations
////////////////////////////////////
export const apiKey = super_secret_api_key;
export let accessToken;
let refreshToken;


/////////////////////////////////////
// Checks if refreshToken is stored in
// local storage
////////////////////////////////////
const checkStoredRefreshToken = () => {
  const storedRefreshToken = sessionStorage.getItem('refreshToken');
  if (storedRefreshToken) {
    refreshToken = storedRefreshToken;
  }
};
checkStoredRefreshToken();


const pageAccessedByReload = (
  (window.performance.navigation && window.performance.navigation.type === 1) ||
    window.performance
      .getEntriesByType('navigation')
      .map((nav) => nav.type)
      .includes('reload')
);


/////////////////////////////////////
// Gets access&refresh tokens
////////////////////////////////////
const getToken = async () => {
  try {
    const responseToken = await fetch("https://www.bungie.net/Platform/App/OAuth/Token/", requestOptions);
    const resultToken = await responseToken.text();
    const responseObject = JSON.parse(resultToken);
    accessToken = responseObject.access_token;
    refreshToken = responseObject.refresh_token;
    if (responseToken.status === 400) {
      document.querySelector('.loading-container').classList.add("hidden");
      document.querySelector('.errorMsg').classList.remove("hidden");
      document.querySelector('.errorMsg').innerText = `Error 404 - Authorization Failed.`;
      setTimeout(() => {
        window.location.href = 'https://d2bo-login.netlify.app';
      }, 5000);
    } 
    sessionStorage.setItem('refreshToken', refreshToken);

    return accessToken;
  } catch (error) {
    console.log('Token fetch error', error);
    
  }
};


/////////////////////////////////////
// Gets refresh token from local storage
////////////////////////////////////

const getRefreshToken = async () => {
  try {
    const storedRefreshToken = sessionStorage.getItem('refreshToken');

    const responseRefresh = await fetch("https://www.bungie.net/Platform/App/OAuth/Token/", {
      method: 'POST',
      headers: myHeaders,
      body: `grant_type=refresh_token&refresh_token=${storedRefreshToken}`,
      redirect: 'follow'
    });
    if (responseRefresh.status === 400) {
      document.querySelector('.loading-container').classList.add("hidden");
      document.querySelector('.errorMsg').classList.remove("hidden");
      document.querySelector('.errorMsg').innerText = `Error 404 - Authorization Failed.`;
      setTimeout(() => {
        window.location.href = 'https://d2bo-login.netlify.app';
      }, 5000);
    } 
    
    const resultRefresh = await responseRefresh.text();
    const responseObject = JSON.parse(resultRefresh);
    accessToken = responseObject.access_token; 

    return accessToken;

  } catch (error) {
    console.log('Refresh token fetch error', error);
  }
};

/////////////////////////////////////
// Check if authorizationCode and refreshToken exist, 
// then show user they're authorized
////////////////////////////////////
if (authorizationCode || refreshToken) {
  
  const loadingContainer = document.querySelector(".loading-container");
  loadingContainer.classList.remove('hidden'); 
  const myElement = document.querySelector('.mainContainer');
  
  function showElement() {
    myElement.classList.remove('hidden');
  }
  setTimeout(showElement, 2500)

}


/////////////////////////////////////
// Check if authorizationCode and refreshToken exist, 
// then run.
////////////////////////////////////
if (!authorizationCode && sessionStorage.getItem("refreshToken" == undefined)) {
  try {
    document.querySelector('.loading-container').classList.add("hidden");
    document.querySelector('.errorMsg').classList.remove("hidden");
    document.querySelector('.errorMsg').innerText = `Error 404 - Authorization Failed.`;
    setTimeout(() => {
      window.location.href = 'https://d2bo-login.netlify.app';
    }, 5000);
  } catch (error) {
    console.log('Error:', error)
  }
} else if (authorizationCode && !pageAccessedByReload) {
  getToken()
} else if (refreshToken && pageAccessedByReload) {
  getRefreshToken()
}

//this works
document.querySelector('.signOutButton').addEventListener('click', () => {
  document.querySelector('#noBounty').innerText = '';
  document.querySelector('.title').classList.add('hidden');
  document.querySelector('.charButtons').classList.add('hidden');
  document.querySelector('.mainContainer').classList.add('hidden');
  document.querySelector('.usageGuide').classList.add('hidden');
  document.querySelector('.loading-container').classList.remove('hidden')



  document.querySelector('#link').innerText = 'Logging out...'
  sessionStorage.removeItem('refreshToken');
  setTimeout(() => {
    window.location.href = 'https://d2bo-login.netlify.app';
  }, 2000);
});





  



