// /https://freefrontend.com/javascript-carousels/

const img = document.getElementById('carousel');
const title = document.getElementById('title');
const source = document.getElementById('source');

const pastBtn = document.getElementById("past");
const presentBtn = document.getElementById("present")

const past = [{src: "images/boston_1967.jpg",
                title: "Boston MBTA 1967",
                href: "https://www.flickr.com/photos/vanshnookenraggen/3186247755/in/album-72157594460286528/"}];

const present = [{src: "images/boston_recent.jpg", 
                title: "Boston MBTA 2013", 
                href: "https://mapa-metro.com/mapas/Boston/mapa-metro-boston.jpg"}];

img.src = past[0].src;
title.textContent = past[0].title;
source.href = past[0].href;

const showPast = () => {
    img.src = past[0].src;
    title.textContent = past[0].title;
    source.href = past[0].href;
    return;
};

const showPresent = () => {
    img.src = present[0].src;
    title.textContent = present[0].title;
    source.href = present[0].href;
    return;
};

presentBtn.addEventListener("click", showPresent);
pastBtn.addEventListener("click", showPast);
