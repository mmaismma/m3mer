const clientSecretGetter = document.querySelector(".clientSecretGetter");
let userAccessToken;
let pageAccessToken;
let appId = 521539908714490;
let pageId = "m3mers";
let clientSecret;
const loader = document.querySelector(".loadIcon");
const imgLoader = document.querySelectorAll(".loadIcon")[1];
let json;
const title = document.querySelector(".title");
const author = document.querySelector(".author");
const image = document.querySelector(".image");
const votes = document.querySelector(".votes");
const gotoMemeBox = document.querySelector(".gotoMemeBox");

imgLoader.parentElement.style.display = "none";

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

// Get and show next meme or previous meme (on k- = 1)

let i = -1; // Is meme number

let meme = { hello: "developer" };
function nextMeme(k = -2) {
  k === -1 ? (i -= 1) : (i += 1);
  k >= 0 ? (i = k) : null;
  imgLoader.classList.contains("move")
    ? null
    : imgLoader.classList.toggle("move");
  imgLoader.parentElement.style.display = "";
  imgLoader.parentElement.style.opacity = 1;

  gotoMemeBox.value = i;
  meme = json["data"]["children"][i]["data"];
  image.setAttribute("src", meme["url"]);
  title.value = meme["title"];
  author.textContent = meme["author"];
}

// Position and size imgLoader to fit the current meme
function setLoader() {
  imgLoader.parentElement.style.height = image.offsetHeight;
  imgLoader.parentElement.style.width = image.offsetWidth;
  imgLoader.parentElement.style.top = image.offsetTop;
  imgLoader.parentElement.style.left = image.offsetLeft;
  imgLoader.classList.toggle("move");
  imgLoader.parentElement.style.opacity = 0;
  setTimeout(() => {
    imgLoader.parentElement.style.display = "none";
  }, 200);
}

// Get page access token
function getPageAccessToken() {
  console.log("mma");
  FB.api(
    "/" + pageId,
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
function login(e) {
  FB.login(
    function(response) {
      if (response.status === "connected") {
        console.log(response);
        userAccessToken = response.authResponse.accessToken;
        e.target.style.background = "#3fd100";
        e.target.style.transform = "scale(1.05)";
        setTimeout(() => {
          e.target.style.background = "";
          e.target.style.transform = "";
          e.target.disabled = false;
        }, 1000);
        getPageAccessToken();
      } else {
        console.log(response);
        e.target.style.background = "#db0f27";
        e.target.style.transform = "scale(0.95)";
        setTimeout(() => {
          e.target.style.background = "";
          e.target.style.transform = "";
          e.target.disabled = false;
        }, 1000);
      }
    },
    {
      scope: "pages_read_engagement,pages_manage_posts"
    }
  );
}

function submit(e) {
  e.target.disabled = true;
  e.target.style.backgroundImage =
    "repeating-linear-gradient(-60deg, #ddd, #ddd 15px, #eee 15px, #eee 29px)";
  e.target.classList.toggle("waiting");
  clientSecret = clientSecretGetter.value;
  login(e);
}

// Post meme
const postButton = document.querySelector(".postMeme");
function postMeme(e) {
  e.target.disabled = true;
  e.target.style.backgroundImage =
    "repeating-linear-gradient(-60deg, #222, #222 15px, #444 15px, #444 29px)";
  e.target.classList.toggle("waiting");
  FB.api(
    "/" + pageId + "/photos",
    "POST",
    {
      url: meme["url"],
      access_token: pageAccessToken,
      message: title.value
    },
    function(response) {
      console.log(response);
      e.target.classList.toggle("waiting");
      if (response.error || !meme["url"]) {
        e.target.style.background = "#db0f27";
        e.target.style.transform = "scale(0.95)";
        setTimeout(() => {
          e.target.style.background = "";
          e.target.style.transform = "";
          e.target.disabled = false;
        }, 1000);
      } else {
        e.target.style.background = "#3fd100";
        e.target.style.transform = "scale(1.05)";
        setTimeout(() => {
          e.target.style.background = "";
          e.target.style.transform = "";
          e.target.disabled = false;
        }, 1000);
      }
    }
  );
}

// Send an HTTP request to our source and retrieve 100 memes
const Http = new XMLHttpRequest();
window.onload = () => {
  Http.open("GET", "https://www.reddit.com/r/wholesomememes/hot.json?limit=100");
  Http.send();
  Http.onreadystatechange = async e => {
    json = await JSON.parse(Http.responseText);
    loader.classList.toggle("move");
    loader.parentElement.style.opacity = 0;
    loader.parentElement.style.pointerEvents = "none";
    setTimeout(() => {
      loader.parentElement.style.display = "none";
    }, 100);
    document.querySelector(".nextMeme").click();
  };
};
