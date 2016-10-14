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

initChevron("chevron-normal", "hsl(0, 0%, 50%)");
initChevron("chevron-active", "hsl(0, 0%, 100%)");

function initChevron(id, style) {
   var context = document.getCSSCanvasContext("2d", id, 22, 13);

    context.save();

    context.clearRect(0, 0, 20, 13);
    context.strokeStyle = style;
    context.lineWidth = 3;

    context.beginPath();
    context.moveTo(4, 1);
    context.lineTo(10, 6.5);
    context.lineTo(4, 12);
    context.stroke();

    context.restore();
}
