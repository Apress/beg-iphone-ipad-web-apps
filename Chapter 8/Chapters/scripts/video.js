
var TimedInfo = function(media, container) {
    this.owner = media;
    this.element = container;

    /* Active track */
    this.current = 0;
    this.chapter = { index: -1 };

    /* Self initialization */
    this.parse();
    var that = this;
    this.owner.addEventListener("timeupdate", function() {
        that.handleTracks();
    }, false);
}

TimedInfo.prototype.parse = function() {
    var tracks = this.owner.getElementsByTagName("track");

    /* Push all available tracks information */
    this.data = [];
    for (var i = 0; i < tracks.length; i++) {
        var l1 = tracks[i].getAttribute("srclang");
        var l2 = window.navigator.language;
        if (tracks[i].getAttribute("kind") != "chapters" &&
            l1.toLowerCase() == l2.toLowerCase()) {
            this.current = i;
        }

        this.data.push({
            kind: tracks[i].getAttribute("kind"),
            src: tracks[i].getAttribute("src"),
            label: tracks[i].getAttribute("label") || "Untitled",
            language: l1,
            readyState: 0
        });
    }
}

TimedInfo.prototype.loadResource = function(index) {
    var that = this;
    var req = new XMLHttpRequest();
    req.open("get", this.data[index].src);
    req.onreadystatechange = function() { that.handleAsyncState(this, index) };
    req.send();
}

TimedInfo.prototype.handleAsyncState = function(req, index) {
    if (req.readyState == 4) {
        if (req.status != 200) {
            this.data[index].readyState = 3;
        } else {
            this.data[index].srt = this.extract(req.responseText);
            this.data[index].readyState = 2;
            this.handleTracks();
        }
    }
}

TimedInfo.prototype.extract = function(text) {
    var i, j, res = [];
    var parts = text.split("\n\n");

    /* Iterate through each block */
    while ((i = parts.shift())) {

        /* Split the block lines ... */
        i = i.split("\n");
        j = i[1].split(" --> ");

        /* ... and take the time information (start and end) */
        for (var n = 0; n < 2; n++) {
            j[n] = j[n].split(":");

            for (var t = 0, m = 0; m < 3; m++) {
                t = t * 60 + 1 * j[n][m].replace(",", ".");
            }

            j[n] = t;
        }

        /* Push information */
        res.push({ time: j, text: i.slice(2).join("<br>") });
    }

    return res;
}

TimedInfo.prototype.shouldDisplay = function() {
    if (!this.checkReadyState(this.current)) {
        return;
    }

    /* Data have been loaded */
    var st = this.data[this.current].srt;
    var ct = this.owner.currentTime - this.owner.startTime;

    /* Look for a suitable subtitle */
    this.element.innerHTML = "";
    for (var i = 0; i < st.length; i++) {
        if (ct >= st[i].time[0] && ct < st[i].time[1]) {
            this.element.innerHTML = st[i].text;
            break;
        }
    }
}

TimedInfo.prototype.checkReadyState = function(index) {
    if (index == -1) {
        return false;
    }

    /* Check whether the data is available */
    switch (this.data[index].readyState) {
        case 0:
            this.loadResource(index);
            this.data[index].readyState = 1;
        case 1:
        case 3:
            return false;
    }

    return true;
}

TimedInfo.prototype.getFilteredIndex = function(kind) {
    var list = [];

    for (var i = 0; i < this.data.length; i++) {
        if (this.data[i].kind == kind) {
            list.push(i);
        }
    }

    return list;
}

TimedInfo.prototype.activate = function(index) {
    if (index >= 0 && index < this.data.length) {
        this.current = index;
        this.element.className = this.data[this.current].kind;
    }
}

TimedInfo.prototype.play = function(index, number, shouldStop) {
    /* Don't request twice the same chapter while loading SRT file */
    if (index != this.chapter.index || number != this.chapter.number) {
        this.chapter.index = index;
        this.chapter.number = number;
        this.chapter.shouldStop = shouldStop;
        this.chapter.timeChanged = false;

        this.handleChapter();
    }
}

TimedInfo.prototype.handleChapter = function() {
    if (!this.checkReadyState(this.chapter.index)) {
        return;
    }

    var nb = this.chapter.number - 1;
    var st = this.data[this.chapter.index].srt;

    /* We have data, we can set the current position */
    if (!this.chapter.timeChanged) {
        if (this.owner.paused) {
            this.owner.play();
        }
        if (this.owner.readyState == this.owner.HAVE_NOTHING) {
            return;
        }
        this.owner.currentTime = this.owner.startTime + st[nb].time[0];
        this.chapter.timeChanged = true;
    }

    /* If we have to stop at the end of the chapter */
    if (this.chapter.shouldStop) {
        var ct = this.owner.currentTime - this.owner.startTime;
        var et = st[nb].time[1];

        if (ct >= et) {
            this.chapter = { index: -1 };
            this.owner.pause();
        }
    }
}

TimedInfo.prototype.handleTracks = function() {
    this.handleChapter();
    this.shouldDisplay();
}

var timed; // Globally stored for future use

function setup() {
    var video = document.getElementsByTagName("video")[0];

    window.setInterval(checkBuffered, 500, video);
    video.addEventListener("timeupdate", checkPlayed, false);
    video.addEventListener("loadedmetadata", adjustVideo, false);

    timed = new TimedInfo(video, document.getElementById("textual"));
    document.getElementById("list").appendChild(buildList());
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

function buildList() {
    var list = timed.getFilteredIndex("subtitles");
    var select = document.createElement("select");

    for (var i = 0; i < list.length; i++) {
        var index = list[i];
        var option = document.createElement("option");

        option.textContent = timed.data[index].label;
        option.value = index;
        option.selected = (timed.current == option.value);

        select.appendChild(option);
    }

    select.onchange = selectionChanged;
    return select;
}

function selectionChanged(event) {
    timed.activate(event.target.value);
}
