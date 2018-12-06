//create the needed variables
//get canvas and the context
var canvas = document.querySelectorAll("#myCanvas")[0];
var shape = canvas.getContext("2d");
var isSun;
var dragging;
var mouseX;
var mouseY;
var dragHoldX;
var dragHoldY;
var move2;
var path = false;
var clear = false;
var velVector;
var makeVector = false;
var makeVector2 = false;
var velx = 0;
//set initial velocity in the y-direction to start an orbit
var vely = -0.8;
var angle;
//create object for earth specifying x, y coordinates, radius, and mass
var earth = {
	x: canvas.width / 2 + 170,
	y: canvas.height / 2,
	r: 20,
	m: 5.972 * Math.pow(10, 6)
};
//create object for sun specifying x, y coordinates, radius, and mass
var sun = {
	x: canvas.width / 2 - 50,
	y: canvas.height / 2,
	r: 80,
	m: 1.989 * Math.pow(10, 12)
}

//draw the sun and earth to the canvas
draw();
//add an event that moves the circles if clicked down
myCanvas.addEventListener("mousedown", mouseDownListener, false);

//on ready function to create the sliders
$( function() {
	//slider for the sun's mass with starting value at 1, range is 0.5-2 and it moves in steps of 0.01
    $( "#slideSun" ).slider({
      value: 1,
      min: 0.5,
      max: 2,
      step: 0.01,
      slide: function( event, ui ) {
      	sun.r = 80;
      	sun.m = 1.989 * Math.pow(10, 12);
        $( "#slideSunText" ).html( "Star Mass: " + ui.value + "x Original Mass");
        //multiply mass by the current value of the slider to get new mass
        sun.m *= ui.value;
        //change the radius based on the square root of the value on the slider
        sun.r *= Math.sqrt(ui.value);
        //draw the new sized sun shape
        draw();
      }
    });

   	//slider for the earth's mass with starting value at 1, range is 0.5-2 and it moves in steps of 0.01
    $( "#slideEarth" ).slider({
      value: 1,
      min: 0.5,
      max: 2,
      step: 0.01,
      slide: function( event, ui ) {
      	earth.r = 20;
      	earth.m = 5.972 * Math.pow(10, 6);
        $( "#slideEarthText" ).html( "Planet Mass: " + ui.value + "x Original Mass");
        //multiply mass by the current value of the slider to get the new mass
        earth.m *= ui.value;
        //change the radius based on the square root of the value on the slider
        earth.r *= Math.sqrt(ui.value);
        //draw the new sized earth shape
        draw();
      }
    });
} );

