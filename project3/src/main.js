import {getMouse, rectsIntersect, getRandomInt, xReflection, yReflection} from './utilities.js';
import { createImageSprites, drawRect, createTile, writeText, fillText, strokeText } from './helpers.js';
import { setScore, writeArr, scoreSplitArr } from './scores.js';
export default init;

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const canvasWidth = 800;
const canvasHeight = 600;

// fake enum
const GameState = Object.freeze({
    START:   		Symbol("START"),
	INSTRUCTIONS:	Symbol("INSTRUCTIONS"),
    MAIN:  			Symbol("MAIN"),
    LEVELOVER: 	Symbol("LEVELOVER"),
    GAMEOVER: 	Symbol("GAMEOVER"),
	FINALSCORE: Symbol("FINALSCORE"),
	HIGHSCORES: Symbol("HIGHSCORES")
});

const MyErrors = Object.freeze({
    drawHUDswitch:  "Invalid value in drawHUD switch",
    mousedownSwitch: "Invalid value in mousedown switch",
    loadLevelSwitch: "Invalid value in loadLevel switch"
});

let gameState = GameState.START;
let imageData;

//characters and blocks
let sprites = [];
let blocks = [];
let enemies = [];

//projectiles
let playerBullets = [];
let blueBullets = [];
let greenBullets = []; 
let yellowBullets = [];

let currentLevel = 1;

//audio
let playerShoot, clickSound, explosionSound, mainTheme, toggleSound, resetSound, splitSound

let xMouse, yMouse;

let p1Active = false;

let initDir = true;

let p1Timer = 10;

//skills
let skillBool = false;
let skillText = "off";
let skillUses = 1;
let detonationUses;

let blueDead = false;
let greenDead = false;
let yellowDead = false;

let winScreen = false;

//score
let levelOneScore = 100;
let levelTwoScore = 100;
let levelThreeScore = 100;
let scoreInit = true;

ctx.fillRect(0,0,canvasWidth,canvasHeight);

function init(argImageData){
	imageData = argImageData;

	// Load Sounds
	playerShoot = new Howl({
		src: ["sounds/playerShoot.ogg"],
		volume: 0.05
	});

	clickSound = new Howl({
		src: ["sounds/click.ogg"],
		volume: 0.08
	});

	explosionSound = new Howl({
		src: ["sounds/explosion.ogg"],
		volume: 0.07
	});

	mainTheme = new Howl({
		src: ["sounds/mainMenu.mp3"],
		volume: 0.08
	});

	toggleSound = new Howl({
		src: ["sounds/toggle.ogg"],
		volume: 0.07
	});

	resetSound = new Howl({
		src: ["sounds/reset.ogg"],
		volume: 0.04
	});

	splitSound = new Howl({
		src: ["sounds/split.ogg"],
		volume: 0.2
	});
														
	// hook up events
	canvas.onmousedown = doMousedown;
	loop();
}

//makes enemies shoot in intervals
setInterval(function(){
	enemyShoot(blueBullets);
	 }, 8000);

setInterval(function(){
	enemyShoot(greenBullets);
	}, 7000);

setInterval(function(){
	enemyShoot(yellowBullets);
	}, 6000);


//makes enemies shoot their respective colors
function enemyShoot(array)
{
	try
	{
		switch(array)
		{
			case blueBullets:
				if(blueDead == false)
				{
					blueBullets = blueBullets.concat(	
						createImageSprites(1,20,20,imageData.blueBullet,"blue-bullet",sprites[1].x+25,sprites[1].y+25),
					);
				}
		
			break;
			case greenBullets:
				if(greenDead == false)
				{
					greenBullets = greenBullets.concat(	
						createImageSprites(1,20,20,imageData.greenBullet,"green-bullet",sprites[2].x+25,sprites[2].y+25),
					);
				}
		
			break;
			case yellowBullets:
				if(yellowDead == false)
				{
					yellowBullets = yellowBullets.concat(	
						createImageSprites(1,20,20,imageData.yellowBullet,"yellow-bullet",sprites[3].x+25,sprites[3].y+25),
					);
				}
		
			break;
		}
	}
	catch(error)
	{
		return;
	}
	
}

