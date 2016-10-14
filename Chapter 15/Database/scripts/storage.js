var spinner = new BigSpinner();

function init() {
    spinner.init("spinner", "white");
	checkDatabase(globalDB);
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

function processFeed(db) {
    db.transaction(function (tran) {
        tran.executeSql("\
            SELECT Title AS title, Content AS content, \
                Date AS date, TargetURL AS link \
            FROM News ORDER BY Date DESC \
            LIMIT 10", null, processFeedCallback
        );
    });
}

function processFeedCallback(tran, res) {
    var all = res.rows;
    var list = document.getElementById("feed");
    if (sessionStorage.template == undefined) {
        sessionStorage.template = list.innerHTML;
    }

    /* Compute resulting HTML */
    var html = "";
    for (var i = 0; i < all.length; i++) {
        var data = all.item(i);
        html += applyTemplate(sessionStorage.template, data, formatters);
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


