var Communicator = function(element) {
    var widget = Communicator.widgetFromElement(element);
    this.title = widget.getElementsByTagName("h2")[0];
    this.iframe = widget.getElementsByTagName("iframe")[0];

    /* Force same origin if the domain cannot be extracted */
    var match = this.iframe.src.match(/^(https?:\/\/.+?)\/.*$/);
    this.domain = (match) ? match[1] : "/";
}

Communicator.prototype.setTitle = function(title) {
    if (!title) {
        this.iframe.contentWindow.postMessage("getFrameTitle", this.domain);
    } else {
        this.title.lastChild.textContent = title;
    }
}

/* Static part of the Communicator object */

Communicator.listen = function() {
    window.addEventListener("message", Communicator.handleMessages, false);    
}

Communicator.handleMessages = function(e) {
    var iframe = Communicator.containerFromSource(e.source);

    if (iframe) {
        /* When the widget is loaded,
           append a new property to the iframe element */
        if (e.data == "loaded") {
            iframe._com = new Communicator(iframe);
            iframe._com.setTitle("Loaded!");

        /* Handle messages and dispatch request to proper object */
        } else if (iframe._com) {
            if (e.data.indexOf("title:") == 0) {
                iframe._com.setTitle(e.data.substr(6));
            }
        }
    }
}

Communicator.containerFromSource = function(source) {
    var widgets = document.getElementsByClassName("widget");
    for (var i = 0; i < widgets.length; i++) {
        var iframe = widgets[i].getElementsByTagName("iframe")[0];
        if (iframe.contentWindow == source) {
            return iframe;
        }
    }    
}

Communicator.widgetFromElement = function(o) {
    return (o && o.className != "widget") ?
        Communicator.widgetFromElement(o.parentNode) : o;
}
