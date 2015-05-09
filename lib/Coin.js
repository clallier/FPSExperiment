import Creature from "lib/Creature";
import THREE from "three";
import RetroBomber from "lib/RetroBomber";
import * as DEF from "lib/Defines";

export default class Coin extends Creature {

  constructor(retroBomber) {
    super(retroBomber);
    this.totalLifeTime = 0;
    this.offset = 0;
  }

  initMesh () {
    super.initMesh();
    // texture
    var textureCoin = THREE.ImageUtils.loadTexture(DEF.Texture[DEF.COIN]);
    textureCoin.minFilter = THREE.NearestFilter;
    textureCoin.magFilter = THREE.NearestFilter;

    // material
    var materialCoin = new THREE.SpriteMaterial({ map: textureCoin, useScreenCoordinates: false });

    var size = this.retroBomber.getUnitSize() / 5;

    // Geometry: dots
    this.mesh = new THREE.Sprite(materialCoin);
    this.mesh.scale.set(size, size, 1.0);
  }

  setPosition (x, y, z) {
    super.setPosition(x, y, z);
    this.offset = x % Math.PI;
  };

  update (delta) {
    super.update(delta);
      this.totalLifeTime += delta;
      this.mesh.position.y = Math.sin(this.totalLifeTime+this.offset) * 5 + 15;
  };

  interact (otherMesh, game) {
    super.interact(otherMesh, game);
      // pickup health (max 1/min)
      //if (Date.now() > this.lastHealthPickup + 10000) {

      //    var dist = RetroBomber.distance(otherMesh.position.x, otherMesh.position.y, this.mesh.position.x, this.mesh.position.y);
      //    if (dist < 15 /*&& game.health !== 100*/) {
      //        game.health = Math.min(game.health + 50, 100);
      //        this.lastHealthPickup = Date.now();
      //    }

      //    this.mesh.material.additive = false;
      //} else {
      //    this.mesh.material.additive = true;
      //    //this.mesh.material.transparent = true;
      //    //this.mesh.material.opacity = 0.2;
      //}
  }
}
