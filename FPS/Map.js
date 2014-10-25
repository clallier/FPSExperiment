var Map = {

    mapW: 0,
    mapH: 0,
    
    /**********************************************************************************
     * Init the map
     */
    init : function () {
        'use strict';
        this.map = [
            //  1  2  3  4  5  6  7  8  9
            [4, 1, 1, 1, 1, 1, 1, 1, 4, 4], // 0
            [4, 1, 0, 0, 0, 0, 0, 0, 1, 1], // 1
            [1, 1, 0, 0, 2, 2, 2, 0, 0, 1], // 2
            [1, 0, 0, 0, 0, 0, 2, 0, 0, 1], // 3
            [1, 0, 0, 2, 0, 0, 2, 0, 0, 1], // 4
            [1, 0, 0, 0, 2, 0, 0, 0, 1, 1], // 5
            [1, 1, 1, 0, 0, 0, 0, 1, 1, 4], // 6
            [4, 4, 1, 0, 0, 1, 0, 0, 1, 4], // 7
            [4, 4, 1, 1, 1, 1, 0, 0, 1, 4], // 8
            [4, 4, 4, 4, 4, 1, 1, 1, 1, 4]];// 9
        this.mapW = this.map.length;
        this.mapH = this.map[0].length;
    },

    /**********************************************************************************
     *
     */
    getMapSector: function (v) {
        'use strict';
        var x = Math.floor((v.x + RetroBomber.UNITSIZE / 2) / RetroBomber.UNITSIZE + this.mapW / 2),
            z = Math.floor((v.z + RetroBomber.UNITSIZE / 2) / RetroBomber.UNITSIZE + this.mapW / 2);
        return { x: x, z: z };
    },


    /**********************************************************************************
        * Check if a vector3 ovelaps with a wall
        * @param v 
        * A THREE.vector
        *
        * @returns {boolean}
        *
        */
    checkWallCollision: function (v) {
        'use strict';
        var c = this.getMapSector(v);
        return this.map[c.x][c.z] > 0;
    },

    getTypeList: function (type) {
        'use strict';
        var list = [], x = 0, z = 0;

        for (x = 0; x < this.mapW; x += 1) {
            for (z = 0; z < this.mapH; z += 1) {
                // cubes 
                if (this.map[x][z] === type) {
                    var p = { x: x, z: z };
                    list.push(p);
                }
            }
        }
        return list;
    }
};