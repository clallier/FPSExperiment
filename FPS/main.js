/*global window, THREE, Stats, dat, requestAnimationFrame, console*/


// http://www.isaacsukin.com/news/2012/06/how-build-first-person-shooter-browser-threejs-and-webglhtml5-canvas


/*
* == RetroBomber ==
*/
//var RetroBomber = window.RetroBomber || {};


// game contructor
    // DEFINES
var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    ASPECT = WIDTH / HEIGHT,
    UNITSIZE = 250,
    WALLHEIGHT = UNITSIZE / 3,
    MOVESPEED = 100,
    LOOKSPEED = 0.075,
    BULLETMOVESPEED = MOVESPEED * 5,
    NUMAI = 5,
    PROJECTILEDAMAGE = 20,

    // engine vars
    scene = {},
    cam = {},
    renderer = {},
    controls = {},
    clock = {},
    stats = {},
    projector = {},
    model = {},
    skin = {},

    // GUI
    gui = {},

    // AI
    AI = [],
    aiGeo = {},

    // game play
    bullets = [],

    // game vars
    runAnim = true,
    mouse = {x: 0, y: 0},
    kills = 0,
    health = 100,
    healthCube = null,
    lastHealthPickup = 0,
    map = [],
    mapW = 0,
    mapH = 0,
    delta = 0,
    score = 0;
    

    
var getRandBetween = function (lo, hi) {
    'use strict';
    return parseInt(Math.floor(Math.random() * (hi - lo + 1)) + lo,  10);
};

var onResize = function () {
    'use strict';
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    ASPECT = WIDTH / HEIGHT;

    if (cam) {
        cam.aspect = ASPECT;
        cam.updateProjectionMatrix();
    }

    if (renderer) {
        renderer.setSize(WIDTH, HEIGHT);
    }
};
    
var distance = function (x1, y1, x2, y2) {
    'use strict';
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
};
    
var getMapSector = function (v) {
    'use strict';
    var x = Math.floor((v.x + UNITSIZE / 2) / UNITSIZE + mapW / 2),
        z = Math.floor((v.z + UNITSIZE / 2) / UNITSIZE + mapW / 2);
    return {x: x, z: z};
};

var initMap = function () {
    'use strict';
    map = [
        //  1  2  3  4  5  6  7  8  9
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
        [1, 1, 0, 0, 0, 0, 0, 1, 1, 1], // 1
        [1, 1, 0, 0, 2, 0, 0, 0, 0, 1], // 2
        [1, 0, 0, 0, 0, 2, 0, 0, 0, 1], // 3
        [1, 0, 0, 2, 0, 0, 2, 0, 0, 1], // 4
        [1, 0, 0, 0, 2, 0, 0, 0, 1, 1], // 5
        [1, 1, 1, 0, 0, 0, 0, 1, 1, 1], // 6
        [1, 1, 1, 0, 0, 1, 0, 0, 1, 1], // 7
        [1, 1, 1, 1, 1, 1, 0, 0, 1, 1], // 8
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];// 9
    mapW = map.length;
    mapH = map[0].length;
};


var setupScene = function () {
    'use strict';
    var i = 0, j = 0, wall,
        units = mapW,

        // Geometry: floor
        floor = new THREE.Mesh(
            new THREE.BoxGeometry(units * UNITSIZE, 10, units * UNITSIZE),
            new THREE.MeshLambertMaterial({color: 0xedcba0})
        ),

        // Geometry: wall
        cube = new THREE.BoxGeometry(UNITSIZE, WALLHEIGHT, UNITSIZE),
        materials = [
            new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('Block1.png'), minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter}),
            new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('Block2.png'), minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter})
        ],

        // healthCube
        healthCube = new THREE.Mesh(
            new THREE.BoxGeometry(30, 30, 30),
            new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('health.png'), minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter})
        ),

        // lightning
        directionalLight1 = new THREE.DirectionalLight(0xf7efbe, 0.7),
        directionalLight2 = new THREE.DirectionalLight(0xf7efbe, 0.5);

    // create map
    for (i = 0; i < mapW; i += 1) {
        for (j = 0; j < mapH; j += 1) {
            if (map[i][j]) {
                wall = new THREE.Mesh(cube, materials[map[i][j] - 1]);
                wall.position.x = (i - units / 2) * UNITSIZE;
                wall.position.y = WALLHEIGHT;
                wall.position.z = (j - units / 2) * UNITSIZE;
                scene.add(wall);
            }
        }
    }

    // add healthCube
    healthCube.position.set(-UNITSIZE - 15, 35, -UNITSIZE - 15);
    scene.add(healthCube);

    // lightning
    directionalLight1.position.set(0.5, 1, 0.5);
    directionalLight2.position.set(-0.5, -1, -0.5);
    scene.add(directionalLight1);
    scene.add(directionalLight2);
};


