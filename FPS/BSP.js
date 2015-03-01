/*global Leaf,console, MathUtils, Vector2, Rectangle*/

var BSP;
BSP = function (width, height) {
    "use strict";

    this.MIN_LEAF_SIZE = 6;
    this.leafs = [];
    this.root = new Leaf(0, 0, width, height);
    this.w = width;
    this.h = height;
    this.leafs.push(this.root);

    var did_split = true, i, l;

    // we loop through every Leaf in our Vector over and over again, until no more Leafs can be split.
    while (did_split) {

        did_split = false;
        for (i = 0; i < this.leafs.length; i += 1) {

            l = this.leafs[i];
            // if this leaf is not already split
            if (l.leftChild === null && l.rightChild === null) {

                // if this leaf is too big, or 75% chance...
                if (l.width > this.MIN_LEAF_SIZE ||
                    l.height > this.MIN_LEAF_SIZE ||
                    (Math.random() > 0.25)) {
                    // Do the split
                    if (l.split()) {
                        this.leafs.push(l.leftChild);
                        this.leafs.push(l.rightChild);
                        did_split = true;
                    }
                }
            }
        }

        did_split = false;
        this.root.createRooms();
    }

    this.get2DMap = function () {
        var map = [], y, j;

        for (y = 0; y < this.h; y += 1) {
            map[y] = [];
        }
        for (j = 0; j < this.h; j += 1) {
            for (i = 0; i < this.w; i += 1) {
                map[j].push(this.root.getType(i, j));
            }
        }
        return map;
    };
};

/**
 * Leaf ! 
 */
