var Compass = function(size) {
    this.dialGraduations = new Image();
    this.bearingNeedle   = new Image();
    this.headingNeedle   = new Image();
	this.dialShine       = new Image();

	this.dialGraduations.style.webkitTransitionDuration = "2s";
	this.bearingNeedle.style.webkitTransitionDuration   = "5s";
	this.headingNeedle.style.webkitTransitionDuration   = "3s";

    this.builder = document.createElement("canvas");
    this.setSize(size);
}

Compass.prototype.setSize = function(size) {
    /* Original size of the canvas = 140x140 */
    var scale = size / 140;
    this.builder.width  = 140 * scale;
    this.builder.height = 140 * scale;

    this.context = this.builder.getContext("2d");
    this.context.scale(scale, scale);
    this.context.translate(70, 70);
}

Compass.prototype.clear = function() {
    this.context.clearRect(-70, -70, 140, 140);
}

Compass.prototype.render = function(node) {
    this.clear();
    this.drawDialGraduations();
    this.dialGraduations.src = this.builder.toDataURL();

    this.clear();
    this.drawBearingNeedle();
    this.bearingNeedle.src = this.builder.toDataURL();

    this.clear();
    this.drawHeadingNeedle();
    this.headingNeedle.src = this.builder.toDataURL();
    
    this.clear();
    this.drawDialShine();
    this.dialShine.src = this.builder.toDataURL();

    this.clear();
    this.drawCompassFrame();
    this.drawDialBackground();
    this.drawDirectionArrow();

    /* Append nodes to the document */
    node.appendChild(this.builder);
    node.appendChild(this.dialGraduations);
    node.appendChild(this.bearingNeedle);
    node.appendChild(this.headingNeedle);
    node.appendChild(this.dialShine);
}

Compass.prototype.drawDialGraduations = function() {
    var ctx = this.context;
    ctx.save();

    ctx.beginPath();

    ctx.strokeStyle = "white";
    ctx.arc(0, 0, 15, 0, Math.PI * 2, false);
    ctx.stroke();

    /* Draw cardinal points */
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.lineWidth = 0.75;

    for (var n = 0; n < 4; n++) {
        /* Letter place holder */
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, -34, 7, 0, Math.PI * 2, false);
        ctx.fillStyle = "rgba(0, 0, 128, 0.3)";
        ctx.fill();
        ctx.restore();

        /* Cardinal letter */
        ctx.font = "bold 9px Georgia";
        ctx.fillText("NESW".substr(n, 1), 0, -31);

        /*  Inner arrow */
        ctx.beginPath();
        ctx.moveTo(-3, -15);
        ctx.lineTo(0, -30);
        ctx.lineTo(3, -15);
        ctx.fill();

        /* Graduation */
        ctx.beginPath();
        ctx.moveTo(0, -42);
        ctx.lineTo(0, -39);
        ctx.stroke();
        
        /* Next letter... */
        ctx.rotate(90 * Math.PI / 180);
    }

    ctx.rotate(45 * Math.PI / 180);
    for (var n = 0; n < 4; n++) {
        /*  Smaller cardinal letters */
        ctx.font = "bold 5px Georgia";
        ctx.fillText("NESESWNW".substr(n * 2, 2), 0, -34);

        /*  Smaller inner arrow */
        ctx.beginPath();
        ctx.moveTo(-2,-15);
        ctx.lineTo(0, -25);
        ctx.lineTo(2, -15);
        ctx.fill();

        /* Smaller graduation */
        ctx.beginPath();
        ctx.moveTo(0,42);
        ctx.lineTo(0,40);
        ctx.stroke();

        /* Next smaller letters... */
        ctx.rotate(90 * Math.PI / 180);
    }

    /* Graduations */
    ctx.globalAlpha = 0.75;
    for (var n = 0; n < 360 / 5; n++) {
        ctx.beginPath();
        ctx.moveTo(0,42);
        ctx.lineTo(0,41);
        ctx.stroke();
        ctx.rotate(5 * Math.PI / 180);
    }
    
    ctx.restore();
}

