/*global window, THREE, Stats, dat, requestAnimationFrame, console*/
/// <reference path="three.js" />

var Coin = Object.create(Creature);
Coin.totalLifeTime = 0;
Coin.offset = 0;

Coin.initMesh = function () {
    // texture
    var textureCoin = THREE.ImageUtils.loadTexture("ball.png");
    textureCoin.minFilter = THREE.NearestFilter;
    textureCoin.magFilter = THREE.NearestFilter;

    // material
    var materialCoin = new THREE.SpriteMaterial({ map: textureCoin, useScreenCoordinates: false, })

    var size = RetroBomber.UNITSIZE / 5;

    // Geometry: dots
    this.mesh = new THREE.Sprite(materialCoin);
    this.mesh.scale.set(size, size, 1.0);
};


Coin.init = function () {
    if (this.mesh === null)
        this.initMesh();
};

Coin.setPosition = function (x, y, z) {
    Creature.setPosition.call(this, x, y, z);
    this.offset = x % Math.PI;
};


Coin.update = function (delta) {
    this.totalLifeTime += delta;
    this.mesh.position.y = Math.sin(this.totalLifeTime+this.offset) * 5 + 15;
};

Coin.interact = function (otherMesh, game) {
    
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
};
