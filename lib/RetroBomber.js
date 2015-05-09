import THREE from 'three';
import Map from 'lib/Map';
import Player from 'lib/Player';
import HealthCube from 'lib/HealthCube';
import Coin from 'lib/Coin';
import Ghost from 'lib/Ghost';
import MathUtils from 'lib/MathUtils';
import * as DEF from "lib/Defines";

export default class RetroBomber {

  constructor() {
    this.width  = window.innerWidth;
    this.height = window.innerHeight;
    this.unitSize = 100;
    this.wallHeight = this.unitSize / 2;
    this.moveSpeed = 400;
    this.lookSpeed = 0.7;
    this.bulletMoveSpeed = this.moveSpeed * 5;
    this.numAI = 4;
    this.projectileDMG = 20;
    this.shadowMapSize  = 256;

    // engine vars
    this.scene = {};
    this.cam = {};
    this.renderer = {};
    this.composer = {};

    this.clock = {};
    this.stats = {};
    this.model = {};
    this.skin = {};
    this.floor = {};

    // GUI
    this.gui = {};

    // creatures
    this.creatures = [];

    // game play
    this.bullets = [];
    this.delta = 0;

    // game vars
    this.runAnim = true;

    this.healthCube = new HealthCube(this); //Object.create(HealthCube);
    this.map = new Map(this);
    this.player = new Player(this); // //controls = {};
  }

  // getters
  getWidth() {return this.width}
  getHeight() {return this.height}
  getAspect() {this.width / this.height}
  getUnitSize() {return this.unitSize}
  getWallHeight() {return this.wallHeight}
  getMoveSpeed() {return this.moveSpeed}
  getLookSpeed() {return this.lookSpeed}
  getBulletMoveSpeed() {return this.bulletMoveSpeed}
  getNumAI() {return this.numAI}
  getProjectileDamage() {return this.projectileDMG}
  getShadowMapSize() {return this.shadowMapSize}
  getMapSector(v) {return this.map.getMapSector(v)}

  init() {
    console.log("init");
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.wallHeight = this.unitSize;
    this.bulletMoveSpeed = this.moveSpeed * 5;

    this.map.init();

    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();

    // player + controller + cam init
    this.player.init();
    this.creatures.push(this.player);

    this.cam = this.player.cam;
    this.scene.add(this.cam);

    // world objects
    this.setupScene();

    // renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapSoft = false;

    /*
    this.renderer.autoClear = false;
    // Post Process
    var renderModel = new THREE.RenderPass(this.scene, this.cam);
    var effectBloom = new THREE.BloomPass(0.9);
    var effectFilm = new THREE.FilmPass(0.3, 0.5, 640, false);
    var shaderVignette = THREE.VignetteShader;
    var effectVignette = new THREE.ShaderPass(shaderVignette);
    effectVignette.uniforms["offset"].value = 0.95;
    effectVignette.uniforms["darkness"].value = 1;

    effectFilm.renderToScreen = true;

    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.addPass(new THREE.RenderPass(this.scene, this.cam));
    this.composer.addPass(renderModel);
    this.composer.addPass(effectVignette);
    this.composer.addPass(effectBloom);
    this.composer.addPass(effectFilm);
    //*/
    this.renderer.domElement.style.backgroundColor = "#000617";
    document.body.appendChild(this.renderer.domElement);

    // mouse events
    this.setupEventListeners();

    //init GUI
    //this.setupGUI(); // TODO
    this.animate();
  }

  setupScene () {
      var i, j, x, z,
          units = this.map.mapW,
          cube,
          textureBlock1 = THREE.ImageUtils.loadTexture(DEF.Texture[DEF.BLOCK_1]),
          textureBlock2 = THREE.ImageUtils.loadTexture(DEF.Texture[DEF.BLOCK_2]),
          materials = [],

          // lightning
          directionalLight1 = new THREE.DirectionalLight(0xd6e2ff, 1),
          unitsHalf = units * this.unitSize / 2;

      directionalLight1.target.position.set(0, 0, 0);
      directionalLight1.position.set(1000, 1000, 0);
      directionalLight1.shadowCameraVisible = true;
      directionalLight1.castShadow = true;
      directionalLight1.shadowCameraFar = units * this.unitSize * 2;

      directionalLight1.shadowCameraTop = unitsHalf;
      directionalLight1.shadowCameraBottom = -unitsHalf;
      directionalLight1.shadowCameraRight = unitsHalf;
      directionalLight1.shadowCameraLeft = -unitsHalf;
      directionalLight1.shadowMapSize = this.shadowMapSize;
      directionalLight1.shadowMapSoft = false;
      this.scene.add(directionalLight1);

      textureBlock1.minFilter = THREE.NearestFilter;
      textureBlock1.magFilter = THREE.NearestFilter;
      textureBlock2.minFilter = THREE.NearestFilter;
      textureBlock2.magFilter = THREE.NearestFilter;

      materials.push(new THREE.MeshLambertMaterial({ map: textureBlock1, emissive: 0xcccccc }));
      materials.push(new THREE.MeshLambertMaterial({ map: textureBlock2, emissive: 0xcccccc }));

      // Geometry: floor
      this.floor = new THREE.Mesh(
          new THREE.PlaneGeometry(units * this.unitSize, units * this.unitSize, 1, 1),
          new THREE.MeshBasicMaterial({ color: 0x0F1928 })
      );

      // add floor
      this.floor.rotation.x = -Math.PI / 2;
      this.floor.receiveShadow = true;
      this.scene.add(this.floor);

      // healthCube
      this.healthCube.init();
      this.healthCube.setPosition(-this.unitSize - 15, 35, -this.unitSize - 15);
      this.scene.add(this.healthCube.mesh);

      // Geometry: wall
      cube = new THREE.BoxGeometry(
          this.unitSize,
          this.wallHeight,
          this.unitSize
      );
      this.removeBottom(cube);

      // create map
      for (i = 0; i < this.map.mapW; i += 1) {
          for (j = 0; j < this.map.mapH; j += 1) {
              x = (i - units / 2) * this.unitSize;
              z = (j - units / 2) * this.unitSize;
              // cubes
              if (this.map.map[i][j] !== 0 && this.map.map[i][j] !== 4) {
                  var wall = new THREE.Mesh(cube, materials[this.map.map[i][j] - 1]);
                  wall.position.x = x;
                  wall.position.y = this.wallHeight / 2;
                  wall.position.z = z;
                  wall.castShadow = true;
                  wall.receiveShadow = false;
                  this.scene.add(wall);
              }
              // coins
              else if (this.map.map[i][j] == 0) {
                  var coin = new Coin(this);
                  coin.init();
                  coin.setPosition(x, this.unitSize / 4, z);
                  this.creatures.push(coin);
                  this.scene.add(coin.mesh);
              }
          }
      }

      // add enemies to the world
      this.setupAI();
  }