//method that initiates the animation of the orbit
function move() {
	//once play is pressed, it can't be pressed again
	$("#play").prop("disabled", true);

	//assign move2 to be a setInterval so it repeats the method every 10 ms
	//causes a continuous animation
	move2 = setInterval(function() {
		//calculate the force using f = GMm/r^2
		var force = (6.67 * Math.pow(10, -11) * sun.m * earth.m) / (Math.pow((earth.x - sun.x), 2) + Math.pow((earth.y - sun.y), 2));
		//calculate the angle the earth makes with the horizontal with arctan
		angle = Math.atan(Math.abs(earth.y - sun.y)/Math.abs(earth.x - sun.x));
		//get the force in the x and y directions by multipling the force by cos and sin of the angle
		var forcex = Math.cos(angle)*force;
		var forcey = Math.sin(angle)*force;
		
		//this edits the force in the correct direction based on which quadrant the earth is in
		//earth is in the 4th quadrant
		if((earth.y - sun.y) > 0 && (earth.x - sun.x) > 0){		
			forcex *= -1;
			forcey *= -1;
		//earth is in 1st quadrant
		} else if ((earth.y - sun.y) < 0 && (earth.x - sun.x) > 0){
			forcex *= -1;
		//earth is in 3rd quadrant
		} else if ((earth.y - sun.y) > 0 && (earth.x - sun.x) < 0){
			forcey *= -1;
		} //no need to change signs on the force in the 2nd quadrant because they are both positive

		//calculate the acceleration in both axes with the fixed forces 
		var accelx =  forcex / earth.m;
		var accely =  forcey / earth.m;

		//change the velocities in both directions by adding the acceleration multiplied by a constant
		//in the respective direction 
		velx += accelx * 4;
		vely += accely * 4;

		//find the new x and y coordinates by adding the velocity multiplied by a constant 
		//in their respective directions
		//4 was chosen becuase the earth traveled at a reasonable speed on the screen with that constant
		earth.x += velx * 4;
		earth.y += vely * 4;

		//decide whether to show the path of the orbit
		//clear is a global variable that decides whether to clear the canvas or not
		//it should only clear on the first iteration to get rid of the earth on the screen
		//path is a global variable that determines if a path should be drawn (value is changed through a checkbox)
		if(path && clear){
			shape.clearRect(0, 0, canvas.width, canvas.height);
			drawPath();
			clear = false;
		}else if (path){
			drawPath();
		//if we don't want to draw a path, then just draw normally (regular planet orbiting)
		} else{
			draw();
			clear = true;
		}

		//determine if there is a collision occurring between the two masses
		collision();

		//makeVector is a global variable that decides whether or not to draw the velocity vector (controlled by a checkbox)
		if (makeVector){
			//draw the vector based on the velocity of the earth in both directions
			drawArrow(earth.x, earth.y, earth.x+velx*200, earth.y+vely*200, "green");
		}

		//makeVector2 is a global variable that decides whether or not to draw the 2 force of gravity vectors (controlled by a checkbox)
		if (makeVector2){
			//draw the vectors based on the forces in x and y direction
			drawArrow(sun.x, sun.y, sun.x-forcex/70, sun.y-forcey/70, "blue");
			drawArrow(earth.x, earth.y, earth.x+forcex/70, earth.y+forcey/70, "blue");
		}

	}, 10);
}

//stops the animation and undisables the play button
function stop() {
	clearInterval(move2);
	$("#play").prop("disabled", false);
}

//draw the shapes onto the screen
function draw() {
	//clear the canvas
	shape.clearRect(0, 0, canvas.width, canvas.height);
	//draw the earth
	shape.beginPath();
	shape.arc(earth.x, earth.y, earth.r, 0, 2 * Math.PI, false);
	shape.fillStyle = "brown";
	shape.fill();
	shape.closePath();

	//draw the sun
	shape.beginPath();
	shape.arc(sun.x, sun.y, sun.r, 0, 2 * Math.PI, false);
	shape.fillStyle = "yellow";
	shape.fill();
	shape.closePath();
}

//draws the path of the orbit (same method as draw() except it doesn't clear the canvas)
function drawPath(){
	//draw path shape
	shape.beginPath();
	shape.arc(earth.x, earth.y, 3, 0, 2 * Math.PI, false);
	shape.fillStyle = "green";
	shape.fill();
	shape.closePath();

	//draw sun
	shape.beginPath();
	shape.arc(sun.x, sun.y, sun.r, 0, 2 * Math.PI, false);
	shape.fillStyle = "yellow";
	shape.fill();
	shape.closePath();
}

