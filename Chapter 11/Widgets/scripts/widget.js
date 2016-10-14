var Widget = function(allowed) {
    this.allowed = allowed || [];
}

Widget.prototype.loaded = function() {
    /* The wildcard is not a problem here,
       there is no sensitive data sent to the parent window */
    window.parent.postMessage("loaded", "*");

    /* Prepare message handling */
    var that = this;
    window.addEventListener("message", function(e) {
        that.handleParentMessage(e);
    }, false);
}

Widget.prototype.isAllowed = function(origin) {
    for (var i = 0; i < this.allowed.length; i++) {
        if (origin == this.allowed[i]) {
            return true;
        }
    }
    return false;
}

Widget.prototype.handleParentMessage = function(e) {
    if (this.isAllowed(e.origin)) {
        if (e.data == "getFrameTitle") {
            e.source.postMessage("title:" + this.getTitle(), e.origin);
        }
    }
}

/* Widget action specific part */

Widget.prototype.getTitle = function() {
    return document.title;
}

