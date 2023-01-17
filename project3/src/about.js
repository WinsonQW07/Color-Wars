let image = document.querySelector("#image");

let img = document.createElement("img");

let playButton = document.querySelector("#playButton");

img.src = "images/game.png";
img.alt = "game screen";
img.width = 650;
img.height = 650;

image.appendChild(img);

playButton.onclick = () => {
    window.location = "app.html";
  }