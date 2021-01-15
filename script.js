let userAccessToken;
let pageAccessToken;
const appId = 521539908714490;
const pageId = "m3mers";
let clientSecret;
const clientSecretGetter = document.getElementById('client-secret-getter')

const elId = function (el) {
    return document.getElementById(el)
};

const prevPic = elId('prev-pic');
const nextPic = elId('next-pic');
const memePoster = elId('post-meme');
const setter = elId('settings-toggler');
const controls = elId('controls');

const pic = elId('pic');
const picTitle = elId('pic-title');
const settings = elId('settings');
const modeSelector = elId('mode-selector');

let picData = [];
let picNum = -1;
let scoutMode = localStorage.getItem('m3-scoutMode') === null ? "memes" : localStorage.getItem('m3-scoutMode');
modeSelector.value = scoutMode;
let httpRequest = new XMLHttpRequest();

function changePic(diff) {
    picNum += diff;

    if (picNum === 0) {
        prevPic.disabled = true;
    } else {
        prevPic.disabled = false;
    }
    if (picNum === picData.length) {
        nextPic.disabled = true;
    } else {
        nextPic.disabled = false;
    }

    setTimeout(() => {
        pic.style.animation = '';
        pic.style.mask = '';
        pic.style["-webkit-mask"] = '';
        pic.style["-moz-mask"] = '';
        pic.style["-ms-mask"] = '';
        pic.src = "";
        picTitle.textContent = "";
    }, 0)

    let tempImg = new Image();
    tempImg.onload = () => {
        pic.src = tempImg.src;
        picTitle.textContent = picData[picNum].data.title;
    }
    tempImg.src = picData[picNum].data.url;
}

function toggleSettings(e = event, state = "toggle") {
    state === "toggle" ? e.preventDefault() : null

    let theDis = window.getComputedStyle(settings).getPropertyValue('display');

    if (state === "show" && theDis === "none") {
        settings.style.display = "block";
        pic.style.transform = "scale(0.9)"
        setTimeout(() => {
            settings.style.opacity = 1;
        }, 0)
    } else if (state === "hide" && theDis === "block") {
        pic.style.transform = "";
        settings.style.opacity = 0;
        setTimeout(() => {
            settings.style.display = "none";
        }, 200);
    } else if (state === "toggle") {
        if (theDis === "none") {
            toggleSettings(e, "show")
        } else if (theDis === "block") {
            toggleSettings(undefined, "hide")
        }
    }
}

prevPic.onclick = () => {
    changePic(-1);
}
nextPic.onclick = () => {
    changePic(1);
}
memePoster.onclick = postMeme;

setter.onclick = (e) => {
    toggleSettings(e);
}

function sendHttpRequest() {
    setTimeout(() => {
        pic.src = "";
        pic.style.animation = "";
        pic.style.mask = '';
        pic.style["-webkit-mask"] = '';
        pic.style["-moz-mask"] = '';
        pic.style["-ms-mask"] = '';
        picTitle.textContent = "";

        httpRequest.open('GET', `https://www.reddit.com/r/${scoutMode}/best.json?limit=80`);
        httpRequest.send();
    }, 0)
}

window.fbAsyncInit = function () {
    FB.init({
        appId: appId,
        xfbml: true,
        version: "v8.0"
    });
    FB.AppEvents.logPageView();
};

(function (d, s, id) {
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

function getPageAccessToken() {
    console.log("mma");
    FB.api(
        "/" + pageId,
        "GET", {
            fields: "access_token",
            access_token: userAccessToken
        },
        function (response) {
            console.log(response);
            pageAccessToken = response.access_token;
        }
    );
}

// Login user and get user access token
function login(e) {
    FB.login(
        function (response) {
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
        }, {
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

function postMeme(e) {
    e.target.disabled = true;
    e.target.style.backgroundImage =
        "repeating-linear-gradient(-60deg, #222, #222 15px, #444 15px, #444 29px)";
    e.target.classList.toggle("waiting");
    FB.api(
        "/" + pageId + "/photos",
        "POST", {
            url: pic.src,
            access_token: pageAccessToken,
            message: picTitle.textContent
        },
        function (response) {
            console.log(response);
            e.target.classList.toggle("waiting");
            if (response.error || !pic.src) {
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

httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === 4) {
        if (httpRequest.status >= 200 && httpRequest.status < 400) {
            let tempArray = JSON.parse(httpRequest.responseText).data.children;
            picData = [];
            tempArray.forEach(post => {
                if (!post.data.stickied) {
                    if (!post.data.is_video) {
                        if (!post.data.over_18) {
                            if (!post.data.gallery_data) {
                                picData.push(post)
                            }
                        }
                    }
                }
            });

            document.body.style.pointerEvents = 'all';
            picNum = -1;
            nextPic.click();
            picTitle.style.display = 'block';
            controls.style.visibility = '';
            return
        }
        pic.classList.add('error');
    }
}

sendHttpRequest();