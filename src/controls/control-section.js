
var ControlSection = function(ractive) {
    this.ractive = ractive;
};

ControlSection.prototype = {

    init: function() {
        this.ractive.on('busy', this.busyHandler.bind(this));
        this.ractive.on('ready', this.readyHandler.bind(this));
    },

    ns: function(key) {
        return [this.namespace, key].join('.');
    },

    busyHandler: function(control) {
        if (control !== this) {
            this.ractive.set(this.ns('disable'), true);
        }
    },

    readyHandler: function() {
        this.ractive.set(this.ns('disable'), false);
    }
};


var ProcessControls = function(ractive) {
    ControlSection.call(this, ractive);
};

ProcessControls.prototype = Object.create(ControlSection.prototype);
ProcessControls.prototype.constructor = ProcessControls;

ProcessControls.prototype.init = function() {
    ControlSection.prototype.init.call(this);
    this.ractive.on(this.ns('start'), this.start.bind(this));
    this.ractive.on(this.ns('cancel'), this.cancel.bind(this));
    this.ractive.observe(this.ns('resolution.*'), this.onResolutionUpdate.bind(this));
    this.ractive.observe(this.ns('equal'), this.onEqualUpdate.bind(this));
};

ProcessControls.prototype.onResolutionUpdate = function(value) {
    if (this.ractive.get(this.ns('equal'))) {
        this.ractive.set(this.ns('resolution.x'), value);
        this.ractive.set(this.ns('resolution.y'), value);
        this.ractive.set(this.ns('resolution.z'), value);
    }
};

ProcessControls.prototype.onEqualUpdate = function(value) {
    if (value) {
        first = this.ractive.get(this.ns('resolution.x'));
        this.ractive.set(this.ns('resolution.x'), first);
        this.ractive.set(this.ns('resolution.y'), first);
        this.ractive.set(this.ns('resolution.z'), first);
    }
};

ProcessControls.prototype.done = function() {
    this.ractive.set(this.ns('showCancel'), false);
    this.ractive.fire('ready');
};

ProcessControls.prototype.start = function() {
    this.ractive.set(this.ns('showCancel'), true);
    this.ractive.fire('busy', this);
};

ProcessControls.prototype.cancel = function() {
    this.ractive.set('progress', '');
    this.ractive.set(this.ns('showCancel'), false);
    this.ractive.fire('ready');
};

ProcessControls.prototype.progress = function(cubesMarched, totalCubes) {
    this.ractive.set('progress', ((cubesMarched / totalCubes) * 100).toFixed(2) + '% complete');
};

module.exports.ControlSection = ControlSection;
module.exports.ProcessControls = ProcessControls;
