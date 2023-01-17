import ImageSprite from './ImageSprite.js';
import {getRandomUnitVector} from './utilities.js';
export {loadImages, createImageSprites, drawRect, createTile, writeText, fillText, strokeText};

function loadImages(imageSources,callback) {
		let numImages = Object.keys(imageSources).length
		let numLoadedImages = 0;
		
		// load images
		console.log("... start loading images ...");
		for(let imageName in imageSources) {
			console.log("... trying to load '" + imageName + "'");
			let img = new Image();
			img.src = imageSources[imageName];
			imageSources[imageName] = img;
			img.onload = function() {
				console.log("SUCCESS: Image named '" + imageName + "' at " + this.src + " loaded!");
				if(++numLoadedImages >= numImages){
					console.log("... done loading images ...");
					callback(imageSources);
				}
			}
			img.onerror = function(){
				console.log("ERROR: image named '" + imageName + "' at " + this.src + " did not load!");
			}
		}
	}

function createImageSprites(num=10,width=50,height=50,image,type,x,y)
{
	let sprites = [];
	for(let i = 0; i < num; i++)
	{
		let s = new ImageSprite(x,
		y,
		getRandomUnitVector(),
		120,
		width,
		height,
		image,
		type);
		sprites.push(s);
	}
	return sprites;
}

function drawRect(ctx,x,y,width,height,fillStyle,lineWidth=2,strokeStyle="white")
{
	ctx.save();
	ctx.fillStyle = fillStyle;
	ctx.beginPath();
	ctx.rect(x,y,width,height);
	ctx.fill();
	if(lineWidth > 0)
	{
		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = strokeStyle;
		ctx.stroke();
	}
	ctx.closePath();
	ctx.restore();

}

function createTile(x,y,width,height,fillStyle,array)
{
	let tile = {
		"x": x,
		"y": y,
		"width": width,
		"height": height,
		"color" : fillStyle,
		"visible": true
	  }

	  array.push(tile);
}

function writeText(ctx,string,x,y,css,fillColor,lineColor,lineWidth)
{
	fillText(ctx,string,x,y,css,fillColor);
	strokeText(ctx,string,x,y,css,lineColor,lineWidth);
}

function fillText(ctx,string,x,y,css,color)
{
	ctx.save();
	ctx.font = css;
	ctx.fillStyle = color;
	ctx.fillText(string,x,y);
	ctx.restore();
}

function strokeText(ctx,string,x,y,css,color,lineWidth)
{
	ctx.save();
	ctx.font = css;
	ctx.strokeStyle = color;
	ctx.lineWidth = lineWidth;
	ctx.strokeText(string,x,y);
	ctx.restore();
}