//updates the score
setInterval(function(){
	if(winScreen == false)
	{
		if(currentLevel == 1)
		{
			levelOneScore--;
			if(levelOneScore <= 0)
			{
				levelOneScore = 0;
			}
		}
		if(currentLevel == 2)
		{
			levelTwoScore--;
			if(levelTwoScore <= 0)
			{
				levelTwoScore = 0;
			}
		}
		if(currentLevel == 3)
		{
			levelThreeScore--;
			if(levelThreeScore <= 0)
			{
				levelThreeScore = 0;
			}
		}
	}
}, 1500);

function loop(timestamp){
	// schedule a call to loop() in 1/60th of a second
	requestAnimationFrame(loop);
	
	// draw background
	ctx.fillRect(0,0,canvasWidth,canvasHeight);
	for(let k = 0; k < blocks.length; k++)
	{
		if(blocks[k].visible == true)
		{
			drawRect(ctx,blocks[k].x,blocks[k].y,blocks[k].width,blocks[k].height,blocks[k].color,10,"black");
		}
	}
	
	// draw game sprites
	if (gameState == GameState.MAIN){
		for (let s of sprites){

			if(s.visible == true)
			{
				s.draw(ctx);
			}

		} // end for

		if(p1Active == false)
		{
			p1Timer += .01;
		}

		//clears the projectiles after a certain amount of time
		if(p1Timer >= 3.5)
		{
			playerBullets = [];
			p1Timer = 0;
		}

		//player bullets
		for(let i = 0; i < playerBullets.length; i++)
		{
			if(p1Active == false)
			{
				initDir = true;
			}
		
			//changes the speed based on mouse location
			if(initDir == true && p1Active == true)
			{
				playerBullets[i].fwd.x = (xMouse - sprites[0].x) /100;
				playerBullets[i].fwd.y = (yMouse - sprites[0].y) / 100;
			}

			playerBullets[i].move();

			//width bounds
			if(playerBullets[i].x <= 0 || playerBullets[i].x >= canvasWidth-playerBullets[i].width)
			{
				//reflects the small projectiles
				xReflection(playerBullets,i);
			
				//makes the big projectile split into multiple smaller pieces
				if(playerBullets[i].width > 10)
				{
					splitBullet(i, playerBullets);
					playerBullets.splice(i,1);
					p1Active = false;
				}
			}

			//height bounds
			if(playerBullets[i].y <= 0 || playerBullets[i].y >= canvasHeight-playerBullets[i].height)
			{
				//reflects the small projectiles
				yReflection(playerBullets,i);

				//makes the big projectile split into multiple smaller pieces
				if(playerBullets[i].width > 10)
				{
					splitBullet(i, playerBullets);
					playerBullets.splice(i,1);
					p1Active = false;
				}
			}

			//enemy sprite collision
			for(let j = 0; j < sprites.length; j++)
			{
				if(j == 0)
				{
					continue;
				}

				//makes the enemies inactive if the bullets hit them
				if(rectsIntersect(playerBullets[i], sprites[j]))
				{
					sprites[j].visible = false;

					switch(j)
					{
						case 1:
							blueDead = true
							break;
						case 2:
							greenDead = true
							break;
						case 3:
							yellowDead = true
							break;
					}
				}
			}

			//moves onto the next level if the conditions are met
			checkWin(currentLevel);

			try{
				//block collision
				for(let j = 0; j < blocks.length; j++)
				{
					//if the player's bullets collides with a tile that is not their color, changes it
					if(rectsIntersect(blocks[j], playerBullets[i]))
					{
						if(blocks[j].color != "#b10000")
						{
							splitSound.play();
							blocks[j].color = "#b10000";
							drawRect(ctx,blocks[j].x,blocks[j].y,blocks[j].width,blocks[j].height,blocks[j].color,2,"white");

							//splits the big bullet
							if(playerBullets[i].width > 10)
							{
								splitBullet(i, playerBullets);
								playerBullets.splice(i,1);
							}

							//piercing charge
							if(playerBullets[i].width <= 10)
							{
								if(skillBool == true && skillUses >= 0)
								{
									if(playerBullets[i].uses <= 0)
									{
										playerBullets.splice(i,1);
									}
									playerBullets[i].uses--;
								}
								else{
									playerBullets.splice(i,1);
								}
							}
							p1Active = false;
						}
					}
				}
				playerBullets[i].draw(ctx);
			}
			catch(error){
				return;
			}
		}// end for

		//blue bullets
		for(let i = 0; i < blueBullets.length; i++)
		{
			blueBullets[i].move();

			if(blueBullets[i].x <= 0 || blueBullets[i].x >= canvasWidth-blueBullets[i].width)
			{
				xReflection(blueBullets,i);

				if(blueBullets[i].width > 10)
				{
					splitBullet(i, blueBullets);
					blueBullets.splice(i,1);
				}
			}

			if(blueBullets[i].y <= 0 || blueBullets[i].y >= canvasHeight-blueBullets[i].height)
			{
				yReflection(blueBullets,i);

				if(blueBullets[i].width > 10)
				{
					splitBullet(i, blueBullets);
					blueBullets.splice(i,1);
				}
			}

			enemyBulletHit(blueBullets,i);

			try{
				for(let j = 0; j < blocks.length; j++)
				{
					if(rectsIntersect(blocks[j], blueBullets[i]))
					{
						if(blocks[j].color != enemies[0].color)
						{
							blocks[j].color = enemies[0].color;
							drawRect(ctx,blocks[j].x,blocks[j].y,blocks[j].width,blocks[j].height,blocks[j].color,2,"white");

							if(blueBullets[i].width > 10)
							{
								splitBullet(i, blueBullets);
							}

							blueBullets.splice(i,1);
						}
					}
				}
				blueBullets[i].draw(ctx);
			}
			catch(error)
			{
				return;
			}
		}

			if(currentLevel >= 2)
			{
				//green bullets
				for(let i = 0; i < greenBullets.length; i++)
				{
					greenBullets[i].move();

					if(greenBullets[i].x <= 0 || greenBullets[i].x >= canvasWidth-greenBullets[i].width)
					{
						xReflection(greenBullets,i);
					
						if(greenBullets[i].width > 10)
						{
							splitBullet(i, greenBullets);
							greenBullets.splice(i,1);
						}
					}

					if(greenBullets[i].y <= 0 || greenBullets[i].y >= canvasHeight-greenBullets[i].height)
					{
						yReflection(greenBullets,i);

						if(greenBullets[i].width > 10)
						{
							splitBullet(i, greenBullets);
							greenBullets.splice(i,1);
						}
					}

					enemyBulletHit(greenBullets,i);

					try{
						for(let j = 0; j < blocks.length; j++)
						{
							if(rectsIntersect(blocks[j], greenBullets[i]))
							{
								if(blocks[j].color != enemies[1].color)
								{
									blocks[j].color = enemies[1].color;
									drawRect(ctx,blocks[j].x,blocks[j].y,blocks[j].width,blocks[j].height,blocks[j].color,2,"white");

									if(greenBullets[i].width > 10)
									{
										splitBullet(i, greenBullets);
									}

									greenBullets.splice(i,1);
								}
							}
						}

						greenBullets[i].draw(ctx);
					}
					catch(error)
					{
						return;
					}
				}
			}

			if(currentLevel >= 3)
			{
				//yellow bullets
				for(let i = 0; i < yellowBullets.length; i++)
				{
					yellowBullets[i].move();

					if(yellowBullets[i].x <= 0 || yellowBullets[i].x >= canvasWidth-yellowBullets[i].width)
					{
						xReflection(yellowBullets,i);
					
						if(yellowBullets[i].width > 10)
						{
							splitBullet(i, yellowBullets);
							yellowBullets.splice(i,1);
						}
					}

					if(yellowBullets[i].y <= 0 || yellowBullets[i].y >= canvasHeight-yellowBullets[i].height)
					{
						yReflection(yellowBullets,i);

						if(yellowBullets[i].width > 10)
						{
							splitBullet(i, yellowBullets);
							yellowBullets.splice(i,1);
						}
					}

					enemyBulletHit(yellowBullets,i);

					try{
						for(let j = 0; j < blocks.length; j++)
						{
							if(rectsIntersect(blocks[j], yellowBullets[i]))
							{
								if(blocks[j].color != enemies[2].color)
								{
									blocks[j].color = enemies[2].color;
									drawRect(ctx,blocks[j].x,blocks[j].y,blocks[j].width,blocks[j].height,blocks[j].color,2,"white");

									if(yellowBullets[i].width > 10)
									{
										splitBullet(i, yellowBullets);
									}

									yellowBullets.splice(i,1);
								}
							}
						}

						yellowBullets[i].draw(ctx);
					}
					catch(error)
					{
						return;
					}
				}
			}

			//skill buttons
			document.onkeydown = function (e) {
				e = e || window.event;
				//piercing charge skill
				if(e.key == "e")
				{
					skillBool = !skillBool;
					if(skillUses > 0)
					{
						toggleSound.play();
					}
				}
				//reset level
				if(e.key == "r")
				{
					resetSound.play();
					loadLevel(currentLevel);
				}
		
				switch(skillBool)
				{
					case true:
						skillText = "on";
						break;
					case false:
						skillText = "off"
						break;
				}
				//detonation ability
				if(e.key == "q")
				{
					if(detonationUses > 0)
					{
						explosionSound.play();
						for(let i = 0; i < 20; i++)
						{
							let num = getRandomInt(0,208);
	
							for(let j = 0; j < blocks.length; j++)
							{
								if(j == num)
								{
									blocks[j].color = "#b10000";
								}
							}
						}
	
						detonationUses--;
					}
				}
			};//end function
		
	} // end if
	// draw rest of UI, depending on current gameState
	drawHUD(ctx);
} // end loop()

