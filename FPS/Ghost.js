/*global window, THREE, Stats, dat, requestAnimationFrame, console*/
/// <reference path="three.js" />
var i = 0;

var Ghost = Object.create(Creature);
Ghost.health = 100;
Ghost.lastShot = 0;
Ghost.astar = null;
Ghost.direction = { x: 0, z: 0 };
Ghost.previousSector = { x: 0, z: 0 };
Ghost.size = 30;

Ghost.initMesh = function () {
    var health = THREE.ImageUtils.loadTexture("health.png");

    health.minFilter = THREE.NearestFilter;
    health.magFilter = THREE.NearestFilter;
    this.size = RetroBomber.UNITSIZE / 3;
    this.mesh = new THREE.Mesh(
        new THREE.BoxGeometry(this.size, this.size, this.size),
        new THREE.MeshBasicMaterial({ map: health, color: 0xff0000 })
    );
    this.mesh.castShadow = true;
    this.mesh.name = "ghost" + (i++);
};

/**********************************************************************************
 *
 */
Ghost.init = function () {
    'use strict';
    
    if (this.mesh === null)
        this.initMesh();

    this.health = 100;
    this.lastShot = Date.now();
};

/**********************************************************************************
*
*/
Ghost.update = function (delta) {
    'use strict';
    var c = {}, // map sector AI
        cc = {} // map sector player 

    var aispeed = delta * RetroBomber.MOVESPEED / 2;
    if (aispeed > 3) aispeed = 3;

    // get sector
	var p = {x: this.mesh.position.x - this.direction.x * RetroBomber.UNITSIZE/2, 
		 	 z: this.mesh.position.z - this.direction.z * RetroBomber.UNITSIZE/2};
	c = RetroBomber.map.getMapSector(p);

	// init if needed
	this.getNextMove(c);

    this.mesh.translateX(aispeed * this.direction.x);
    this.mesh.translateZ(aispeed * this.direction.z);

 	this.previousSector = c;

    // world borders ???
	/*
    if (c.x < 0 || c.x >= RetroBomber.map.mapW || c.y < 0 || c.y >= RetroBomber.map.mapH || RetroBomber.map.checkWallCollision(this.mesh.position)) {
        this.mesh.translateX(-2 * aispeed * this.lastRandomX);
        this.mesh.translateZ(-2 * aispeed * this.lastRandomZ);

        this.getNewMove();
    }

    if (c.x < -1 || c.x >= RetroBomber.map.mapW || c.z < -1 || c.z >= RetroBomber.map.mapH) {
        this.health = 0;
    }
	*/
    // shoot
    /*
    cc = RetroBomber.map.getMapSector(RetroBomber.cam.position);
    if (Date.now() > this.lastShot + 750 && RetroBomber.distance(c.x, c.z, cc.x, cc.z) < 2) {
        //this.createBullet(this);
        this.lastShot = Date.now();
    }
    */
}

Ghost.getNewMove = function (currentSector) {
    // target node
    var list = RetroBomber.map.getTypeList(0);
	
    var r = RetroBomber.getRandBetween(0, list.length-1);
    var t = { x: list[r].x, z: list[r].z };
	console.log(t.x, t.z);
  
    this.astar = Object.create(AStar);
    this.astar.init(RetroBomber.map.map, currentSector, t);
}

Ghost.getNextMove = function (currentSector) {
	if(this.astar === null)
		this.getNewMove(currentSector);
	
    // direction to next node in the A* path
	if(currentSector.x !== this.previousSector.x || currentSector.z !== this.previousSector.z) {
    	this.direction = this.astar.getNextMove(currentSector);
		console.log(this.direction.x +", "+ this.direction.z);
	}

    if (this.direction.x === 0 && this.direction.z === 0){
        this.getNewMove(currentSector);
		this.direction = this.astar.getNextMove(currentSector);
		console.log(this.direction.x +", "+ this.direction.z);
    }

}


