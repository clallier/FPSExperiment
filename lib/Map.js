import RetroBomber from 'lib/RetroBomber';

export default class Map {

  constructor(retroBomber) {
    this.mapW = 0;
    this.mapH = 0;
    this.map = [];
    this.retroBomber = retroBomber;
  }

  init(){
    //var bsp = new BSP(20, 20);
    //this.map = bsp.get2DMap();

    this.map = [
        // //  1  2  3  4  5  6  7  8  9
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
  }

  /**********************************************************************************
   * TODO :
   * : convertToSector qui retourne { x: x, z: z }
   * et getMapSector qui retourne la valeur du secteur (0,1,2,3 ou 4)
   */
  getMapSector (v) {
    let size = this.retroBomber.getUnitSize();
      var x = Math.floor((v.x + size / 2) / size + this.mapW / 2),
          z = Math.floor((v.z + size / 2) / size + this.mapW / 2);
      return { x: x, z: z };
  }


  /**********************************************************************************
      * Check if a vector3 ovelaps with a wall
      * @param v
      * A THREE.vector
      *
      * @returns {boolean}
      *
      */
  checkWallCollision (v) {
      var c = this.getMapSector(v);
      return this.map[c.x][c.z] > 0;
  }

  getTypeList (type) {
      var list = [], x, z, p;

      for (x = 0; x < this.mapW; x += 1) {
          for (z = 0; z < this.mapH; z += 1) {
              // cubes
              if (this.map[x][z] === type) {
                  p = { x: x, z: z };
                  list.push(p);
              }
          }
      }
      return list;
  }
}