function drawHUD(ctx){
	ctx.save(); 
	
	switch(gameState){
		case GameState.START:
			//resets values
			winScreen = false;
			levelOneScore = 100;
			levelTwoScore = 100;
			levelThreeScore = 100;
			blocks = [];
			scoreInit = true;

			ctx.save();
			ctx.translate(canvasWidth/2,canvasHeight/2);
			ctx.scale(6,6);
			ctx.globalAlpha = 0.5;
			ctx.restore();

			ctx.drawImage(imageData.galaxy,0,0,800,600);
			
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			writeText(ctx,"Color Wars", canvasWidth/2, 100, "75pt 'Press Start 2P', cursive", "red", "black", 5);
			writeText(ctx,"Click to Play!", canvasWidth/2, 500, "35pt 'Press Start 2P', cursive","white", "black",3);
		break;

		case GameState.INSTRUCTIONS:
			ctx.drawImage(imageData.galaxy,0,0,800,600);
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			writeText(ctx,"How to Play", canvasWidth/2, 40, "40pt 'Press Start 2P', cursive", "white", "black", 1);
			writeText(ctx,"Left mouse click to shoot a projectile.", 230, 100, "18pt 'Press Start 2P', cursive", "white", "white",.5);
			writeText(ctx,"The projectile will split into smaller pieces upon any collisions.", 360, 140, "18pt 'Press Start 2P', cursive", "white","white",.5);
			writeText(ctx,"Projectiles will change the color of tiles if they do not belong to you.", 400, 180, "18pt 'Press Start 2P', cursive", "white","white",.5);
			writeText(ctx,"Hit all enemy ships in the level to progress further.", 305, 220, "18pt 'Press Start 2P', cursive", "white","white",.5);
			writeText(ctx,"Press E to make the next projectiles have extra piercing power.", 375, 260, "18pt 'Press Start 2P', cursive", "white","white",.5);
			writeText(ctx,"Press Q to change to the color of random blocks into your color.", 375, 300, "18pt 'Press Start 2P', cursive", "white","white",.5);
			writeText(ctx,"Watch out. You aren't the only one with projectiles.", 305, 340, "18pt 'Press Start 2P', cursive", "white","white",.5);
			writeText(ctx,"Press R to restart the current level.", 225, 380, "18pt 'Press Start 2P', cursive", "white","white",.5);
			writeText(ctx,"This is you, Red", 95, 500, "15pt 'Press Start 2P', cursive", "white","white",.5);
			writeText(ctx,"Click anywhere to begin", 400, 550, "18pt 'Press Start 2P', cursive", "white","white",.5);
			ctx.drawImage(imageData.player,30,520,60,60);
			writeText(ctx,"This is an enemy", 695, 500, "15pt 'Press Start 2P', cursive", "white","white",.5);
			ctx.drawImage(imageData.enemy,670,520,60,60);
			ctx.drawImage(imageData.playerBullet,120,520,50,50);
		break;

		case GameState.MAIN:
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			fillText(ctx,"Piercing Charge:", 110, 30, "20pt 'Press Start 2P', cursive", "white");

			if(skillUses > 0)
			{
				fillText(ctx," " + skillUses + " " + skillText, 245, 30, "20pt 'Press Start 2P', cursive", "white");
			}

			fillText(ctx,"Detonations: " + detonationUses, 100, 70, "20pt 'Press Start 2P', cursive", "white");
			fillText(ctx,"Level Score:" , 85, 575, "20pt 'Press Start 2P', cursive", "white");

			if(currentLevel == 1)
			{
				fillText(ctx," " + levelOneScore, 200, 575, "20pt 'Press Start 2P', cursive", "white");
			}
			if(currentLevel == 2)
			{
				fillText(ctx," " + levelTwoScore, 200, 575, "20pt 'Press Start 2P', cursive", "white");
			}
			if(currentLevel == 3)
			{
				fillText(ctx," " + levelThreeScore, 200, 575, "20pt 'Press Start 2P', cursive", "white");
			}

		break;
		
		case GameState.LEVELOVER:
			blocks = [];
			// draw level results
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			writeText(ctx,"Level " + currentLevel + " of 3 Over", canvasWidth/2, 220, "40pt 'Press Start 2P', cursive", "white","white",.5);
			writeText(ctx,"Click to Continue!", canvasWidth/2, canvasHeight/2 + 50, "12pt courier", "white","white",.5);	
			ctx.drawImage(imageData.player,canvasWidth/2 - 30,canvasHeight/2 - 30,60,60);
		
		break;
		
		case GameState.GAMEOVER:
			blocks = [];
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			writeText(ctx,"Game Over!", canvasWidth/2, canvasHeight/2 - 65, "68pt courier", "red","red",.5);

			ctx.drawImage(imageData.rip,canvasWidth/2 - 50,canvasHeight/2,100,100);
			writeText(ctx,"Click to return to the start screen!", canvasWidth/2, canvasHeight/2 + 150, "12pt courier", "white","white",.5);	
		break;

		case GameState.FINALSCORE:
			winScreen = true;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			writeText(ctx,"Final Score: " + (levelOneScore + levelTwoScore + levelThreeScore), canvasWidth/2, canvasHeight/2 - 65, "38pt 'Press Start 2P', cursive", "white","white",.5);

			if(scoreInit == true)
			{
				writeArr();
				setScore(levelOneScore + levelTwoScore + levelThreeScore);
				scoreInit = false;
				writeArr();
			}
			break;

		case GameState.HIGHSCORES:
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			writeText(ctx,"Your High Scores", canvasWidth/2, 50, "45pt 'Press Start 2P', cursive", "white","white",.5);

			let xValue = canvasWidth/2;
			let yValue = 150;
			let increment = 0;
			for(let i = 0; i < scoreSplitArr.length; i++)
			{
				writeText(ctx,(i + 1) + ". " + scoreSplitArr[i] + " points", xValue, yValue + increment, "30pt 'Press Start 2P', cursive", "white","white",.5);
				increment += 70;
			}

			writeText(ctx,"Click to return to the start screen", canvasWidth/2, 520, "20pt 'courier", "white","white",.5);
			break;
		
		default:
		throw new Error(MyErrors.drawHUDswitch);
	
	}
	ctx.restore();
}

	const loadJsonFetch = (url,callback) => {
		fetch(url)
			.then(response => {
				// If the response is successful, return the JSON
				if (response.ok) {
					return response.json();
				}

				// else throw an error that will be caught below
				return response.text().then(text =>{
					throw text;
				});
			}) // send the response.json() promise to the next .then()
			.then(json => { // the second promise is resolved, and `json` is a JSON object
				callback(json);
			}).catch(error => {
				// error
				console.log(error);
		});
	};

	const dataLoaded = json => {
		for(let i = 0; i < json.enemies.length; i++)
		{
			enemies.push(json.enemies[i]);
		}
	};

	loadJsonFetch("data/enemies.json",dataLoaded);

	function loadLevel(levelNum){
		mainTheme.stop();
		mainTheme.play();
		skillUses = currentLevel + 1;
		skillBool = false;
		detonationUses = 3 + currentLevel;

		//resets the characters and projectiles
		sprites = [];
		playerBullets = [];
		blueBullets = [];
		greenBullets = [];
		yellowBullets = [];
		blocks = [];

		blueDead = false;
		greenDead = false;
		yellowDead = false;

		let x = 0;
		let y = 0;

		switch(currentLevel){
				case 1:
					levelOneScore = 100;
					//sets up the colored tiles
					while(x <= canvasWidth && y <= canvasHeight)
					{
						//draws half of the canvas in blue and the other half in red
						if(x >= canvasWidth / 2)
						{
							createTile(x,y,50,50,enemies[0].color,blocks);
						}
						else
						{
							createTile(x,y,50,50,"#b10000",blocks);
						}
						x += 50;
						//resets the x but increases the y position
						if(x >= canvasWidth)
						{
							x = 0;
							y += 50;
						}
					}
				
				sprites = sprites.concat(	
					createImageSprites(1,50,50,imageData.player,"player",50,250),
					createImageSprites(1,50,50,imageData.enemy,"enemy",enemies[0].x,enemies[0].y),
				);
				setupSpace();
				break;

				case 2:
					levelTwoScore = 100;
					//sets up the colored tiles
					while(x <= canvasWidth && y <= canvasHeight)
					{
						if(x <= canvasWidth / 2)
						{
							createTile(x,y,50,50,"#b10000",blocks);
						}
						if(x >= canvasWidth / 2 && y < canvasHeight / 2)
						{
							createTile(x,y,50,50,enemies[1].color,blocks);
						}
						if(x >= canvasWidth / 2 && y >= canvasHeight / 2)
						{
							createTile(x,y,50,50,enemies[0].color,blocks);
						}
					
						x += 50;
						if(x >= canvasWidth)
						{
							x = 0;
							y += 50;
						}
					}
				
				sprites = sprites.concat(	
					createImageSprites(1,50,50,imageData.player,"player",50,250),
					createImageSprites(1,50,50,imageData.enemy,"enemy",enemies[0].x,enemies[0].y + 250),
					createImageSprites(1,50,50,imageData.enemy,"enemy",enemies[1].x + 300,enemies[1].y),				
				);

				setupSpace();
				break;

				case 3:
				levelThreeScore = 100;
				//sets up the colored tiles
				while(x <= canvasWidth && y <= canvasHeight)
				{
					if(x <= canvasWidth / 2 && y < canvasHeight / 2)
					{
						createTile(x,y,50,50,"#b10000",blocks);
					}
					if(x <= canvasWidth / 2 && y >= canvasHeight / 2)
					{
						createTile(x,y,50,50,enemies[2].color,blocks);
					}
					if(x >= canvasWidth / 2 && y < canvasHeight / 2)
					{
						createTile(x,y,50,50,enemies[1].color,blocks);
					}
					if(x >= canvasWidth / 2 && y >= canvasHeight / 2)
					{
						createTile(x,y,50,50,enemies[0].color,blocks);
					}
				
					x += 50;
					if(x >= canvasWidth)
					{
						x = 0;
						y += 50;
					}
				}
			
			sprites = sprites.concat(	
				createImageSprites(1,50,50,imageData.player,"player",50,50),
				createImageSprites(1,50,50,imageData.enemy,"enemy",enemies[0].x,enemies[0].y + 250),
				createImageSprites(1,50,50,imageData.enemy,"enemy",enemies[1].x + 300,enemies[1].y),
				createImageSprites(1,50,50,imageData.enemy,"enemy",enemies[2].x,enemies[2].y),
			);

			setupSpace();
				break;
						
				default:
				throw new Error(MyErrors.loadLevelSwitch);
		} // end switch
	}

