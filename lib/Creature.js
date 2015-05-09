
export default class Creature {

  constructor(retroBomber) {
    this.mesh = null;
    this.retroBomber = retroBomber;
  }

  init() {
    if (this.mesh == null) {
        this.initMesh();
    }
  }

  initMesh() {}
  update (delta) {}
  interact (otherMesh, game) {}

  setPosition (x, y, z) {
    if(this.mesh != null) {
        this.mesh.position.set(x, y, z);
    }
  }
}
