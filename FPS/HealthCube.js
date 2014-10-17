/*global window, THREE, Stats, dat, requestAnimationFrame, console*/
/// <reference path="three.js" />

var HealthCube = Object.create(Creature);
HealthCube.lastHealthPickup = 0;
HealthCube.totalLifeTime = 0;


HealthCube.initMesh = function () {
    var health = THREE.ImageUtils.loadTexture("health.png");

    health.minFilter = THREE.NearestFilter;
    health.magFilter = THREE.NearestFilter;
    var size = RetroBomber.UNITSIZE / 3;
    this.mesh = new THREE.Mesh(
        new THREE.BoxGeometry(size, size, size),
        new THREE.MeshBasicMaterial({ map: health })
    );
    this.mesh.castShadow = true;
};


HealthCube.init = function () {
    if (this.mesh === null)
        this.initMesh();
};


HealthCube.update = function (delta) {
    // rotate it
    //this.mesh.rotation.x += 0.004;
    this.mesh.rotation.y += 0.008;

    this.totalLifeTime += delta;
    this.mesh.position.y = Math.sin(this.totalLifeTime) * 10 + 30;
};

HealthCube.interact = function (otherMesh, game) {
    // pickup health (max 1/min)
    if (Date.now() > this.lastHealthPickup + 10000) {

        var dist = RetroBomber.distance(otherMesh.position.x, otherMesh.position.y, this.mesh.position.x, this.mesh.position.y);
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
};