var Leaf = function (x, y, width, height) {
    "use strict";
    this.MIN_LEAF_SIZE = 6;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.leftChild = null;   // Leaf
    this.rightChild = null;  // Leaf
    this.room = null;        //Rectangle;
    this.halls = []; // List<Rectangle>

    this.split = function () {
        // already splitted
        if (this.leftChild !== null || this.rightChild !== null) {
            return false;
        }

        // determine direction of split
        // if the width is >25% larger than height, we split vertically
        // if the height is >25% larger than the width, we split horizontally
        // otherwise we split randomly
        var splitH = (Math.random() > 0.5),
            max = 0,
            split = 0;

        if (this.width > this.height && this.height / this.width >= 0.05) {
            splitH = false;
        }

        if (this.height > this.width && this.width / this.height >= 0.05) {
            splitH = true;
        }
        // max height or width
        max = (splitH ? this.height : this.width) - this.MIN_LEAF_SIZE;
        if (max <= this.MIN_LEAF_SIZE) {
            return false; // area is too small to split
        }

        split = MathUtils.rnd(this.MIN_LEAF_SIZE, max);
        // create our L&R children based on direction
        if (splitH) {
            this.leftChild = new Leaf(this.x, this.y, this.width, split);
            this.rightChild = new Leaf(this.x, this.y + split, this.width, this.height - split);
        } else {
            this.leftChild = new Leaf(this.x, this.y, split, this.height);
            this.rightChild = new Leaf(this.x + split, this.y, this.width - split, this.height);
        }
        return true;
    };

    this.createRooms = function () {
        var room_size = 0,
            room_pos = 0;
        // this leaf have been splitted, so go into the children leafs
        if (this.leftChild !== null || this.rightChild !== null) {

            if (this.leftChild !== null) {
                this.leftChild.createRooms();
            }

            if (this.rightChild !== null) {
                this.rightChild.createRooms();
            }
            if (this.rightChild !== null && this.leftChild !== null) {
                this.createHall(this.leftChild.getRoom(), this.rightChild.getRoom());
            }
        } else {

            // the room can be between 3 x 3 tiles to the size of the leaf - 2.
            room_size = new Vector2(MathUtils.rnd(3, width - 2), MathUtils.rnd(3, height - 2));
            // place the room within the Leaf, but don't put it right against the side of the Leaf (that would merge rooms together)
            room_pos = new Vector2(MathUtils.rnd(1, parseInt(width - room_size.x - 1)), MathUtils.rnd(1, parseInt(height - room_size.y - 1)));
            this.room = new Rectangle(x + room_pos.x, y + room_pos.y, room_size.x, room_size.y);
        }
    };

    this.getRoom = function () {
        // iterate all the way through these leafs to find a room, if one exists.
        if (this.room !== null) {
            return this.room;
        } else {
            var lRoom = null, //Rectangle
                rRoom = null; //Rectangle

            if (this.leftChild !== null) {
                lRoom = this.leftChild.getRoom();
            }
            if (this.rightChild !== null) {
                rRoom = this.rightChild.getRoom();
            }
            if (lRoom === null && rRoom === null) {
                return null;
            } else if (lRoom === null) {
                return rRoom;
            } else if (rRoom === null) {
                return lRoom;
            } else if (Math.random() > 0.5) {
                return lRoom;
            } else {
                return rRoom;
            }
        }
    };

    /**
     *
     * @param l : Rectangle
     * @param r : Rectangle
     */
    this.createHall =  function (l, r) {
        // now we connect these two rooms together with hallways.
        // this looks pretty complicated, but it's just trying to figure out which point is where and then either draw a straight line, or a pair of lines to make a right-angle to connect them.
        // you could do some extra logic to make your halls more bendy, or do some more advanced things if you wanted.
        this.halls = [];
        var l_left  = parseInt(l.left),
            r_left  = parseInt(r.left),
            l_right = parseInt(l.right),
            r_right = parseInt(r.right),
            l_top   = parseInt(l.top),
            r_top   = parseInt(r.top),
            l_bottom = parseInt(l.bottom),
            r_bottom = parseInt(r.bottom),
            p1 = new Vector2(MathUtils.rnd(l_left + 1, l_right - 2), MathUtils.rnd(l_top, l_bottom - 2)),
            p2 = new Vector2(MathUtils.rnd(r_left + 1, r_right - 2), MathUtils.rnd(r_top, r_bottom - 2)),
            w = p2.x - p1.x,
            h = p2.y - p1.y;

        if (w < 0) {
            if (h < 0) {
                if ((Math.random() < 0.5)) {
                    this.halls.push(new Rectangle(p2.x, p1.y, Math.abs(w), 1));
                    this.halls.push(new Rectangle(p2.x, p2.y, 1, Math.abs(h)));
                } else {
                    this.halls.push(new Rectangle(p2.x, p2.y, Math.abs(w), 1));
                    this.halls.push(new Rectangle(p1.x, p2.y, 1, Math.abs(h)));
                }
            } else if (h > 0) {
                if (Math.random() < 0.5) {
                    this.halls.push(new Rectangle(p2.x, p1.y, Math.abs(w), 1));
                    this.halls.push(new Rectangle(p2.x, p1.y, 1, Math.abs(h)));
                } else {
                    this.halls.push(new Rectangle(p1.x, p1.y, 1, Math.abs(h)));
                }
            } else { // if (h == 0)
                this.halls.push(new Rectangle(p2.x, p2.y, Math.abs(w), 1));
            }
        }

        // else if w > 0
        if (w > 0) {
            if (h < 0) {
                if (Math.random() < 0.5) {
                    this.halls.push(new Rectangle(p1.x, p2.y, Math.abs(w), 1));
                    this.halls.push(new Rectangle(p1.x, p2.y, 1, Math.abs(h)));
                } else {
                    this.halls.push(new Rectangle(p2.x, p2.y, Math.abs(w), 1));
                    this.halls.push(new Rectangle(p1.x, p2.y, 1, Math.abs(h)));
                }
            } else if (h > 0) {
                if (Math.random() < 0.5) {
                    this.halls.push(new Rectangle(p1.x, p1.y, Math.abs(w), 1));
                    this.halls.push(new Rectangle(p2.x, p1.y, 1, Math.abs(h)));
                } else {
                    this.halls.push(new Rectangle(p1.x, p2.y, Math.abs(w), 1));
                    this.halls.push(new Rectangle(p1.x, p1.y, 1, Math.abs(h)));
                }
            } else { // if (h == 0)
                this.halls.push(new Rectangle(p1.x, p1.y, Math.abs(w), 1));
            }
        // else ( w == 0 ) 
        } else {
            if (h < 0) {
                this.halls.push(new Rectangle(p2.x, p2.y, 1, Math.abs(h)));
            } else if (h > 0) {
                this.halls.push(new Rectangle(p1.x, p1.y, 1, Math.abs(h)));
            }
        }
    };

    /**
     *
     * @param x : int
     * @param y : int
     */
    this.getType = function (x, y) {
        var i, l;

        // look in room
        if (this.room !== null) {
            if (room.contains(x, y)) {
                return 0;
            }// 0 is a room

        // look in halls
        } else if (this.halls.length > 0) {
            for (i = 0, l = this.halls.length; i < l; i += 1) {
                if (this.halls[i].contains(x, y)) {
                    return 0;
                }
            }

        // look in leftChild
        } else if (this.leftChild !== null) {
            return this.leftChild.getType(x, y);
        // look in rightChild
        } else if (this.rightChild !== null) {
            return this.rightChild.getType(x, y);
        }

        return 1; // 1 = wall
    };
};