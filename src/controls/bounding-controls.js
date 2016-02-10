var ControlSection = require('./control-section.js').ControlSection;

var BoundingControls = function(ractive) {
    ControlSection.call(this, ractive);
};

BoundingControls.prototype = Object.create(ControlSection.prototype);
BoundingControls.prototype.constructor = BoundingControls;
BoundingControls.prototype.namespace = 'bounding';

module.exports = BoundingControls;
