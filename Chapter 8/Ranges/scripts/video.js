function setup() {
    var video = document.getElementsByTagName("video")[0];

    window.setInterval(checkBuffered, 500, video);
    video.addEventListener("timeupdate", checkPlayed, false);
    video.addEventListener("loadedmetadata", adjustVideo, false);
}

function checkBuffered(video) {
    if (video.buffered.length && video.duration) {
        var pos = calcPosition(video.buffered.start(0),
            video.buffered.end(0), video.duration);

        var bar = document.getElementById("buffered");
        updateBar(bar.firstChild, pos);
    }
}

function checkPlayed(event) {
    var video = event.target;

    /* Update the time cursor position */
    var progress = document.getElementById("buffered");
    progress.lastChild.style.left = (video.currentTime / video.duration * 100) + "%";

    /* Update the textual video time progression */
    updateTime(video);

    /* Clear and add played ranges if any */
    var container = document.getElementById("played");
    container.innerHTML = "";

    for (var i = 0; i < video.played.length; i++) {
        var pos = calcPosition(video.played.start(i),
            video.played.end(i), video.duration);

        addRange(container, pos);
    }
}

function addRange(dest, pos) {
    var bar = document.createElement("meter");
    bar.style.backgroundColor =
        "hsl(" + (pos.from * 360 / 100 | 0) + ", 100%, 50%)";

    updateBar(bar, pos);
    dest.appendChild(bar);
}

function calcPosition(start, end, max) {
    return {
        from: (start / max * 100),
        to:   (end   / max * 100)
    }
}

function updateBar(bar, pos) {
    bar.style.width = (pos.to - pos.from) + "%";
    bar.style.marginLeft = pos.from + "%";
}

function updateTime(video) {
    if (video.duration) {
        var elapsed = video.currentTime - video.startTime;
        var state = video.paused ? "Paused" : "Playing";

        document.getElementsByTagName("time")[0].textContent = state + ": " +
            formatTime(elapsed) + " / " +
            formatTime(video.duration) + " (-" +
            formatTime(video.duration - elapsed) + ")";
    }
}

function formatTime(time) {
    /* Do we have hours? */
    var cut = time < 3600 ? 4 : 1;
    var str = "";

    for (var i = 2; i >= 0; i--) {
        var step = Math.pow(60, i);
        var part = (time / step) | 0;             // Quick way to do a Math.floor()

        time -= part * step;
        str  += ":" + ("0" + part).substr(-2);    // Add a leading 0
    }

    return str.substr(cut);
}

function adjustVideo(event) {
    var video = event.target;

    /* Intrinstic size (read only) */
    var vw = video.videoWidth;
    var vh = video.videoHeight;

    /* Element size */
    var ew = video.offsetWidth;    // Could be video.width
    var eh = video.offsetHeight;   // Could be video.height

    /* adjust container size if needed */
    var vratio = vw / vh;
    var eratio = ew / eh;

    if (vratio != eratio){
        video.height = ew / vratio;
    }
}