var AStar = {

    map: [],
    path: [],
    /*************************************************************************
     * map : the current map to go througth
     * b : the current node {x, y}
     * target : the target node {x, y}
     * where    x: xpos in tile
     *          y: ypos in tile
     *          f: 0 (the result of the f(x) on this node)
     *          g: 0 (the GScore of this node)
     *          h: 0 (the heuristic result on this node)
     *          parent: null (the previous node in the AStar chain)
     *
     * Return the path to the target
     */
    init : function(map, b, target) {
        var i=0,
            openList = [],
            closedList = []

        // copy locally the map
		this.map = [];
        for (var i = 0, l = map.length; i < l; i++) {
            this.map.push([]);
            for (var j = 0, k = map[i].length; j < k; j++) {
                var o = {x: i, z: j, v: map[i][j], f: 0, g: 0, h: 0 };
                this.map[i].push(o);
            }
        }

        // add first block
        openList.push(this.map[b.x][b.z]);
		
		while (openList.length > 0) {
			
			// Grab the lowest f(x) to process next
			var lowInd = 0;
			for( i = 0; i<openList.length; ++i ) {
				if(openList[i].f < openList[lowInd].f) { lowInd = i; }
			}
			var currentNode = openList[lowInd];
			
			// End case -- result has been found, return the traced path
			if(currentNode.z === target.z && currentNode.x === target.x) {
				var tmpNode = currentNode;
				var tmpPath = [];

				while(tmpNode.parent != null) {
					tmpPath.push({x: tmpNode.x, z: tmpNode.z});
					tmpNode = tmpNode.parent;
				}
				// push the first one
				tmpPath.push({x: tmpNode.x, z: tmpNode.z});
				
				tmpPath.reverse();
				this.path = tmpPath;
				console.log("path: " + this.path);
				return;
			}
			
			// Normal case -- move currentNode from open to closed, process each of its neighbors
			openList.splice(currentNode);
			closedList.push(currentNode);
			var neighbors = this.getNeighbors(currentNode);
 
			for(i = 0; i < neighbors.length; ++i) {
				var neighbor = neighbors[i];
			    // not a valid node to process, skip to next neighbor
				if (closedList.indexOf(neighbor) !== -1) continue;
				
				// g score is the shortest distance from start to current node, we need to check if
				//	 the path we have arrived at this neighbor is the shortest one we have seen yet
				var gScore = currentNode.g + 1; // 1 is the distance from a node to it's neighbor
				var gScoreIsBest = false;
				
				if(openList.indexOf(neighbor) === -1) {
					// This the the first time we have arrived at this node, it must be the best
					// Also, we need to take the h (heuristic) score since we haven't done so yet
 
					gScoreIsBest = true;
					neighbor.h = this.heuristic(neighbor.x, neighbor.z, target.x, target.z);
					openList.push(neighbor);
				}
				
				else if(gScore < neighbor.g) {
					// We have already seen the node, but last time it had a worse g (distance from start)
					gScoreIsBest = true;
				}
				
				if(gScoreIsBest) {
					// Found an optimal (so far) path to this node.	 Store info on how we got here and
					//	just how good it really is...
					neighbor.parent = currentNode;
					neighbor.g = gScore;
					neighbor.f = neighbor.g + neighbor.h;
				}
			}
		}
		
		//return [];
    },

    /******************************************************************
     * return the neighbors list of the node b
     */
	getNeighbors : function (node)
	{
		var neighbors = [], 
			l, r, t, b;
		
		// l&r neigbors
		if(node.z-1>=0) 
			l = this.map[node.x][node.z-1];
		if(l !== undefined && l.v === 0) 
			neighbors.push(l);
		
		if(node.z + 1 < this.map[node.x].length)
			r = this.map[node.x][node.z+1];
		if(r !== undefined && r.v === 0) 
			neighbors.push(r);

		
		// t&b neigbors
		if( node.x-1 >= 0)
			b = this.map[node.x-1][node.z];
		if (b !== undefined && b.v === 0) 
			neighbors.push(b);

		if (node.x + 1 < this.map.length)
		    t = this.map[node.x+1][node.z];
		if (t !== undefined && t.v === 0) 
			neighbors.push(t);
		
		return neighbors;
	},
	
	heuristic: function (x1,y1, x2, y2) 
	{
		var d1 = Math.abs (x2 - x1);
		var d2 = Math.abs (y2 - y1);
		return d1 + d2; //manhattan dist
	},

    getNextMove: function (currentPosition) {
        var i = 0, l = 0;

        for (i = 0, l = this.path.length; i < l; ++i) {
            if(this.path[i].x === currentPosition.x &&
                this.path[i].z === currentPosition.z) {
                
                // not the end of path
                if(i < l-1) 
				{
					//console.log("move to :" + this.path[i+1].x + ", " this.path[i+1].z);
                    return { 	x: (this.path[i+1].x - currentPosition.x), 
								z: (this.path[i+1].z - currentPosition.z)}
                }
            }
        }

        // end of path, or current position not matched
        return {x: 0, z: 0}
    }
}