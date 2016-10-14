document.addEventListener("touchstart", new Function(), false);

if (!window.navigator.standalone) {
    document.addEventListener("DOMContentLoaded", adjustHeight, false);
	window.addEventListener("orientationchange", adjustHeight, false);
} else {
    /* Target only standalone mode */
    document.addEventListener("click", clickHandler, true);
}

function adjustHeight() {
    var html = document.documentElement;
    var size = window.innerHeight;

    html.style.height = (size + size) + "px";
    window.setTimeout(function() {
        if (window.pageYOffset == 0) {
            window.scrollTo(0, 0);
        }
        html.style.height = window.innerHeight + "px";
    }, 0);
}

/* Chevron code */

/* Initial document in plain text so that it is easy to modify */
var chevron = '<svg xmlns="http://www.w3.org/2000/svg" width="23" height="13"><polyline fill="none" stroke="ADD_COLOR" stroke-width="3" points="4,1 10,6.5 4,12" /></svg>';

/* URL encode the string */
chevron = encodeURIComponent(chevron);

chevron = "data:image/svg+xml;charset=utf-8," + chevron;

var list = { "chevron": chevron };
applySVGBackground();

function applySVGBackground() {
    /* Get all CSS attached to the document */
    var css = document.styleSheets;

    /* Parse them all looking for a background url() */
    for (var i = 0; i < css.length; i++) {
        var rules = css[i].rules;

        for(var j = 0; j < rules.length; j++) {
            var rule = rules[j].style.getPropertyCSSValue("background-image");

            /* Return an single objet, an empty collection.
               Be sure to always have a list of objects */
            if (!rule) {
                continue;
            } else if (!rule.length) {
                rule = [rule];
            }

            for (var k = 0; k < rule.length; k++) {
                /* Only handle certain objects */
                if (!rule[k].getStringValue) {
                    continue;
                }

                var r = rule[k],
                    text = r.getStringValue(r.CSS_URI) || "";

                /* If we have a hash, try to apply the SVG style */
                var start = text.indexOf("#");
                if (start != -1) {
                    var defs = text.substr(start + 1).split(",");
                    r.setStringValue(r.CSS_URI, getSVG(defs[0], defs[1]));
                }
            }
        }
    }
}

function getSVG(id, color) {
    if (list[id] != undefined) {
        color = color.replace("[", "%28").replace("]", "%29");
        return list[id].replace("ADD_COLOR", color);
    }
}


