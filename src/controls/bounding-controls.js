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
    this.ractive.observe('bounding', this.onUpdate.bind(this));
};

BoundingControls.prototype.onUpdate = function(value) {
    this.renderer.setBoundingBox(
        value.position.x,
        value.position.y,
        value.position.z,
        value.size.width,
        value.size.height,
        value.size.depth
    );
};

module.exports = BoundingControls;
