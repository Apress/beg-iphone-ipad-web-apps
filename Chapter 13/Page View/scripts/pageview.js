var PageView = function(target) {
    this.target = target;
    this.state = this.WAITING;

    /* Initialization phase */
    this.createElements();
    this.registerEvents();
    this.sendEvent();
}

/* The PageView is waiting for a user action */
PageView.prototype.__defineGetter__("WAITING",   function() { return 0 });

/* The user is pointing to the PageView container */
PageView.prototype.__defineGetter__("ATTACHED",  function() { return 1 });

/* The user released the container and the PageView is moving to its new position */
PageView.prototype.__defineGetter__("DETACHING", function() { return 2 });

PageView.prototype.createElements = function() {
    /* Create a pages group */
    this.group = document.createElement("div");
    this.group.className = "pageview-group";
	this.group.style.webkitTransitionDuration = 0;
    this.target.appendChild(this.group);

    /* Add the 3 pages */
    for (var n = 0; n < 3; n++) {
        var div = document.createElement("div");
        this.group.appendChild(div);
    }
}

PageView.prototype.registerEvents = function() {
    this.target.addEventListener("touchstart", this, false);
    this.target.addEventListener("touchmove", this, false);
    this.target.addEventListener("touchend", this, false);
}

PageView.prototype.handleEvent = function(event) {
    switch (event.type) {
        case "webkitTransitionEnd":
            this.moveNodes();
            break;

        case "touchstart":
        case "touchmove":
        case "touchend":
            var handler = event.type + "Handler";
            this[handler](event);
    }
}

PageView.prototype.touchstartHandler = function(event) {
    if (this.state == this.DETACHING) {
        return;
    }
    this.state = this.ATTACHED;
    this.origin = event.touches[0].pageX;
    event.preventDefault();
}

PageView.prototype.touchmoveHandler = function(event) {
    if (this.state != this.ATTACHED) {
        return;
    }
    var distance = event.touches[0].pageX - this.origin;
    this.group.style.webkitTransform = "translate3d(" + distance + "px, 0, 0)";
}

PageView.prototype.touchendHandler = function(event) {
    if (this.state == this.DETACHING) {
        return;
    }

    var matrix = new WebKitCSSMatrix(this.group.style.webkitTransform);
    if (matrix.e == 0) {
        this.state = this.WAITING;
    } else {
        var jump = this.target.offsetWidth;
        matrix.e = (matrix.e > 0) ? +jump : -jump;

        this.group.addEventListener("webkitTransitionEnd", this, false);
        this.group.style.webkitTransitionDuration = "";
        this.group.style.webkitTransform = matrix;
        this.state = this.DETACHING;
    }
}

PageView.prototype.moveNodes = function() {
    var matrix = new WebKitCSSMatrix(this.group.style.webkitTransform);
    var first = this.group.firstChild;

    if (matrix.e < 0) {
        this.group.appendChild(first);
    } else {
        var last = this.group.lastChild;
        this.group.insertBefore(last, first);
    }

    this.group.removeEventListener("webkitTransitionEnd", this, false);
    this.group.style.webkitTransitionDuration = 0;
    this.group.style.webkitTransform = "";
    this.state = this.WAITING;
    this.sendEvent(matrix.e);
}

PageView.prototype.sendEvent = function(dir) {
    /* Create a new Event instance */
    var type, event = document.createEvent("Event");

    /* Prepare the event type */
    if (dir > 0) {
        type = "PageMovedRight";
    } else if (dir < 0) {
        type = "PageMovedLeft";
    } else {
        type = "PageChanged";
    }

    /* Initialize the new event */
    var vendor = "book";
    event.initEvent(vendor + type, false, false);

    /* Add a 'pages' property to the Event object */
    var nodes = this.group.childNodes;
    event.pages = {
        left:  nodes[0],
        view:  nodes[1],
        right: nodes[2]
    };

    /* Dispatch the vent to the target */
    this.target.dispatchEvent(event);
}
