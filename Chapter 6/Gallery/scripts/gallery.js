function showImages() {
    var container = document.getElementById("gallery");
    container.innerHTML = "";

    for (var i = 0; i < images.length; i++) {
        loadImage(container, images[i]);
    }
}

function loadImage(container, src) {
    var img = new Image();
    img.src = src;

    var div = document.createElement("div");
    container.appendChild(div);

    img.onload = function() {
        div.className = (this.width < this.height) ? "portrait" : "landscape";
        div.style.backgroundImage = "url(" + this.src + ")";
    }
}
