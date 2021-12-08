const img = document.getElementById('carousel');
const title = document.getElementById('title');
const source = document.getElementById('source');
const rightBtn = document.getElementById('right-btn');
const leftBtn = document.getElementById('left-btn');

let pictures = [{src: './images/pre_beck_1933.jpg',
                title: "London Underground Railroad design",
                href: "https://en.wikipedia.org/wiki/Harry_Beck#/media/File:Tube_map_1908-2.jpg"},
                {src: './images/beck_1933.jpg', title: "Beck's London Underground Railroad redesign", href: "https://londonist.com/london/transport/modern-tube-map-harry-beck-1931-1933"},
                {src: 'images/boston_1905.jpg', title: "Boston railroad expansion plan 1905",
                href: 'https://bostonintransit.com/collections/boston-transit-commission-annual-report-12-1906/products/btc-annual-report-12-1906-plan-01s'},
                {src: 'images/boston_recent.jpg', title: "Boston T-Map", href: "https://mapa-metro.com/mapas/Boston/mapa-metro-boston.jpg"}]

img.src = pictures[0].src;
title.textContent = pictures[0].title;
source.href = pictures[0].href;
let position = 0;

const moveRight = () => {
    if (position >= pictures.length - 1) {
        position = 0
        img.src = pictures[position].src;
        title.textContent = pictures[position].title;
        source.href = pictures[position].href;
        return;
    }
    img.src = pictures[position + 1].src;
    title.textContent = pictures[position + 1].title;
    source.href = pictures[position + 1].href;
    position++;
}

const moveLeft = () => {
    if (position < 1) {
        position = pictures.length - 1;
        img.src = pictures[position].src;
        title.textContent = pictures[position].title;
        source.href = pictures[position].href;
        return;
    }
    img.src = pictures[position - 1].src;
    title.textContent = pictures[position - 1].title;
    source.textContent = pictures[position - 1].source;
    position--;
}

rightBtn.addEventListener("click", moveRight);
leftBtn.addEventListener("click", moveLeft);