  setupAI () {
      var i = 0,
          list = this.map.getTypeList(0);

      for (i = 0; i < this.numAI; i += 1) {
          this.addAI(list);
      }
  }

  addAI (list) {
      var r = 0, x = 0, y = 0, z = 0;

      var o = new Ghost(this);
      var c = this.map.getMapSector(this.cam.position);

      o.init();

      do {
          r = MathUtils.rnd(0, list.length-1);
          x = list[r].x;
          z = list[r].z;
          // console.log(x, z);
      } while (x === c.x && z === c.z);

      x = Math.floor(x - this.map.mapW / 2) * this.unitSize;
      z = Math.floor(z - this.map.mapW / 2) * this.unitSize;

      o.setPosition(x, this.unitSize * 0.15, z);

      this.creatures.push(o);
      this.scene.add(o.mesh);
  }

  removeBottom (geo) {
      var newFaces = [];
      for (var j = 0, jl = geo.faces.length; j < jl; j++) {
          if (geo.faces[j].materialIndex !== 3) newFaces.push(geo.faces[j]);
      }
      geo.faces = newFaces;
      //console.log(geo);
      //console.log(newFaces);
  }

  setupEventListeners () {
      document.addEventListener("mousemove", this.onDocumentMouseMove.bind(this), false);
      document.addEventListener("click", this.onDocumentMouseClick.bind(this));
      window.onresize = this.onResize.bind(this);

      window.onfocus = () => {
          this.player.controller.freeze = false;
      };

      window.onblur = () => {
          this.player.controller.freeze = true;
      }
  }

  onDocumentMouseMove (event) {
      event.preventDefault();
      this.player.mouse.x = (event.clientX / this.width) * 2 - 1;
      this.player.mouse.y = -(event.clientY / this.height) * 2 - 1;
  }

  /**********************************************************************************
      *
      */
  onDocumentMouseClick (event) {
      event.preventDefault();
      // left click
      if (event.button === 2) {
          this.player.createBullet({parent: this});
      }
  }

  onResize () {
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      if (this.cam) {
          this.cam.aspect = this.getAspect();
          this.cam.updateProjectionMatrix();
      }

      if (this.renderer) {
          this.renderer.setSize(this.width, this.height);
      }
  }

  /**********************************************************************************
  * Helper function for browser frames
  */
  animate () {
      if (this.runAnim) {
          requestAnimationFrame(this.animate.bind(this));
      }
      this.render();
  }

  /***********************************************************************************
      *
      */
  render () {
      var delta = this.clock.getDelta();

      //updateGUI
      //this.stats.update(); //TODO

      if (this.healthCube !== null && this.player !== null) {
          this.healthCube.update(delta);
          this.healthCube.interact(this.player.mesh, this);
      }

      // move bullets : go backwards through the list so we can remove items.
      //this.updateBullets(delta);

      // move creatures
      this.updateCreatures(delta);

      // repaint
      this.renderer.render(this.scene, this.cam);
      //this.composer.render(delta); //TODO composer

      // death
      //if (this.health <= 0) {
      //    this.runAnim = false;

      //    // TODO : restart
      //}

  }

  updateCreatures (delta) {
      var i = 0;
      for (i = this.creatures.length - 1; i >= 0; i -= 1) {
          let a = this.creatures[i];

          //check death
          if (a.health <= 0) {
              this.creatures.splice(i, 1);
              this.scene.remove(i);
              this.kills += 1;
              this.addAI();
          }

          a.update(delta);
      }
  }

}
