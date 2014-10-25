/*global window, THREE, Stats, dat, requestAnimationFrame, console*/
/// <reference path="three.js" />
/// <reference path="postprocessing/RenderPass.js" />
/// <reference path="postprocessing/EffectComposer.js" />
/// <reference path="postprocessing/BloomPass.js" />
/// <reference path="postprocessing/FilmPass.js" />
/// <reference path="postprocessing/ShaderPass.js" />
/// <reference path="shaders/VignetteShader.js" />
/// <reference path="shaders/DotScreenShader.js" />
/// <reference path="stats.min.js" />

//== RetroBomber ==
var RetroBomber = {

    WIDTH : window.innerWidth,
    HEIGHT: window.innerHeight,
    ASPECT: this.WIDTH / this.HEIGHT,
    UNITSIZE: 100,
    WALLHEIGHT: this.UNITSIZE / 2,
    MOVESPEED: 400,
    LOOKSPEED: 0.7,
    BULLETMOVESPEED: this.MOVESPEED * 5,
    NUMAI: 1,
    PROJECTILEDAMAGE: 20,
    SHADOW_MAP_SIZE : 256,

    // engine vars
    scene: {},
    cam: {},
    renderer: {},
    composer: {},

    clock: {},
    stats: {},
    model: {},
    skin: {},
    floor: {},

    // GUI
    gui: {},

    // creatures
    creatures: [],

    // game play
    bullets: [], // TODO remove => creatures
    delta: 0,

    // game vars
    runAnim: true,

    healthCube: Object.create(HealthCube),
    map: Object.create(Map),
    player: {},     //controls: {},

    /**********************************************************************************
     *
     */
    getRandBetween: function (lo, hi) {
        'use strict';
        return parseInt(Math.floor(Math.random() * (hi - lo + 1)) + lo, 10);
    },


    /**********************************************************************************
    *
    */
    onResize: function () {
        'use strict';
        this.WIDTH = window.innerWidth;
        this.HEIGHT = window.innerHeight;
        this.ASPECT = this.WIDTH / this.HEIGHT;

        if (this.cam) {
            this.cam.aspect = this.ASPECT;
            this.cam.updateProjectionMatrix();
        }

        if (this.renderer) {
            this.renderer.setSize(this.WIDTH, this.HEIGHT);
        }
    },

    /**********************************************************************************
    *
    */
    distance: function (x1, y1, x2, y2) {
        'use strict';
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    },


    /**********************************************************************************
    *
    */
    setupScene: function () {
        'use strict';
        var i = 0, j = 0,
            units = this.map.mapW,
            cube,
            textureBlock1 = THREE.ImageUtils.loadTexture("Block1.png"),
            textureBlock2 = THREE.ImageUtils.loadTexture("Block2.png"),
            materials = [],

            // lightning
            directionalLight1 = new THREE.DirectionalLight(0xd6e2ff, 1);

        directionalLight1.target.position.set(0, 0, 0);
        directionalLight1.position.set(1000, 1000, 0);
        directionalLight1.shadowCameraVisible = true;
        directionalLight1.castShadow = true;
        directionalLight1.shadowCameraFar = units * this.UNITSIZE*2;
        var unitsHalf = units * this.UNITSIZE / 2;
        directionalLight1.shadowCameraTop = unitsHalf
        directionalLight1.shadowCameraBottom = -unitsHalf;
        directionalLight1.shadowCameraRight = unitsHalf;
        directionalLight1.shadowCameraLeft = -unitsHalf;
        directionalLight1.shadowMapSize = this.SHADOW_MAP_SIZE;
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
            new THREE.PlaneGeometry(units * this.UNITSIZE, units * this.UNITSIZE, 1, 1),
            new THREE.MeshBasicMaterial({ color: 0x0F1928 })
        );

        // add floor
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.receiveShadow = true;
        this.scene.add(this.floor);

        // healthCube
        this.healthCube.init();
        this.healthCube.setPosition(-this.UNITSIZE - 15, 35, -this.UNITSIZE - 15);
        this.scene.add(this.healthCube.mesh);

        // Geometry: wall
        cube = new THREE.BoxGeometry(
            this.UNITSIZE,
            this.WALLHEIGHT,
            this.UNITSIZE);
        this.removeBottom(cube);


        // create map
        for (i = 0; i < this.map.mapW; i += 1) {
            for (j = 0; j < this.map.mapH; j += 1) {
                var x = (i - units / 2) * this.UNITSIZE;
                var z = (j - units / 2) * this.UNITSIZE;
                
                // cubes 
                if (this.map.map[i][j] != 0 && this.map.map[i][j] != 4) {
                    var wall = new THREE.Mesh(cube, materials[this.map.map[i][j] - 1]);
                    wall.position.x = x;
                    wall.position.y = this.WALLHEIGHT / 2;
                    wall.position.z = z;
                    wall.castShadow = true;
                    wall.receiveShadow = false;
                    this.scene.add(wall);
                }
                    // coins
                else if (this.map.map[i][j] == 0) {
                    var coin = Object.create(Coin);
                    coin.init();
                    coin.setPosition(x, this.UNITSIZE / 4, z);
                    this.creatures.push(coin);
                    this.scene.add(coin.mesh);
                }
            }
        }

        // add enemies to the world
        this.setupAI();
    },


    /**********************************************************************************
        *
        */
    removeBottom: function (geo) {
        var newFaces = [];
        for (var j = 0, jl = geo.faces.length; j < jl; j++) {
            if (geo.faces[j].materialIndex !== 3) newFaces.push(geo.faces[j]);
        }
        geo.faces = newFaces;
        //console.log(geo);
        //console.log(newFaces);
    },


    /**********************************************************************************
        *
        */
    setupGUI: function () {
        'use strict';
        /*
        this.gui = new dat.GUI();
        var parameters = { x: 0, y: 0, z: 0 };
        var rotx = this.gui.add(parameters, "x").min(-Math.PI*2).max(Math.PI*2).step(0.1).listen();
        var roty = this.gui.add(parameters, "y").min(-Math.PI*2).max(Math.PI*2).step(0.1).listen();
        var rotz = this.gui.add(parameters, "z").min(-Math.PI*2).max(Math.PI*2).step(0.1).listen();

        var that = this;

        rotx.onChange(function (value)
        { that.cam.rotation.x = value; });
        roty.onChange(function (value)
        { that.cam.rotation.y = value; });
        rotz.onChange(function (value)
        { that.cam.rotation.z = value; });
        */
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        document.body.appendChild(this.stats.domElement);
    },


   


    /**********************************************************************************
         *
         */
    onDocumentMouseMove: function (event) {
        'use strict';
        event.preventDefault();
        this.player.mouse.x = (event.clientX / this.WIDTH) * 2 - 1;
        this.player.mouse.y = -(event.clientY / this.HEIGHT) * 2 - 1;
    },


    /**********************************************************************************
        *
        */
    onDocumentMouseClick: function (event) {
        'use strict';
        event.preventDefault();

        // left click
        if (event.which === 1) {
            this.player.createBullet();
        }
    },


    /**********************************************************************************
        *
        */
    setupEventListeners: function () {
        'use strict';
        document.addEventListener("mousemove", this.onDocumentMouseMove.bind(this), false);
        document.addEventListener("click", this.onDocumentMouseClick.bind(this));
        window.onresize = this.onResize.bind(this);

        var that = this;
        window.onfocus = function () {
            that.player.controller.freeze = false;
        };

        window.onblur = function () {
            that.player.controller.freeze = true;
        };
    },




    /**********************************************************************************
        *
        */
    updateBullets: function (delta) {
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
            speed = delta * this.BULLETMOVESPEED;

        for (i = this.bullets.length - 1; i >= 0; i -= 1) {
            b = this.bullets[i];
            p = b.position;
            d = b.ray.direction;

            if (this.checkWallCollision(p)) {
                this.bullets.splice(i, 1);
                this.scene.remove(b);
                break;
            }

            for (j = creatures.length - 1; j >= 0; j -= 1) {
                a = creatures[j];
                v = a.geometry.vertices[0];
                c = a.position;
                x = Math.abs(v.x);
                z = Math.abs(v.z);

                if (p.x < c.x + x && p.x > c.x - x && p.z < c.z + z && p.z > c.z - z && b.owner !== a) {
                    this.bullets.splice(i, 1);
                    this.scene.remove(b);
                    a.health -= this.PROJECTILEDAMAGE;
                    color = a.material.color;
                    percent = a.health / 100;
                    a.material.color.setRGB(percent * color.r,
                                            percent * color.g,
                                            percent * color.b);
                    hit = true;
                    break;
                }
            }

            if (this.distance(p.x, p.z, this.cam.position.x, this.cam.position.z) < 25 && b.owner !== this.cam) {
                this.health -= 10;
                if (this.health < 0) {
                    this.health = 0;
                }

                this.bullets.splice(i, 1);
                this.scene.remove(b);
            }
            if (!hit) {
                b.translateX(speed * d.x);
                b.translateZ(speed * d.z);
            }
        }
    },

   
    /**********************************************************************************
        *
        */
    render: function () {
        'use strict';
        var delta = this.clock.getDelta();

        //updateGUI
        this.stats.update();

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
        //this.composer.render(delta);

        // death
        //if (this.health <= 0) {
        //    this.runAnim = false;

        //    // TODO : restart
        //}

    },


    /**********************************************************************************
    * Helper function for browser frames
    */
    animate: function () {
        if (this.runAnim) {
            requestAnimationFrame(this.animate.bind(this));
        }
        this.render();
    },

    
    /**********************************************************************************
     *
     */
    setupAI: function () {
        'use strict';
        var i = 0,
            list = this.map.getTypeList(0);

        for (i = 0; i < this.NUMAI; i += 1) {
            this.addAI(list);
        }
    },

    
    /**********************************************************************************
     *
     */
    addAI: function (list) {
        'use strict';
        var r = 0, x = 0, y = 0, z = 0;
        
        var o = Object.create(Ghost);
        var c = this.map.getMapSector(this.cam.position);

        o.init();

        do {
            r = this.getRandBetween(0, list.length-1);
            x = list[r].x;
            z = list[r].z;
            x = 2, z = 2;
            console.log(x, z);
        } while (x === c.x && z === c.z);
            
        x = Math.floor(x - this.map.mapW / 2) * this.UNITSIZE;
        z = Math.floor(z - this.map.mapW / 2) * this.UNITSIZE;

        o.setPosition(x, this.UNITSIZE * 0.15, z);

        this.creatures.push(o);
        this.scene.add(o.mesh);
    },

    /**********************************************************************************
     *
     */
    updateCreatures: function (delta) {
        var i = 0;
        for (i = this.creatures.length - 1; i >= 0; i -= 1) {
            a = this.creatures[i];

            //check death
            if (a.health <= 0) {
                this.creatures.splice(i, 1);
                this.scene.remove(i);
                this.kills += 1;
                this.addAI();
            }

            a.update(delta);
        }
    },


    /**********************************************************************************
    * Init
    */
    init: function () {
        'use strict';
        this.WIDTH = window.innerWidth;
        this.HEIGHT = window.innerHeight;
        this.ASPECT = this.WIDTH / this.HEIGHT;
        this.WALLHEIGHT = this.UNITSIZE;
        this.BULLETMOVESPEED = this.MOVESPEED * 5;

        this.map.init();

        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
        
        // player + controller + cam init
        this.player = Object.create(Player);
        this.player.init();
        this.creatures.push(this.player);

        this.cam = this.player.cam;
        this.scene.add(this.cam);
        
        // world objects
        this.setupScene();

        // renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.WIDTH, this.HEIGHT);
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
        */
        this.renderer.domElement.style.backgroundColor = "#000617";
        document.body.appendChild(this.renderer.domElement);

        // mouse events
        this.setupEventListeners();

        //init GUI
        this.setupGUI();
        this.animate();
    }
}
//**************************************************************************************************************************