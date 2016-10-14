function init() {
	var m = 8;			// Covers count
	var s = 360 / m;	// Color step

    /* Add left and right covers */
    var o = document.getElementById("left");
    createCovers(o, m, s);
    o = document.getElementById("right");
    createCovers(o, m, s);

    /* Add current cover */
    o = document.getElementById("coverflow");
    createCovers(o, 1, 0);
    o.lastChild.className ="current";
}

function createCovers(o, max, step) {
    var color = step;
    for (var n = 0; n < max; n++, color += step) {
        var span = document.createElement("span");
        span.style.backgroundColor = "hsl(" + (color) + ",100%, 50%)";
        o.appendChild(span);
    }
}

var animate = false;

function slide(dir) {
	var c1 = (document.getElementById("left").childNodes.length == 1);
	var c2 = (document.getElementById("right").childNodes.length == 1);

	if (animate || (c1 && dir == +1) || (c2 && dir == -1)) {
		return;
	}
	animate = true;
    document.getElementById("coverflow").className = "slide";

    /* Move covers */
    moveSides("left", dir, +1);
    moveSides("right", dir, -1);
    moveCurrent(dir);

    var current = document.querySelector(".current");
    current.addEventListener("webkitTransitionEnd", function(event) {
        this.removeEventListener(event.type, arguments.callee, false);

        document.getElementById("coverflow").className = "flip";
        prepareFlipSide(dir);
        prepareFlipCurrent(dir);
    }, false);
}

function moveSides(str, dir, coef) {
    var s = document.getElementById(str).childNodes;
    for (var n = 0; n < s.length; n++) {
        s[n].style.webkitTransform = getMatrix(s[n], dir, coef, 30);
    }
}

function moveCurrent(dir) {
    var s = document.querySelector(".current");
    var styles = window.getComputedStyle(s);

    var matrix = new WebKitCSSMatrix(styles.webkitTransform);
    matrix = matrix.translate(30 * dir, 0, 0);
    s.style.webkitTransform = matrix;
}

function getMatrix(s, dir, coef, move) {
    var styles = window.getComputedStyle(s);
    var matrix = new WebKitCSSMatrix(styles.webkitTransform);

    /* Read values from the matrix */
    var angle = Math.acos(matrix.m11) * 180 / Math.PI * coef;
    var x = matrix.m41 + move * dir;
    var y = matrix.m42;
    var z = matrix.m43;

    /* Return a new matrix */
    return new WebKitCSSMatrix().translate(x, 0, z).rotate(0, angle, 0);
}

function prepareFlipSide(dir) {
    var s = document.getElementById(dir > 0 ? "left" : "right").firstElementChild;
    s.style.webkitTransform = "translateX(" + (dir * 80) + "px)";
}

function prepareFlipCurrent(dir) {
    var current = document.querySelector(".current");

    /* Apply a new matrix based on the style of the side covers */
    var base = document.getElementById(dir < 0 ? "left" : "right").firstElementChild;
    current.style.webkitTransform = getMatrix(base, dir, -dir, (80 - 30));

    current.addEventListener("webkitTransitionEnd", function() {
        this.removeEventListener(event.type, arguments.callee, false);

        /* Reset elements to their initial state */
        reset("left");
        reset("right");
        document.getElementById("coverflow").className = "";
        this.style.webkitTransform = "";
        this.className = "";

        /* Append the current cover to its new parent */
        var c, e = document.getElementById(dir < 0 ? "left" : "right");
        e.insertBefore(this, e.firstElementChild);

        /* Append the new current cover to the main container */
        e = document.getElementById(dir > 0 ? "left" : "right");
        c = e.firstElementChild;
        e.parentNode.appendChild(c);
        c.className = "current";
		animate = false;
    }, false);
}

function reset(str) {
	var s = document.getElementById(str).childNodes;
	for (var n = 0; n < s.length; n++) {
		s[n].style.webkitTransform = "";
	}
}
