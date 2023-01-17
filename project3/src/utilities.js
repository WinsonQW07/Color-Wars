export {getRandomUnitVector,getMouse,getRandom, rectsIntersect, getRandomInt, xReflection, yReflection};

function getRandomUnitVector(){
	let x = getRandom(-1,1);
	let y = getRandom(-1,1);
	let length = Math.sqrt(x*x + y*y);
	if(length == 0){ // very unlikely
		x=1; // point right
		y=0;
		length = 1;
	} else{
		x /= length;
		y /= length;
	}

	return {x:x, y:y};
}

function getRandom(min, max) {
	return Math.random() * (max - min) + min;
}

function getRandomInt(min, max)
{
	return Math.floor(Math.random() * max) + min;
}

// returns mouse position in local coordinate system of element
function getMouse(e){
	var mouse = {}; // make an object
	mouse.x = e.pageX - e.target.offsetLeft;
	mouse.y = e.pageY - e.target.offsetTop;
	return mouse;
}

function rectsIntersect(a,b)
{
	if (a.x < b.x + b.width &&
		a.x + a.width > b.x &&
		a.y < b.y + b.height &&
		a.height + a.y > b.y) {
		return true;
		 // Collision detected!
	 }
	 else
	 {
		 return false;
	 }
}

function xReflection(array, index)
{
	if(array[index].width <= 10)
	{
		array[index].reflectX();
		array[index].move();
	}
}

function yReflection(array,index)
{
	if(array[index].width <= 10)
	{
		array[index].reflectY();
		array[index].move();
	}
}