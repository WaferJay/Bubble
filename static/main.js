
var Direct = {
    TOP: 1,
    BOTTOM: 2,
    LEFT: 3,
    RIGHT: 4
};

Object.freeze(Direct);

function randrange(min, max) {
    return Math.random() * (max - min) + min;
}

function parseHexColor(color) {
    var result,
        hex;

    if (!/^#[\da-f]{3,8}$/i.test(color)) {
        throw new Error("bad color format: " + color);
    }

    hex = color.substr(1, 8);

    result = {
        toString: function(hex, alpha) {
            var result = "#";

            function fillZero(h, l) {
                var c = l - h.length,
                    i;

                for (i=0;i<c;i++) {
                    h = "0".concat(h);
                }

                return h;
            }

            if (hex) {
                result += fillZero(this.r.toString(16), 2);
                result += fillZero(this.g.toString(16), 2);
                result += fillZero(this.b.toString(16), 2);

                this.a && alpha && (result += fillZero(this.a.toString(16), 2));

                return result;
            } else {
                return "rgba("+this.r+","+this.g+","+this.b+","+(this.a || 255)/255+")";
            }
        },

        clone: function () {
            var newObj = {},
                each;

            for (each in this) {
                if (this.hasOwnProperty(each)) {
                    newObj[each] = this[each];
                }
            }

            return newObj;
        }
    };

    switch (hex.length) {
        case 8:
            result.a = parseInt(hex.substr(6, 2), 16);
            // fall through
        case 6:
            result.r = parseInt(hex.substr(0, 2), 16);
            result.g = parseInt(hex.substr(2, 2), 16);
            result.b = parseInt(hex.substr(4, 2), 16);
            break;
        case 3:
            result.r = parseInt(hex.substr(0, 1), 16);
            result.r += result.r << 4;
            result.g = parseInt(hex.substr(1, 1), 16);
            result.g += result.g << 4;
            result.b = parseInt(hex.substr(2, 1), 16);
            result.b += result.b << 4;
            break;
        default:
            throw new Error("bad color format: " + color);
    }

    return result;
}

function Bubble(meta, s) {
    this.speed = s;
    this.shapeMeta = meta;

    this.draw = function (ctx, n) {
        ctx.beginPath();
        ctx.fillStyle = this.shapeMeta.color.toString();
        ctx.moveTo(this.shapeMeta.x, this.shapeMeta.y);
        ctx.arc(this.shapeMeta.x, this.shapeMeta.y, this.shapeMeta.r, 0, Math.PI * 2);
        if (n) {
            ctx.fill();
        }
    };

    this.up = function (d) {
        this.shapeMeta.y -= d || this.speed;
    };

    this.down = function (d) {
        this.shapeMeta.y += d || this.speed;
    };

    this.left = function (d) {
        this.shapeMeta.x -= d || this.speed;
    };

    this.right = function (d) {
        this.shapeMeta.x += d || this.speed;
    };
}

function BubbleManager(options) {
    var bubbles = [],
        canvas = options.canvas,
        color = options.color,
        minRadius = options.minRadius,
        maxRadius = options.maxRadius,
        tick = options.tick || 100,
        from = options.bubbleFrom || Direct.BOTTOM,
        numBubble = options.numBubble || parseInt(canvas.width / 10),
        distance = options.distance || canvas.height / 2,
        maxDistPerTick = options.maxSpeed * tick / 1000,
        minDistPerTick = options.minSpeed * tick / 1000,
        ctx = canvas.getContext("2d"),
        clock = 0,
        running = false,
        pausing = false,
        that = this,
        id;

    color.a = color.a || 200;

    this.onTransform = options.onTransform;
    this.onTick = options.onTick;

    if (options.matchParent) {
        canvas.parentElement.style.position = 'relative';
        canvas.style.position = 'absolute';
        canvas.style.top = 0;
        canvas.style.left = 0;
        canvas.setAttribute("width", canvas.parentElement.clientWidth.toString());
        canvas.setAttribute("height", canvas.parentElement.clientHeight.toString());
    }

    function initBubbles() {
        var i;

        for (i=0;i<numBubble;i++) {
            bubbles.push(that.createBubble());
        }
    }

    this.drawAll = function () {
        var i,
            bubble;

        for (i = 0; i < bubbles.length; i++) {
            bubble = bubbles[i];
            bubble.draw(ctx, true);
        }
    };

    function createOrResetMeta(meta) {
        var r = randrange(minRadius, maxRadius);

        meta = meta || {};
        meta.r = r;

        switch (from) {
            case Direct.BOTTOM:
                meta.x = randrange(0, canvas.width);
                meta.y = canvas.height + r;
                break;
            case Direct.TOP:
                meta.x = randrange(0, canvas.width);
                meta.y = -r;
                break;
            case Direct.LEFT:
                meta.x = -r;
                meta.y = randrange(0, canvas.height);
                break;
            case Direct.RIGHT:
                meta.x = canvas.width + r;
                meta.y = randrange(0, canvas.height);
                break;
            default:  // no default
        }

        return meta;
    }

    this.createBubble = function () {
        var c = typeof color === 'function' ? color() : color.clone();

        return new Bubble(createOrResetMeta({color: c}), randrange(minDistPerTick, maxDistPerTick));
    };

    this.clear = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    function transform() {
        var i,
            colorSub,
            bubble;

        for (i = 0; i < bubbles.length; i++) {
            bubble = bubbles[i];
            switch (from) {
                case Direct.BOTTOM:
                    bubble.up();
                    break;
                case Direct.TOP:
                    bubble.down();
                    break;
                case Direct.LEFT:
                    bubble.right();
                    break;
                case Direct.RIGHT:
                    bubble.left();
                    break;
                default:  // no default
            }

            // REVIEW: 划分出去
            if (bubble.shapeMeta.color.a > 0) {
                colorSub = bubble.speed * color.a / distance;
                bubble.shapeMeta.color.a -= colorSub;
            } else if(typeof bubble.shapeMeta.color.a === 'number') {
                createOrResetMeta(bubble.shapeMeta);

                bubble.shapeMeta.color.a = color.a;
            }

            typeof that.onTransform === 'function' && that.onTransform(bubble);
        }
    }

    function handleClock() {
        transform();
        that.clear();
        that.drawAll();
    }

    this.startLoop = function () {
        if (running) return;

        initBubbles();

        id = setInterval(function () {

            if (!pausing) {
                clock += tick;
                handleClock(clock);
                typeof that.onTick === 'function' && that.onTick(clock);
            }
        }, tick);

        running = true;
    };

    this.stop = function () {
        clearInterval(id);
        clock = 0;
        bubbles.splice(0, bubbles.length);
        this.clear();
        running = false;
    };

    this.pause = function () {
        pausing = true;
    };

    this.unpause = function () {
        pausing = false;
    };
}
