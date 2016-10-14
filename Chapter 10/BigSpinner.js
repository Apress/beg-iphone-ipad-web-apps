/* Object constructor */
var CanvasAnimator = function() {
    /* Default dimensions */
    this.width = this.width || 37;
    this.height = this.height || 37;

    this._base = CanvasAnimator.prototype;
}

CanvasAnimator.prototype.init = function(id, color, shadow) {
    /* Initialize the canvas and save the context */
    this.context = document.getCSSCanvasContext("2d", id, this.width, this.height);

    /* Animation variables */
    this.step = 0;
    this.timer = null;
}

CanvasAnimator.prototype.stop = function() {
    if (this.timer) {
        this.context.clearRect(0, 0, this.width, this.height);
        window.clearInterval(this.timer);
        this.timer = null;
    }
}

CanvasAnimator.prototype.animate = function() {
    /* Already running? exit... */
    if (this.timer) {
        return;
    }

    /* The execution context (this) will be the window object with setInterval()
       Save the correct context in "that" variable and run the timer */
    var that = this;
    this.timer = window.setInterval(function() {
        that.draw();
    }, 100);
}

/* Abstract method */
CanvasAnimator.prototype.draw = null;


/* The new BigSpinner object */
var BigSpinner = new Function();

/* Inherit from BaseSpinner */
BigSpinner.prototype = new CanvasAnimator;

BigSpinner.prototype.init = function(id, color, shadow) {
    /* Call the base method */
    this._base.init.apply(this, arguments);

    /* Line style for the spinner */
    this.context.lineWidth = 3;
    this.context.lineCap = "round";
    this.context.strokeStyle = color;

    /* Define a shadow for the spinner */
    if (shadow) {
        this.context.shadowOffsetX = 1;
        this.context.shadowOffsetY = 1;
        this.context.shadowBlur = 1;
        this.context.shadowColor = shadow;
    }
}

BigSpinner.prototype.draw = function() {
    /* Clear the canvas */
    this.context.clearRect(0, 0, this.width, this.height);

    /* Prepare canvas state and draw spinner lines */
    this.context.save();
    this.context.translate(18, 18);
    this.context.rotate(this.step * Math.PI / 180);

    for (var i = 0; i < 12; i++) {
        this.context.rotate(30 * Math.PI / 180);
        this.drawLine(i);
    }
    this.context.restore();

    /* Increment the animation */
    this.step += 30;
    if (this.step == 360) {
        this.step = 0;
    }
}

BigSpinner.prototype.drawLine = function(i) {
    /* Draw one line with varying transparency depending on the iteration */
    this.context.beginPath();
    this.context.globalAlpha = i / 12;
    this.context.moveTo(0, 8 + 1);
    this.context.lineTo(0, 16 - 1);
    this.context.stroke();
}