var setupGUI = function () {
    'use strict';
    gui = new dat.GUI();
    //gui.add("radar"); //TODO
    gui.add("health", health).listen();
    gui.add("score", score).listen();
};

var addAI = function () {
    'use strict';
    var c = getMapSector(cam.position),
        mat = THREE.ImageUtils.loadTexture("health.png"),
        aiMaterial = THREE.MeshBasicMaterial({map: mat}),
        o = THREE.Mesh(aiGeo, aiMaterial),
        x = 0,
        y = 0,
        z = 0;

    while (map[x][y] > 0 || (x === c.x && z === c.z)) {
        x = getRandBetween(0, mapW - 1);
        z = getRandBetween(0, mapH - 1);
    }

    x = Math.floor(x - mapW / 2) * UNITSIZE;
    z = Math.floor(z - mapW / 2) * UNITSIZE;

    o.position.set(x, UNITSIZE * 0.15, z);
    o.health = 100;
    o.pathPos = 1;
    o.lastRandomX = Math.random();
    o.lastRandomZ = Math.random();
    o.lastShot = Date.now();

    AI.push(o);
    scene.add(o);
};

var setupAI = function () {
    'use strict';
    var i = 0;
    aiGeo = new THREE.BoxGeometry(40, 40, 40);
    for (i = 0; i < NUMAI; i += 1) {
        addAI();
    }
};
    


var onDocumentMouseMove = function (event) {
    'use strict';
    event.preventDefault();
    mouse.x = (event.clientX / WIDTH) * 2 - 1;
    mouse.y = -(event.clientY / HEIGHT) * 2 - 1;
};
     

var onDocumentMouseClick = function (event) {
    'use strict';
    event.preventDefault();

    // left click
    if (event.which === 1) {
        createBullet();
    }
};

   

var setupEventListeners = function () {
    'use strict';
    document.addEventListener("mousemove", onDocumentMouseMove, false);
    document.addEventListener("click", onDocumentMouseClick);
    window.onresize = onResize;

    window.onfocus = function () {
        controls.freeze = false;
    };

    window.onblur = function () {
        controls.freeze = true;
    };
};
    
 
var createBullet = function (parent) {
    'use strict';
    // TODO caching mat
    var sphereMat = new THREE.MeshBasicMaterial({color: 0x333333}),
        sphereGeo = new THREE.SphereGeometry(2, 6, 6),
        sphere = new THREE.Mesh(sphereGeo, sphereMat),
        vector = {};

    if (parent === undefined) {
        parent = cam;
    }
    sphere.position.set(parent.position.x, parent.position.y * 0.8, parent.position.z);

    if (parent instanceof THREE.Camera) {
        vector = new THREE.Vector3(mouse.x, mouse.y, 1);
        projector.unprojectVector(vector, parent);
    }
};

/**
* Check if a vector3 ovelaps with a wall
* @param v 
* A THREE.vector
*
* @returns {boolean}
*
*/
var checkWallCollision = function (v) {
    'use strict';
    var c = getMapSector(v);
    return map[c.x][c.z] > 0;
};
    

var updateBullets = function (delta) {
    'use strict';
    var i = 0,
        j = 0,
        b, // bullet iterator
        p, // bullet pos
        d, // bullet dir
        a, // AI iterator
        v, // AI vertice 0
        c, // AI pos
        x, // AI vertice 0 x
        z, // AI vertice 0 z
        color,
        percent,
        hit = false,
        speed = delta * BULLETMOVESPEED;

    for (i = bullets.length - 1; i >= 0; i -= 1) {
        b = bullets[i];
        p = b.position;
        d = b.ray.direction;

        if (checkWallCollision(p)) {
            bullets.splice(i, 1);
            scene.remove(b);
            break;
        }

        for (j = AI.length - 1; j >= 0; j -= 1) {
            a = AI[j];
            v = a.geometry.vertices[0];
            c = a.position;
            x = Math.abs(v.x);
            z = Math.abs(v.z);

            if (p.x < c.x + x && p.x > c.x - x && p.z < c.z + z && p.z > c.z - z && b.owner !== a) {
                bullets.splice(i, 1);
                scene.remove(b);
                a.health -= PROJECTILEDAMAGE;
                color = a.material.color;
                percent = a.health / 100;
                a.material.color.setRGB(percent * color.r,
                                       percent * color.g,
                                       percent * color.b);
                hit = true;
                break;
            }
        }

        if (distance(p.x, p.z, cam.position.x, cam.position.z) < 25 && b.owner !== cam) {
            health -= 10;
            if (health < 0) {
                health = 0;
            }

            bullets.splice(i, 1);
            scene.remove(b);
        }
        if (!hit) {
            b.translateX(speed * d.x);
            b.translateZ(speed * d.z);
        }
    }
};