//method decides what to do if the mouse is pressed down (ultimately, to move one of the circles)
function mouseDownListener(evt) {
	//getting mouse position correctly, being mindful of resizing that may have occured in the browser
	var bRect = myCanvas.getBoundingClientRect();
	//determine mouse x and y positions on the canvas
	mouseX = (evt.clientX - bRect.left) * (canvas.width / bRect.width);
	mouseY = (evt.clientY - bRect.top) * (canvas.height / bRect.height);
	//find which shape was clicked
	if (hitTest(sun, mouseX, mouseY)) {
		dragging = true;
		isSun = true;
		//We will pay attention to the point on the object where the mouse is "holding" the object
		dragHoldX = mouseX - sun.x;
		dragHoldY = mouseY - sun.y;
	} else if (hitTest(earth, mouseX, mouseY)) {
		dragging = true;
		isSun = false;
		//We will pay attention to the point on the object where the mouse is "holding" the object
		dragHoldX = mouseX - earth.x;
		dragHoldY = mouseY - earth.y;
	}

	//if mouse is dragging then add the mouseMoveListener
	if (dragging) {
		window.addEventListener("mousemove", mouseMoveListener, false);
	}

	//remove the mouseDownListener and add the mouseUpListener to decide what to do when mouse is released
	myCanvas.removeEventListener("mousedown", mouseDownListener, false);
	window.addEventListener("mouseup", mouseUpListener, false);

	//prevents mouse from having an effect on the browser window
	if (evt.preventDefault) {
		evt.preventDefault();
	} else if (evt.returnValue) {
		evt.returnValue = false;
	}
	return false;
}

//returns whether the mouse has clicked on the earth or sun
function hitTest(shape, mx, my) {
	//look at the x and y differences in where the mouse clicked and where the object is 
	var dx = mx - shape.x;
	var dy = my - shape.y;
	//a "hit" will be registered if the distance away from the center is less than the radius of the circular object		
	return (dx * dx + dy * dy < shape.r * shape.r);
}

//once mouse is released, add back the mouseDownListener, remove the mouseUpListener 
//and if dragging, the also remove the mouseMoveListener
function mouseUpListener(evt) {
	myCanvas.addEventListener("mousedown", mouseDownListener, false);
	window.removeEventListener("mouseup", mouseUpListener, false);
	if (dragging) {
		dragging = false;
		window.removeEventListener("mousemove", mouseMoveListener, false);
	}
}

//method that does the moving of the actual objects
function mouseMoveListener(evt) {
	//if it's the sun being moved then the shape radius is the sun, if not, then it's the earth
	if (isSun) 
		var shapeRad = sun.r;
	else 
		var shapeRad = earth.r;

	var posX;
	var posY;
	var minX = shapeRad;
	var maxX = canvas.width - shapeRad;
	var minY = shapeRad;
	var maxY = canvas.height - shapeRad;
	//getting mouse position correctly 
	var bRect = myCanvas.getBoundingClientRect();
	mouseX = (evt.clientX - bRect.left) * (canvas.width / bRect.width);
	mouseY = (evt.clientY - bRect.top) * (canvas.height / bRect.height);
	//clamp x and y positions to prevent object from dragging outside of canvas
	posX = mouseX - dragHoldX;
	posX = (posX < minX) ? minX : ((posX > maxX) ? maxX : posX);
	posY = mouseY - dragHoldY;
	posY = (posY < minY) ? minY : ((posY > maxY) ? maxY : posY);

	//if it's the sun, then move the sun to the new position, if not, move the earth to the new position
	if (isSun) {
		sun.x = posX;
		sun.y = posY;
	} else {
		earth.x = posX;
		earth.y = posY;
	}

	//draw the newly moved objects
	draw();
	//determine if there is a collision during dragging of the object
	collision();
}

//method that destroys the earth, if the sun and earth collide
function collision(){
	//if the distance between the earth and sun is smaller than the two radii added together, then there is a collision
	if (Math.abs(earth.x-sun.x) < (earth.r+sun.r) && Math.abs(earth.y-sun.y) < (earth.r+sun.r) && 
		Math.sqrt((Math.pow((earth.x - sun.x), 2) + Math.pow((earth.y - sun.y), 2))) < (earth.r+sun.r)){
			//flash planet destroyed on the screen
			$('#destroyed').html("<h1> Planet Destroyed </h1>");
			$('#destroyed').fadeIn();
     		$('#destroyed').effect("highlight", {color: 'red'}, 600);
     		$('#destroyed').effect("highlight", {color: 'red'}, 600);
     		$('#destroyed').fadeOut();

     		//clear only the earth off the screen
			shape.clearRect(0, 0, canvas.width, canvas.height);
			shape.beginPath();
			shape.arc(sun.x, sun.y, sun.r, 0, 2 * Math.PI, false);
			shape.fillStyle = "yellow";
			shape.fill();
			shape.closePath();
			//get rid of the earth from existence
			earth.r = 0;
			earth.x = NaN;
			earth.y = NaN; 
	}
}

