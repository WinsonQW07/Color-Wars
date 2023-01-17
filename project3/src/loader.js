import init from './main.js';
import {loadImages} from './helpers.js';

import "./my-header.js"
import "./my-footer.js"

const imageSources = {
		player: "images/player.png",
		enemy: "images/spaceship.png",
		playerBullet: "images/player-bullet.png",
		blueBullet: "images/blueBullet.png",
		greenBullet: "images/greenBullet.jpg",
		yellowBullet: "images/yellowBullet.png",
		title: "images/title.png",
		galaxy: "images/galaxy.jpg",
		rip: "images/rip.png"
};

// loadImages(imageSourcesObject,callback);
loadImages(imageSources,startGame);

function startGame(imageData){
	init(imageData);
}
