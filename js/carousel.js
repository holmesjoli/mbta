const img = document.getElementById('carousel');
const title = document.getElementById('title');
const source = document.getElementById('source');
const rightBtn = document.getElementById('right-btn');
const leftBtn = document.getElementById('left-btn');

let pictures = [{src: './images/pre_beck_1933.jpg',
                title: "London Underground Railroad design"},
                {src: './images/beck_1933.jpg', title: "Beck's London Underground Railroad redesign"},
                {src: 'images/boston_1905.jpg', title: "Boston railroad expansion plan 1905"},
                {src: 'images/boston_recent.jpg', title: "Boston T-Map"}]

img.src = pictures[0].src;

let position = 0;

const moveRight = () => {
    if (position >= pictures.length - 1) {
        position = 0
        img.src = pictures[position].src;
        return;
    }
    img.src = pictures[position + 1].src;
    position++;
}

const moveLeft = () => {
    if (position < 1) {
        position = pictures.length - 1;
        img.src = pictures[position].src;
        return;
    }
    img.src = pictures[position - 1].src;
    position--;
}

rightBtn.addEventListener("click", moveRight);
leftBtn.addEventListener("click", moveLeft);