var Creature = {
    health: 1,
    mesh: null,
    initMesh : function() {},
    init : function() {},
    update: function (delta) { },
    interact: function(mesh, game) { },
    // TODO other stuffs

    /**
     * set The mesh position 
     */
    setPosition: function (x, y, z) {
        if(this.mesh !== null)
        {
            this.mesh.position.set(x, y, z);
        }
    }
};