function doMousedown(e){
	//console.log(e);
	let mouse=getMouse(e);
//	console.log(`canvas coordinates: x=${mouse.x} y=${mouse.y}`);

	switch(gameState){
		case GameState.START:
			gameState = GameState.INSTRUCTIONS;
			clickSound.play();
			break;

		case GameState.INSTRUCTIONS:
			currentLevel = 1;
			loadLevel(currentLevel);
			gameState = GameState.MAIN;
			clickSound.play();
		break;

		case GameState.MAIN:
		if(skillUses >= 0 && skillBool == true)
		{
			skillUses--;
		}

		if(playerBullets.length == 0)
		{
			if(p1Active == false)
			{
				xMouse = mouse.x;
				yMouse = mouse.y;
				playerShoot.play();
				playerBullets = playerBullets.concat(	
					createImageSprites(1,20,20,imageData.playerBullet,"player-bullet",sprites[0].x+25,sprites[0].y+25),
				);
		
				p1Active = true;
			}
		}		
			break;
			
		case GameState.LEVELOVER:	
			currentLevel ++;	
			clickSound.play();

			if(currentLevel > 3)
			{
				gameState = GameState.FINALSCORE;
				currentLevel = 1;
			}
			else
			{
				loadLevel(currentLevel);
				gameState = GameState.MAIN;
			}
			break;
			
		case GameState.GAMEOVER:
			gameState = GameState.START;
			clickSound.play();
			mainTheme.stop();
			break;

		case GameState.FINALSCORE:
			gameState = GameState.HIGHSCORES;
			clickSound.play();
			break;

		case GameState.HIGHSCORES:
			gameState = GameState.START;
			clickSound.play();
			mainTheme.stop();
			break;
			
		default:
			throw new Error(MyErrors.mousedownSwitch);
	} // end switch
}

