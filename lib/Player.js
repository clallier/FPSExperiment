import THREE from 'three';
import Creature from 'lib/Creature';
import RetroBomber from 'lib/RetroBomber';
import FirstPersonControls from 'lib/FirstPersonControls';

export default class Player extends Creature {

  constructor(retroBomber) {
    super(retroBomber);
    this.controller = null;
    this.cam = null;
    this.score = 0;
    this.kills = 0;
    this.mouse = { x: 0, y: 0 };
    this.projector = {};

  }

  init () {
      super.init();

      this.cam = new THREE.PerspectiveCamera(60, this.retroBomber.getAspect(), 1, 3000);
      this.cam.position.y = this.retroBomber.getUnitSize() * 0.4;//2000;// // Raise the camera off the ground
      //this.cam.rotation.x = 4.7;
      this.mesh = this.cam;

      this.controller = new FirstPersonControls(this.cam);
      this.controller.movementSpeed = this.retroBomber.getMoveSpeed();
      this.controller.lookSpeed = this.retroBomber.getLookSpeed();
      this.controller.lookVertical = false;

      this.projector = new THREE.Projector();
  }

  update (delta) {
    super.update();

    var dx, dz, tx, tz, sector, value,
        x = this.mesh.position.x,
        z = this.mesh.position.z;

    this.controller.update(delta);
    dx = this.mesh.position.x - x;
    dz = this.mesh.position.z - z;

    tx = this.mesh.position.x + 3 * dx;
    tz = this.mesh.position.z + 3 * dz;
    sector = this.retroBomber.map.getMapSector({x: tx, y: this.mesh.position.y, z: tz});
    value = this.retroBomber.map.map[sector.x][sector.z];
    if (value !== 0) {
        this.mesh.position.x = x;
        this.mesh.position.z = z;
    }
  }

  createBullet () {
    // TODO caching mat
    var sphereMat = new THREE.MeshBasicMaterial({ color: 0x333333 }),
        sphereGeo = new THREE.SphereGeometry(2, 6, 6),
        sphere = new THREE.Mesh(sphereGeo, sphereMat),
        vector = {};

    sphere.position.set(this.cam.position.x, this.cam.position.y * 0.8, this.cam.position.z);

    if (this.mesh instanceof THREE.Camera) {
        vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 1);
        this.projector.unprojectVector(vector, this.mesh);
    }
  }
}
