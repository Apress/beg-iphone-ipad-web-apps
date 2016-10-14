var spinner = new BigSpinner();
var feedUrl = "http://images.apple.com/main/rss/hotnews/hotnews.rss";

function init() {
    spinner.init("spinner", "white");

    /* Apple's news feed */
    refresh();
}

function refresh() {
    var last = new Date(window.localStorage.feedDate || 0);
    var ttl  = new Date() - 1000 * 60 * 60 * 1;

    if (last <= ttl) {
        var xml = new XMLHttpRequest();
        xml.onreadystatechange = showFeed;
        xml.open("get", "proxy.php?url=" + encodeURIComponent(feedUrl));
        xml.send();
        buttonState(true);
    } else {
        var xml = (new DOMParser()).parseFromString(window.localStorage.feedXML, "text/xml");
        processFeed(xml);
    }
}

function showFeed() {
    if (this.readyState == this.DONE && this.status == 200) {
        /* The date will be serialized as string */
        window.localStorage.feedDate = new Date();  
        window.localStorage.feedXML = this.responseText;
        processFeed(this.responseXML);
        buttonState(false);
    }
}

function processFeed(xml) {
    var arr = [];
    var all = xml.getElementsByTagName("item");
    var list = document.getElementById("feed");
    if (window.sessionStorage.template == undefined) {
        window.sessionStorage.template = list.innerHTML;
    }

    /* Compute resulting HTML */
    var html = "";
    for (var i = 0; i < all.length; i++) {
        var data = {
            title:      getText(all[i], "title"),
            content:    getText(all[i], "description"),
            date:       new Date(getText(all[i], "pubDate")),
            link:       getText(all[i], "link")
        };
        html += applyTemplate(window.sessionStorage.template, data, formatters);
    }

    /* Append content to the document */
    appendContent(list, html);
}

function buttonState(loading) {
    var but = document.querySelector("button.header-button");

    if (loading) {
        but.disabled = true;
        but.className += " spinning";
        spinner.animate();
    } else {
        but.disabled = false;
        but.className = but.className.replace(" spinning", "");
        spinner.stop();        
    }
}

function getText(node, name) {
    var item = node.getElementsByTagName(name);
    return item.length && item[0].hasChildNodes() ?
        item[0].firstChild.nodeValue : null;
}

var formatters = {
    "date": formatDate,
    "content": formatContent
};

function formatDate(value, data) {
    if (typeof value == "string") {
        value = new Date(value);
    }
    return ("0" + value.getDate()).substr(-2) + "/" +
           ("0" + (value.getMonth() + 1)).substr(-2) + " -- ";
}

function formatContent(value, data) {
    return value.replace(/<.+?>/g, "").substr(0, 200) + "...";
}

function applyTemplate(template, data, formatters) {
    var item, regexp = /#\{(\w+)\}/g;
    var index = 0;

    while (item = regexp.exec(template)) {
        var pattern = new RegExp(item[0], "g");

        var value = undefined;
        if (item[1].substr(-9) == "Formatted") {
            var property = item[1].substr(0, item[1].length - 9);
    
            var func = formatters[property];
            if (typeof func == "function") {
                value = func(data[property], data);
            }
        } else {
            value = data[item[1]];
        }
        template = template.replace(pattern, value);

        var last = regexp.lastIndex;
        regexp.lastIndex = index;
        index = last;
    }

    return template;
}

function appendContent(list, html) {
	var dummy = document.createElement("div");
	dummy.innerHTML = html;

	list.innerHTML = "";
	while(dummy.hasChildNodes()) {
		list.appendChild(dummy.firstChild);
	}
	list.className = null;	
}