//end the game if the enemy hits the player
function enemyBulletHit(array, i)
{
	if(rectsIntersect(sprites[0], array[i]))
	{
		gameState = GameState.GAMEOVER;
	}
}

//splits the projectiles
function splitBullet(i, array)
{
	switch(array)
	{
		case playerBullets:
			splitSound.play();
			playerBullets = playerBullets.concat(	
				createImageSprites(6,10,10,imageData.playerBullet,"player-bullet",playerBullets[i].x,playerBullets[i].y),
			);
		break;
		case blueBullets:
			blueBullets = blueBullets.concat(	
				createImageSprites(6,10,10,imageData.blueBullet,"blue-bullet",blueBullets[i].x,blueBullets[i].y),
			);
		break;
		case greenBullets:
			greenBullets = greenBullets.concat(	
				createImageSprites(6,10,10,imageData.greenBullet,"green-bullet",greenBullets[i].x,greenBullets[i].y),
			);
		break;
		case yellowBullets:
			yellowBullets = yellowBullets.concat(	
				createImageSprites(6,10,10,imageData.yellowBullet,"yellow-bullet",yellowBullets[i].x,yellowBullets[i].y),
			);
		break;
	}
}

//moves onto the next level
function checkWin(currentLevel)
{
	switch(currentLevel){
		case 1:
			if(blueDead == true)
			{
				gameState = GameState.LEVELOVER;
			}
		break;

		case 2:
			if(blueDead == true && greenDead == true)
			{
				gameState = GameState.LEVELOVER;
			}
		break;

		case 3:
			if(blueDead == true && greenDead == true && yellowDead == true)
			{
				gameState = GameState.LEVELOVER;
			}
		break;
	}
}

function setupSpace()
{
	//does not draw a block on the players
	for(let i = 0; i < blocks.length; i++)
	{
		for(let j = 0; j < sprites.length; j++)
		{
			if(rectsIntersect(sprites[j], blocks[i]))
			{
				blocks[i].visible = false;
			}
		}
	}

	//draws the blocks
	for(let i = 0; i < blocks.length; i++)
	{
		if(blocks[i].visible == true)
		{
			drawRect(ctx,blocks[i].x, blocks[i].y, blocks[i].width, blocks[i].height, blocks[i].color, 2, "white");
		}
	}
}

