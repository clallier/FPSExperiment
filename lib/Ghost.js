import THREE from 'three';
import Creature from 'lib/Creature';
import RetroBomber from 'lib/RetroBomber';
import AStar from 'lib/AStar';
import MathUtils from 'lib/MathUtils';
import * as DEF from "lib/Defines";

export default class Ghost extends Creature {

  constructor(retroBomber) {
    super(retroBomber);
    this.lastShot = 0;
    this.astar = null;
    this.direction = {x: 0, z: 0};
    this.previousSector = {x: 0, z: 0};
    this.size = 30;
    this.i = 0;
  }

  initMesh () {
    super.initMesh();
    var health = THREE.ImageUtils.loadTexture(DEF.Texture[DEF.HEALTH]);

    health.minFilter = THREE.NearestFilter;
    health.magFilter = THREE.NearestFilter;
    this.size = this.retroBomber.getUnitSize() / 3;
    this.mesh = new THREE.Mesh(
        new THREE.BoxGeometry(this.size, this.size, this.size),
        new THREE.MeshBasicMaterial({map: health, color: 0xff0000})
    );
    this.mesh.castShadow = true;
    this.mesh.name = "ghost";// + (i++);
  };

  /**********************************************************************************
   *
   */
  init () {
    super.init();
    this.health = 100;
    this.lastShot = Date.now();
  };

  /**********************************************************************************
   *
   */
  update (delta) {
      super.update();
      var c = {}, // map sector AI
          cc = {};// map sector player

      var aispeed = delta * this.retroBomber.getMoveSpeed() / 2;
      if (aispeed > 3) aispeed = 3;

      // get sector
      let size = this.retroBomber.getUnitSize();
      var p = {
          x: this.mesh.position.x - this.direction.x * size / 2,
          z: this.mesh.position.z - this.direction.z * size / 2
      };

      c = this.retroBomber.map.getMapSector(p);

      // init if needed
      this.getNextMove(c);

      this.mesh.translateX(aispeed * this.direction.x);
      this.mesh.translateZ(aispeed * this.direction.z);

      this.previousSector = c;

      // world borders ???
      /*
       if (c.x < 0 || c.x >= this.retroBomber.map.mapW || c.y < 0 || c.y >= this.retroBomber.map.mapH || this.retroBomber.map.checkWallCollision(this.mesh.position)) {
       this.mesh.translateX(-2 * aispeed * this.lastRandomX);
       this.mesh.translateZ(-2 * aispeed * this.lastRandomZ);

       this.getNewMove();
       }

       if (c.x < -1 || c.x >= this.retroBomber.map.mapW || c.z < -1 || c.z >= this.retroBomber.map.mapH) {
       this.health = 0;
       }
       */
      // shoot
      /*
       cc = this.retroBomber.map.getMapSector(this.retroBomber.cam.position);
       if (Date.now() > this.lastShot + 750 && this.retroBomber.distance(c.x, c.z, cc.x, cc.z) < 2) {
       //this.createBullet(this);
       this.lastShot = Date.now();
       }
       */
  };

  getNewMove (currentSector) {
      // target node
      var list = this.retroBomber.map.getTypeList(0);

      var r = MathUtils.rnd(0, list.length - 1);
      var t = {x: list[r].x, z: list[r].z};
      //console.log(t.x, t.z);

      this.astar = new AStar();
      this.astar.init(this.retroBomber.map.map, currentSector, t);
  }

  getNextMove (currentSector) {
      if (this.astar === null)
          this.getNewMove(currentSector);

      // direction to next node in the A* path
      if (currentSector.x !== this.previousSector.x || currentSector.z !== this.previousSector.z) {
          this.direction = this.astar.getNextMove(currentSector);
          //console.log(this.direction.x + ", " + this.direction.z);
      }

      if (this.direction.x === 0 && this.direction.z === 0) {
          this.getNewMove(currentSector);
          this.direction = this.astar.getNextMove(currentSector);
          //console.log(this.direction.x + ", " + this.direction.z);
      }

  };

}
