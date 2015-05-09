import Creature from "lib/Creature";
import THREE from "three";
import RetroBomber from "lib/RetroBomber";
import MathUtils from "lib/MathUtils";
import * as DEF from "lib/Defines";

export default class HealthCube extends Creature {

  constructor(retroBomber) {
    super(retroBomber);
    this.lastHealthPickup = 0;
    this.totalLifeTime = 0;
  }

  initMesh () {
    super.initMesh();
    var health = THREE.ImageUtils.loadTexture(DEF.Texture[DEF.HEALTH]);

    health.minFilter = THREE.NearestFilter;
    health.magFilter = THREE.NearestFilter;
    var size = this.retroBomber.getUnitSize() / 3;
    this.mesh = new THREE.Mesh(
        new THREE.BoxGeometry(size, size, size),
        new THREE.MeshBasicMaterial({ map: health })
    );
    this.mesh.castShadow = true;
  }


  init () {
    super.init();
  }


  update (delta) {
    super.update(delta);
    // rotate it
    //this.mesh.rotation.x += 0.004;
    this.mesh.rotation.y += 0.008;

    this.totalLifeTime += delta;
    this.mesh.position.y = Math.sin(this.totalLifeTime) * 10 + 30;
  }

  interact (otherMesh, game) {
    super.interact(otherMesh, game);
      // pickup health (max 1/min)
      if (Date.now() > this.lastHealthPickup + 10000) {

          var dist = MathUtils.distance(otherMesh.position.x, otherMesh.position.y, this.mesh.position.x, this.mesh.position.y);
          if (dist < 15 /*&& game.health !== 100*/) {
              game.health = Math.min(game.health + 50, 100);
              this.lastHealthPickup = Date.now();
          }

          this.mesh.material.additive = false;
      } else {
          this.mesh.material.additive = true;
          //this.mesh.material.transparent = true;
          //this.mesh.material.opacity = 0.2;
      }
  }
}