Compass.prototype.drawBearingNeedle = function() {
    var ctx = this.context;
    ctx.save();

    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 1;
    ctx.shadowBlur = 2;

    ctx.fillStyle = "rgba(0, 0, 128, 0.75)";
    ctx.strokeStyle = "white";

    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.lineTo(0, -38);
    ctx.lineTo(7, 0);
    ctx.lineTo(0, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

Compass.prototype.drawHeadingNeedle = function() {
    var ctx = this.context;
    ctx.save();

    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 1;
    ctx.shadowBlur = 2;

    /* White part */
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(0, 40);
    ctx.lineTo(5, 0);
    ctx.fillStyle = "white";
    ctx.fill();

    /* Red part */
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(0, -40);
    ctx.lineTo(5, 0);
    ctx.fillStyle = "red";
    ctx.fill();

    /* Emboss effect */
    ctx.beginPath();
    ctx.moveTo(5, 0);
    ctx.lineTo(0, -43);
    ctx.lineTo(0, 43);
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fill();

    /* Screw */
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0 ,Math.PI * 2, false);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

Compass.prototype.drawDialShine = function() {
    var ctx = this.context;
    ctx.save();

    var shine = ctx.createLinearGradient(0, -60, 0, 20);
    shine.addColorStop(0, "white");
    shine.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.lineWidth = 0.25;
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.fillStyle = shine;

    ctx.beginPath();
    ctx.arc(0, 0, 42, Math.PI, Math.PI * 2, false);
    ctx.quadraticCurveTo(0, -17, -43, 0);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

Compass.prototype.drawCompassFrame = function() {
    var ctx = this.context;
    ctx.save();

    var frame = this.context.createRadialGradient(0, 0, 0, 0, 0, 56);
    frame.addColorStop(0.85, "#e7ba5a");
    frame.addColorStop(0.9, "#fcd97c");
    frame.addColorStop(1, "#e7ba5a");

    ctx.beginPath();
    ctx.arc(0, 0, 56, 0, Math.PI * 2, false);
    ctx.strokeStyle = "#444";

    ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 4;
        ctx.stroke();
        ctx.fillStyle = frame;
        ctx.fill();
    ctx.restore();

    /* Shiny effect */
    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.arc(2, 2, 48, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.arc(-2, -2, 48, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.restore();
}

Compass.prototype.drawDialBackground = function() {
    var ctx = this.context;
    ctx.save();

    var back = this.context.createLinearGradient(-50, -50, 50, 50);
    back.addColorStop(0, "#122a91");
    back.addColorStop(1, "#61a1f4");

    ctx.beginPath();
    ctx.fillStyle = back;
    ctx.arc(0, 0, 43, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.moveTo(-1, -38);
    ctx.lineTo(0, -41);
    ctx.lineTo(1, -38);
    ctx.fill();
    
    ctx.restore();
}

Compass.prototype.drawDirectionArrow = function() {
    var ctx = this.context;
    ctx.save();
    ctx.translate(0, -59);

    ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";

    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(0, -10);
    ctx.lineTo(10, 0);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";

    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(10, 0);
    ctx.stroke();

    ctx.restore();
}

Compass.prototype.setBearing = function(deg) {
    this.rotate(this.bearingNeedle, deg);
}

Compass.prototype.setHeading = function(deg) {
    this.rotate(this.headingNeedle, -deg);
    this.rotate(this.dialGraduations, -deg);
}

Compass.prototype.rotate = function(item, deg) {
    var gs = window.getComputedStyle(item);
    var mx = new WebKitCSSMatrix(gs.webkitTransform);

    var current = toDeg(Math.acos(mx.a));
    /* Adjust quadrant */
    if (mx.b < 0) {
        current = 360 - current;
    }
    var delta = deg - current;
    item.style.webkitTransform = mx.rotate(delta);
}

/* Client Code */

const COMPASS_SIZE = 220;

var compass = new Compass(COMPASS_SIZE);

function init() {
    var target = document.querySelector("#compass div");
    target.style.width = COMPASS_SIZE + "px";
    compass.render(target);

    window.navigator.geolocation.watchPosition(successCallback,
        null, { enableHighAccuracy: true });
}

var appleLocation = {
    coords: {
        latitude : 37.331689,
        longitude: -122.030731
    }
}

var prevTime = 0;

function successCallback(position) {
    if ((new Date() - prevTime) < 1500) {
        return;
    }
    prevTime = new Date().getTime();

    /* Append location information */
    var loc = document.getElementById("location");
    loc.textContent = position.coords.latitude + " | " + position.coords.longitude;

    /* Read and compute data */
    var heading  = position.coords.heading || 0;
    var accuracy = position.coords.accuracy;
    var speed    = position.coords.speed;

    var bearing  = computeBearing(position, appleLocation);
    var distance = computeDistance(position, appleLocation);

    /*  Show current formatted heading */
    var header = document.querySelector(".header-wrapper h1");
    header.innerHTML = getAngleString(heading);

    var list = document.querySelectorAll("li span");
    list[0].textContent = round(distance, 3) + "mi";
    list[1].innerHTML   = getAngleString(bearing);
    list[2].textContent = round(speed, 2) + "m/s";
    list[3].textContent = round(accuracy, 2) + "m";

	if (position.coords.heading != null) {
		compass.setHeading(heading);
		compass.setBearing(bearing - position.coords.heading);
	}
}

function getAngleString(angle) {
    var position = ((angle + 45 / 2) / 45 | 0) % 8 * 2;
    return (angle * 10 | 0) / 10 + "&deg;" + ("N NEE SES SWW NW".substr(position, 2));
}

function round(value, prec) {
    prec = Math.pow(10, prec);
    return ((value || 0) * prec << 0) / prec;
}

/* From Data to Math */
/*
function computeDistance(p1, p2) {
    var lat1 = p1.coords.latitude;
    var lat2 = p2.coords.latitude;
    var lng1 = p1.coords.longitude;
    var lng2 = p2.coords.longitude;

    return Math.sqrt( Math.pow(69 * (lat2 - lat1), 2)
        + Math.pow(53 * (lng2 - lng1), 2) );
}
 */

function computeDistance(p1, p2) {
    var lat1 = toRad(p1.coords.latitude);
    var lat2 = toRad(p2.coords.latitude);
    var lng1 = toRad(p1.coords.longitude);
    var lng2 = toRad(p2.coords.longitude);

    var deltaLat = (lat2 - lat1);
    var deltaLng = (lng2 - lng1);

    var calc = Math.pow(Math.sin(deltaLat / 2) , 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLng / 2) , 2);

    return 3959 * 2 * Math.asin(Math.sqrt(calc));
}

/* Convert degree to radian */
function toRad(deg) {
    return deg * Math.PI / 180;
}

function computeBearing(p1, p2) {
    var lat1 = toRad(p1.coords.latitude);
    var lat2 = toRad(p2.coords.latitude);
    var lng1 = toRad(p1.coords.longitude);
    var lng2 = toRad(p2.coords.longitude);

    var deltaLng = (lng2 - lng1);

    var y = Math.cos(lat2) * Math.sin(deltaLng);
    var x = Math.cos(lat1) * Math.sin(lat2) - 
                   Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

    return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/* Convert radian  to degree */
function toDeg(rad) {
    return rad * 180 / Math.PI;
}
