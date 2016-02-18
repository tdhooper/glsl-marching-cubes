var ControlSection = require('./control-section.js').ControlSection;

var BoundingControls = function(renderer, ractive) {
    ControlSection.call(this, ractive);
    this.renderer = renderer;
};

BoundingControls.prototype = Object.create(ControlSection.prototype);
BoundingControls.prototype.constructor = BoundingControls;
BoundingControls.prototype.namespace = 'bounding';

BoundingControls.prototype.init = function() {
    ControlSection.prototype.init.call(this);
    this.ractive.observe(this.ns('size'), this.onUpdate.bind(this));
    this.ractive.observe(this.ns('position'), this.onUpdate.bind(this));
    this.ractive.observe(this.ns('visible'), this.toggleVisibilty.bind(this));
};

BoundingControls.prototype.onUpdate = function() {
    var bounding = this.ractive.get(this.namespace);
    this.renderer.setBoundingBox(
        bounding.position.x,
        bounding.position.y,
        bounding.position.z,
        bounding.size.width,
        bounding.size.height,
        bounding.size.depth
    );
};

BoundingControls.prototype.toggleVisibilty = function(visible) {
    this.renderer.toggleBoundingBox(visible);
};

module.exports = BoundingControls;
