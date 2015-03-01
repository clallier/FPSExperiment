/*globals Vector2Const */
/**********************************************************************************
 *
 */

//== MathUtils ==
var MathUtils = {

    rnd : function (lo, hi) {
        'use strict';
        return parseInt(Math.floor(Math.random() * (hi - lo + 1)) + lo, 10);
    }
};

var Vector2 = function (x, y) {
    "use strict";
    this.x = x || 0;
    this.y = y || 0;
};

Vector2.prototype = {

    reset: function (x, y) {
        "use strict";
        this.x = x;
        this.y = y;
        return this;
    },

    toString : function (decPlaces) {
        "use strict";
        decPlaces = decPlaces || 3;
        var scalar = Math.pow(10, decPlaces);
        return "[" + Math.round(this.x * scalar) / scalar + ", " + Math.round(this.y * scalar) / scalar + "]";
    },

    clone : function () {
        "use strict";
        return new Vector2(this.x, this.y);
    },

    copyTo : function (v) {
        "use strict";
        v.x = this.x;
        v.y = this.y;
    },

    copyFrom : function (v) {
        "use strict";
        this.x = v.x;
        this.y = v.y;
    },

    magnitude : function () {
        "use strict";
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    },

    magnitudeSquared : function () {
        "use strict";
        return (this.x * this.x) + (this.y * this.y);
    },

    normalise : function () {
        "use strict";
        var m = this.magnitude();
        this.x = this.x / m;
        this.y = this.y / m;
        return this;
    },

    reverse : function () {
        "use strict";
        this.x = -this.x;
        this.y = -this.y;
        return this;
    },

    plusEq : function (v) {
        "use strict";
        this.x += v.x;
        this.y += v.y;
        return this;
    },

    plusNew : function (v) {
        "use strict";
        return new Vector2(this.x + v.x, this.y + v.y);
    },

    minusEq : function (v) {
        "use strict";
        this.x -= v.x;
        this.y -= v.y;
        return this;
    },

    minusNew : function (v) {
        "use strict";
        return new Vector2(this.x - v.x, this.y - v.y);
    },

    multiplyEq : function (scalar) {
        "use strict";
        this.x *= scalar;
        this.y *= scalar;
        return this;
    },

    multiplyNew : function (scalar) {
        "use strict";
        var returnvec = this.clone();
        return returnvec.multiplyEq(scalar);
    },

    divideEq : function (scalar) {
        "use strict";
        this.x /= scalar;
        this.y /= scalar;
        return this;
    },

    divideNew : function (scalar) {
        "use strict";
        var returnvec = this.clone();
        return returnvec.divideEq(scalar);
    },

    dot : function (v) {
        "use strict";
        return (this.x * v.x) + (this.y * v.y);
    },

    angle : function (useRadians) {
        "use strict";
        return Math.atan2(this.y, this.x) * (useRadians ? 1 : Vector2Const.TO_DEGREES);

    },

    rotate : function (angle, useRadians) {
        "use strict";
        var cosRY = Math.cos(angle * (useRadians ? 1 : Vector2Const.TO_RADIANS)),
            sinRY = Math.sin(angle * (useRadians ? 1 : Vector2Const.TO_RADIANS));
        Vector2Const.temp.copyFrom(this);
        this.x = (Vector2Const.temp.x * cosRY) - (Vector2Const.temp.y * sinRY);
        this.y = (Vector2Const.temp.x * sinRY) + (Vector2Const.temp.y * cosRY);
        return this;
    },

    equals : function (v) {
        "use strict";
        return ((this.x === v.x) && (this.y === v.x));
    },

    isCloseTo : function (v, tolerance) {
        "use strict";
        if (this.equals(v)) {
            return true;
        }
        Vector2Const.temp.copyFrom(this);
        Vector2Const.temp.minusEq(v);
        return (Vector2Const.temp.magnitudeSquared() < tolerance * tolerance);
    },

    rotateAroundPoint : function (point, angle, useRadians) {
        "use strict";
        Vector2Const.temp.copyFrom(this);
        //trace("rotate around point "+t+" "+point+" " +angle);
        Vector2Const.temp.minusEq(point);
        //trace("after subtract "+t);
        Vector2Const.temp.rotate(angle, useRadians);
        //trace("after rotate "+t);
        Vector2Const.temp.plusEq(point);
        //trace("after add "+t);
        this.copyFrom(Vector2Const.temp);

    },

    isMagLessThan : function (distance) {
        "use strict";
        return (this.magnitudeSquared() < distance * distance);
    },

    isMagGreaterThan : function (distance) {
        "use strict";
        return (this.magnitudeSquared() > distance * distance);
    }
    // still AS3 to convert :
    // public function projectOnto(v:Vector2) : Vector2
    // {
    //  var dp:Number = dot(v);
    //
    //  var f:Number = dp / ( v.x*v.x + v.y*v.y );
    //
    //  return new Vector2( f*v.x , f*v.y);
    // }
    //
    //
    // public function convertToNormal():void
    // {
    // var tempx:Number = x;
    // x = -y;
    // y = tempx;
    //
    //
    // }
    // public function getNormal():Vector2
    // {
    //
    // return new Vector2(-y,x);
    //
    // }
    //
    //
    //
    // public function getClosestPointOnLine ( vectorposition : Point, targetpoint : Point ) : Point
    // {
    // var m1 : Number = y / x ;
    // var m2 : Number = x / -y ;
    //
    // var b1 : Number = vectorposition.y - ( m1 * vectorposition.x ) ;
    // var b2 : Number = targetpoint.y - ( m2 * targetpoint.x ) ;
    //
    // var cx : Number = ( b2 - b1 ) / ( m1 - m2 ) ;
    // var cy : Number = m1 * cx + b1 ;
    //
    // return new Point ( cx, cy ) ;
    // }
    //
};

var Vector2Const = {
    TO_DEGREES : 180 / Math.PI,
    TO_RADIANS : Math.PI / 180,
    temp : new Vector2()
};

var Rectangle = function (x, y, w, h) {
    "use strict";
    this.x = x || 0;
    this.left = x || 0;
    this.y = y || 0;
    this.top = y || 0;
    this.w = w || 0;
    this.right = (w + x) || 0;
    this.h = h || 0;
    this.bottom = (h + y) || 0;

    this.contains = function (x, y) {
        return (this.x <= x &&
            this.w + this.x >= x &&
            this.y <= y &&
            this.h + this.y >= y);
    };
};


var Collection = function () {
    "use strict";
    this.count = 0;
    this.collection = {};

    this.add = function (key, item) {
        if (this.collection[key] !== undefined) {
            return undefined;
        }
        this.collection[key] = item;
        this.count += 1;
        return this.count;
    };

    this.remove = function (key) {
        if (this.collection[key] === undefined) {
            return undefined;
        }
        delete this.collection[key];
        this.count -= 1;
        return this.count;
    };
    this.item = function (key) {
        return this.collection[key];
    };
    this.forEach = function (block) {
        var key;
        for (key in this.collection) {
            if (this.collection.hasOwnProperty(key)) {
                block(this.collection[key]);
            }
        }
    };
};