var updateAI = function (delta) {
    'use strict';
    var i = 0,
        a = {}, // AI
        c = {}, // map sector AI
        cc = {}, // map sector player
        r = Math.random(),
        aispeed = delta * MOVESPEED;

    for (i = AI.length - 1; i >= 0; i -= 1) {
        a = AI[i];

        //check death
        if (a.health <= 0) {
            AI.splice(i, 1);
            scene.remove(i);
            kills += 1;
            addAI();
        }

        // move
        if (r > 0.995) {
            a.lastRandomX = Math.random() * 2 - 1;
            a.lastRandomZ = Math.random() * 2 - 1;
        }
        a.translateX(aispeed * a.lastRandomX);
        a.translateZ(aispeed * a.lastRandomZ);
        c = getMapSector(a.position);

        // world borders
        if (c.x < 0 || c.x >= mapW || c.y < 0 || c.y >= mapH || checkWallCollision(a.position)) {
            a.translateX(-2 * aispeed * a.lastRandomX);
            a.translateZ(-2 * aispeed * a.lastRandomZ);

            a.lastRandomX = Math.random() * 2 - 1;
            a.lastRandomZ = Math.random() * 2 - 1;
        }

        if (c.x < -1 || c.x >= mapW || c.z < -1 || c.z >= mapH) {
            AI.splice(i, 1);
            scene.remove(a);
            addAI();
        }

        // shoot
        cc = getMapSector(cam.position);
        if (Date.now() > a.lastShot + 750 && distance(c.x, c.z, cc.x, cc.z) < 2) {
            createBullet(a);
            a.lastShot = Date.now();
        }
    }
};

  

var render = function () {
    'use strict';
    var delta = clock.getDelta();

    // move cam
    controls.update(delta);

    
    if (healthCube !== null && cam !== null) {
        // rotate the healthCube
        healthCube.rotation.x += 0.004;
        healthCube.rotation.y += 0.008;

        // pickup health (max 1/min)
        if (Date.now() > lastHealthPickup + 60000) {

            if (distance(cam.position.x, cam.position.y, healthCube.x, healthCube.y) < 15 && health !== 100) {
                health = Math.min(health + 50, 100);
                lastHealthPickup = Date.now();
            }
            healthCube.material.wireframe = false;
        } else {
            healthCube.material.wireframe = true;
        }
    }

    // move bullets : go backwards through the list so we can remove items.
    updateBullets(delta);

    // move AI
    updateAI(delta);

    // repaint
    renderer.render(scene, cam);

    // death
    if (health <= 0) {
        runAnim = false;

        // TODO : restart 
    }

};


// Helper function for browser frames
function animate() {
	if (runAnim) {
		requestAnimationFrame(animate);
	}
	render();
}


/*Init */
var init = function () {
    'use strict';
    initMap();

    clock = new THREE.Clock();
    projector = new THREE.Projector();
    scene = new THREE.Scene();
    scene.fog = THREE.FogExp2(0xd6f1ff, 0.0005);


    cam = new THREE.PerspectiveCamera(60, ASPECT, 1, 10000);
    cam.position.y = UNITSIZE * 0.2; // Raise the camera off the ground
    scene.add(cam);
    controls = new THREE.FirstPersonControls(cam);
    controls.movementSpeed = MOVESPEED;
    controls.lookSpeed = LOOKSPEED;
    controls.lookVertical = false;
    controls.noFly = true;
    
    // world objects
    setupScene();

    // add enemies to the world
    //setupAI();

    // renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(WIDTH, HEIGHT);
    renderer.domElement.style.backgroundColor = "#d6f1ff";
    document.body.appendChild(renderer.domElement);

    // mouse events
    setupEventListeners();
    
    //init GUI
    //setupGUI();
    animate();
};

/*On load*/
window.addEventListener("load", init());