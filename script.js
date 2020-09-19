const clientSecretGetter = document.querySelector('.clientSecretGetter');
let userAccessToken;
let pageAccessToken;
let appId = 521539908714490;
let pageId = 'm3mers';
let clientSecret;
const loader = document.querySelector('.loadIcon')
const imgLoader = document.querySelectorAll('.loadIcon')[1]
let json;
const title = document.querySelector(".title");
const author = document.querySelector(".author");
const image = document.querySelector(".image");
const votes = document.querySelector(".votes");
const gotoMemeBox = document.querySelector(".gotoMemeBox");
let memeURL;
let memeMessage;

imgLoader.parentElement.style.display = 'none'

function submit() {
  clientSecret = clientSecretGetter.value;
  login();
}

// Send an HTTP request to our source and retrieve 100 memes
const Http = new XMLHttpRequest();
Http.open('GET', "https://www.reddit.com/r/memes/hot.json?limit=100")
Http.send()
Http.onreadystatechange = async (e) => {
  json = await JSON.parse(Http.responseText);
  loader.classList.toggle('move');
  loader.parentElement.style.opacity = 0;
  loader.parentElement.style.pointerEvents = 'none';
  setTimeout(loader.parentElement.style.display = 'none', 100)
}

// Integrating Facebook API
window.fbAsyncInit = function() {
  FB.init({
    appId: appId,
    xfbml: true,
    version: "v8.0"
  });
  FB.AppEvents.logPageView();
};

(function(d, s, id) {
  var js,
    fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s);
  js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
})(document, "script", "facebook-jssdk");

// Test function, TODO: Remove it
function run() {
  FB.api(
    '/' + pageId + '/feed',
    "POST",
    {
      message: "/(0o0)/!",
      access_token: pageAccessToken
    },
    function(response) {
      console.log(response);
    }
  );
}

// A function that could be used to get a long user access token. TODO: Remove it
function getLongUserToken() {
  FB.api(
    "/oauth/access_token",
    "GET",
    {
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: clientSecret,
      fb_exchange_token: userAccessToken
    },
    function(response) {
      console.log(response);
    }
  );
}

// Get page access token
function getPageAccessToken() {
  console.log('mma')
  FB.api(
    '/' + pageId,
    "GET",
    {
      fields: "access_token",
      access_token: userAccessToken
    },
    function(response) {
      console.log(response);
      pageAccessToken = response.access_token;
    }
  );
}

// Login user and get user access token
function login() {
  FB.login(
    function(response) {
      if (response.status === "connected") {
        console.log(response);
        userAccessToken = response.authResponse.accessToken;
        getPageAccessToken();
      } else {
        console.log(response);
      }
    },
    {
      scope: "pages_read_engagement,pages_manage_posts"
    }
  );
}

let i = -1; // Is meme number

// Get and show next meme or previous meme (on k- = 1)
function nextMeme(k=-2) {
  k === -1 ? (i -= 1) : (i += 1);
  k >= 0 ? (i = k) : (null)
  imgLoader.classList.contains('move') ? null : imgLoader.classList.toggle('move')
  imgLoader.parentElement.style.display = '';
  imgLoader.parentElement.style.opacity = 1;
  
  gotoMemeBox.value = i;
  let meme = json["data"]["children"][i]["data"];
  image.setAttribute("src", meme["url"]);
  title.value = meme["title"];
  author.textContent = meme["author"];
  memeURL = meme["url"];
}

// Position and size imgLoader to fit the current meme
function setLoader() {
  imgLoader.parentElement.style.height = image.offsetHeight;
  imgLoader.parentElement.style.width = image.offsetWidth;
  imgLoader.parentElement.style.top = image.offsetTop;
  imgLoader.parentElement.style.left = image.offsetLeft;
  imgLoader.classList.toggle('move')
  imgLoader.parentElement.style.opacity = 0;
  setTimeout(imgLoader.parentElement.style.display = 'none', 200)
  
}

// Post meme
function postMeme() {
  FB.api(
    "/" + pageId + "/photos",
    "POST",
    {
      url: memeURL,
      access_token: pageAccessToken,
      message: title.value
    },
    function(response) {
      console.log(response);
    }
  );
}
