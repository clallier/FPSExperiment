/*global window, THREE, Stats, dat, requestAnimationFrame, console*/
/// <reference path="three.js" />

var Player = Object.create(Creature);
Player.controller = null;
Player.cam = null;
Player.score = 0;
Player.kills = 0;
Player.mouse = { x: 0, y: 0 };
Player.projector = {};

Player.initMesh = function () {
};


Player.init = function () {
    if (this.mesh === null)
        this.initMesh();

    this.cam = new THREE.PerspectiveCamera(60, this.ASPECT, 1, 3000);
    this.cam.position.y = RetroBomber.UNITSIZE * 0.4;//2000;// // Raise the camera off the ground
    //this.cam.rotation.x = 4.7;
    this.mesh = this.cam;

    this.controller = new THREE.FirstPersonControls(this.cam);
    this.controller.movementSpeed = RetroBomber.MOVESPEED;
    this.controller.lookSpeed = RetroBomber.LOOKSPEED;
    this.controller.lookVertical = false;

    this.projector = new THREE.Projector();
};


Player.update = function (delta) {
    this.controller.update(delta);
};

/**********************************************************************************
    *
    */
Player.createBullet = function () {
    'use strict';
    // TODO caching mat
    var sphereMat = new THREE.MeshBasicMaterial({ color: 0x333333 }),
        sphereGeo = new THREE.SphereGeometry(2, 6, 6),
        sphere = new THREE.Mesh(sphereGeo, sphereMat),
        vector = {};

    sphere.position.set(this.mesh.position.x, this.mesh.position.y * 0.8, this.mesh.position.z);

    if (this.mesh instanceof THREE.Camera) {
        vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 1);
        this.projector.unprojectVector(vector, this.mesh);
    }
};
