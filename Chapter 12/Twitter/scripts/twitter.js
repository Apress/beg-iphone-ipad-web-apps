var spinner = new BigSpinner();

function init() {
	spinner.init("spinner", "white");
	
	var xml = new XMLHttpRequest();
	xml.onreadystatechange = showTrends;
	xml.open("get", "proxy.php?url=" +
		encodeURIComponent("http://api.twitter.com/1/trends.json"));
	xml.send();
}

function showTrends() {
	if (this.readyState == this.OPENED) {
		buttonState(true);
		
	} else if (this.readyState == this.DONE && this.status == 200) {
		var txt = this.responseText;
		var json = getJSON(txt);

		if (json) {
			renderTrends(json);
			buttonState(false);
		}
	}
}

function buttonState(loading) {
	var but = document.querySelector("button.header-button");

	if (loading) {
		but.className += " spinning";
		but.disabled = true;
		spinner.animate();
	} else {
		but.className = but.className.replace(" spinning", "");
		spinner.stop();
	}
}

function renderTrends(feed) {
	var list = document.getElementById("trends");
	var template = list.innerHTML;
	var trends = feed.trends;
	var html = "";

	for (var n = 0; n < trends.length; n++) {
		html += applyTemplate(template, trends[n]);
	}

	appendContent(list, html);
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

function getJSON(s) {
    var check = s.replace(/\\./g, '').replace(/"[^"\\]*"/g, '');
    var regexp = /^[,:{}\[\]\s\d\.\-+eEfalr-un]*$/;

    if (regexp.test(check)) {
        try {
            return eval('(' + s + ')');
        } catch(e) {
            /* Ignore */
        }
    }
    return null;
}

function applyTemplate(template, data) {
    var item, regexp = /#\{(\w+)\}/g;
    var index = 0;

    while (item = regexp.exec(template)) {
        var pattern = new RegExp(item[0], "g");
        template = template.replace(pattern, data[item[1]]);

        var last = regexp.lastIndex;
        regexp.lastIndex = index;
        index = last;
    }

    return template;
}