//resets everything back to the original settings
function reset(){
	//stops the animation
	stop();

	//uncheck all checkboxes and get rid of all vectors or paths being shown
	$("input:checkbox").prop('checked', false); 
	makeVector = false;
	makeVector2 = false;
	path = false;

	//undisable any checkboxes that have been disabled and enable the sliders 
	$(".checkbox").prop("disabled", false);
	$("#slideSun").slider("enable");
	$("#slideEarth").slider("enable");

	//reset the slider values to their original position and earth and sun sizes
	$("#slideEarth").slider({value: 1});
	earth.r = 20;
    earth.m = 5.972 * Math.pow(10, 6);
    $( "#slideEarthText" ).html( "Planet Mass: 1x Original Mass");

	$("#slideSun").slider({value: 1});
	sun.r = 80;
	sun.m = 1.989 * Math.pow(10, 12);
    $( "#slideSunText" ).html( "Star Mass: 1x Original Mass");

    //make the initial velocity the same as the start
	velx = 0;
	vely = -0.8;

	//reset the locations back to their initial locations
	earth.x = canvas.width / 2 + 170;
	earth.y = canvas.height / 2;
	sun.x = canvas.width / 2 - 50;
	sun.y = canvas.height / 2; 

	//redraw everything onto the canvas
	draw();
}

//method decides what to do if the path box is checked
function showPath(box) {
	if (box.is(":checked")) {
		//if checked then create the path
		path = true;
		clear = true;
		//disable everything other than the path checkbox
		$(".checkbox").prop("disabled", true);
		$(".checkbox").prop("checked", false);
		$("#slideSun").slider("disable");
		$("#slideEarth").slider("disable");
		//stop the showing of the force of gravity vector and the velocity vector
		makeVector = false;
		makeVector2 = false;

		//prevent anything from being moved with the mouse
		myCanvas.removeEventListener("mousedown", mouseDownListener, false);
	} else {
		//stop the path from being made
		path = false;
		clear = false;
		//enable everything back
		$(".checkbox").prop("disabled", false);
		$("#slideSun").slider("enable");
		$("#slideEarth").slider("enable");
		
		//add back the dragging of objects with the mouse
		myCanvas.addEventListener("mousedown", mouseDownListener, false);
	}
}

function velocityVector(box) {
	//if the box is checked off for the velocity vector then show the vector
	if (box.is(":checked")) {
		makeVector = true;
	//if not stop showing the vector 
	} else {
		makeVector = false;
		draw();
	}
}

function gravityVector(box) {
	//if the box is checked off for the force of gravity vector then show the vector
	if (box.is(":checked")) {
		makeVector2 = true;
	//if not stop showing the vector 
	} else {
		makeVector2 = false;
		draw();
	}
}

//method draws an arrow given a start point and an end point
function drawArrow(fromx, fromy, tox, toy, colour){
    var headlen = 10;   
    var angle = Math.atan2(toy-fromy,tox-fromx);
    shape.beginPath();
    shape.moveTo(fromx, fromy);
    shape.lineWidth = 4;
    shape.lineTo(tox, toy);
    shape.moveTo(tox, toy);
    shape.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
    shape.moveTo(tox, toy);
    shape.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
    shape.strokeStyle = colour;
    shape.stroke();
    shape.closePath();
}