var Rect = function() {
    var i = Infinity;
    this.coords = new WebKitPoint(+i, +i);
    this.extent = new WebKitPoint(-i, -i);
}

Rect.prototype.adjust = function(x, y) {
    if (x < this.coords.x) {
        this.coords.x = x;
    }
    if (x > this.extent.x) {
        this.extent.x = x;
    }
    if (y < this.coords.y) {
        this.coords.y = y;
    }
    if (y > this.extent.y) {
        this.extent.y = y;
    }
}

Rect.prototype.fit = function() {
    var w = (this.extent.x - this.coords.x + 1);
    var h = (this.extent.y - this.coords.y + 1);

    if ((w / h) > 4 || (h / w) > 4) {
        var ax = w < h ? w : 0; 
        var ay = w < h ? 0 : h;

        this.coords.x -= ax;
        this.extent.x += ax;
        this.coords.y -= ay;
        this.extent.y += ay;
    }
}

var Recognizer = function(element, interpreter) {
    this.element = element;
    this.element.addEventListener("touchstart", this, false);
    this.interpreter = interpreter;

    this.strokes = [];
    this.autoEndTimer = null;
    this.strokeSource = null;
}

Recognizer.prototype.handleEvent = function(event) {
    var x = event.changedTouches[0].pageX;
    var y = event.changedTouches[0].pageY;
    var t = event.type;

    if (event.touches.length != 1) {
        t = "touchend"; 
    }

    switch (t) {
        case "touchstart":
            this.saveSource(event.touches[0].target);
            this.startStroke();
            this.savePoint(x, y);
            this.doAutoEnd();
            break;

        case "touchmove":
            this.savePoint(x, y);
            this.doAutoEnd();
            break;

        case "touchend":
            this.endStroke();
            this.savePoint(x, y);
            this.doAutoEnd();
            break;
    }

    event.preventDefault();
}

Recognizer.prototype.saveSource = function(node) {
    if (!this.strokeSource) {
        if (node.nodeType == node.TEXT_NODE) {
            node = node.parentNode;
        }
        this.strokeSource = node;
    }
}

Recognizer.prototype.startStroke = function() {
    this.strokes.push({
        points: [],
        bound : new Rect()
    });
    this.element.addEventListener("touchmove", this, false);
    this.element.addEventListener("touchend", this, false);
}

Recognizer.prototype.savePoint = function(x, y) {
    var stroke = this.strokes[this.strokes.length - 1];
    stroke.points.push(new WebKitPoint(x, y));
    stroke.bound.adjust(x, y);
}

Recognizer.prototype.doAutoEnd = function() {
    if (this.autoEndTimer) {
        window.clearTimeout(this.autoEndTimer);
    }
    var that = this;
    this.autoEndTimer = window.setTimeout(function() {
        that.endStroke();
        that.finalizeStrokes();
    }, 500);
}

Recognizer.prototype.endStroke = function() {
    this.element.removeEventListener("touchmove", this, false);
    this.element.removeEventListener("touchend", this, false);
}

Recognizer.prototype.finalizeStrokes = function() {
    var signature = [];

    for (var m = 0; m < this.strokes.length; m++) {
        var bound  = this.strokes[m].bound;
        var points = this.strokes[m].points;

        bound.fit();
        var w = (bound.extent.x - bound.coords.x + 1) / 3;
        var h = (bound.extent.y - bound.coords.y + 1) / 3;

        for (var n = 0; n < points.length - 1; n++) {
            var px = points[n].x - bound.coords.x;
            var py = points[n].y - bound.coords.y;
            var mx = px / w << 0;    // The bit shift operator allows
            var my = py / h << 0;    // very quick Math.floor()

            var value = my * 3 + mx + 1;
            if (value != signature[signature.length - 1]) {
                signature.push(value);
            }
        }
    }

    this.strokes = [];
    this.interpreter(signature.join(''), this.strokeSource);
	this.strokeSource = null;
}

/* Client code */

function interpreter(signature, source) {
    switch (signature) {
        case "456":    // O--->
            sendEvent("SwipeRight", source);
            break;

        case "654":    // <---O
            sendEvent("SwipeLeft", source);
            break;

        default:
            console.log("Unknown stroke received " + signature);
    }
}

function sendEvent(type, target) {
    var vendor = "book";
    var event = document.createEvent("Event");

    event.initEvent(vendor + type, true, false);
    target.dispatchEvent(event);
}

function init() {
    var ul = document.getElementsByTagName("ul")[0];
    var rs = new Recognizer(ul, interpreter);

    /* Change the text color on right-to-left swipe event */
    ul.addEventListener("bookSwipeLeft", function(event) {
        var style = event.target.style;
        style.color = style.color ? "" : "red";
    }, false);

    /* Change the text weight on left-to-right swipe event */
    ul.addEventListener("bookSwipeRight", function(event) {
        var style = event.target.style;
        style.fontWeight = style.fontWeight ? "" : "bold";
    }, false);
}

