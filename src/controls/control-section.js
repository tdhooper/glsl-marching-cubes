
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
        this.ractive.set(this.ns('disable'), true);
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
    this.ractive.observe(this.ns('proportional'), this.onProportionalUpdate.bind(this));
    this.ractive.observe('bounding.size.*', this.onBoundingUpdate.bind(this));
};

ProcessControls.prototype.onResolutionUpdate = function(value, old, keypath) {
    if (value == undefined) {
        return;
    }
    if (this.ractive.get(this.ns('proportional'))) {
        var component = keypath.split('.').pop();
        this.setProportionalResolution(value, component);
    }
};

ProcessControls.prototype.onProportionalUpdate = function(value) {
    if (value) {
        this.forceProportions('x');
    }
};

ProcessControls.prototype.onBoundingUpdate = function(value, old, keypath) {
    if (value == undefined) {
        return;
    }
    if (this.ractive.get(this.ns('proportional'))) {
        var bound = keypath.split('.').pop();
        var nonCorrespondingComponent = {'height': 'x', 'depth': 'y', 'width': 'z'}[bound];
        this.forceProportions(nonCorrespondingComponent);
    }
};

ProcessControls.prototype.forceProportions = function(component) {
    var value = this.ractive.get(this.ns('resolution.' + component));
    this.setProportionalResolution(value, component);
};

ProcessControls.prototype.setProportionalResolution = function(value, component) {
    var base = this.boundForComp(component);
    var x = this.boundForComp('x');
    var y = this.boundForComp('y');
    var z = this.boundForComp('z');
    if (x == undefined || y == undefined || z == undefined) {
        return;
    }
    this.ractive.set(this.ns('resolution.x'), Math.round((x / base) * value));
    this.ractive.set(this.ns('resolution.y'), Math.round((y / base) * value));
    this.ractive.set(this.ns('resolution.z'), Math.round((z / base) * value));
};

ProcessControls.prototype.boundForComp = function(component) {
    var bound = {'x': 'width', 'y': 'height', 'z': 'depth'}[component]
    return this.ractive.get('bounding.size.' + bound);
};

ProcessControls.prototype.done = function() {
    this.ractive.set('progress', this.doneMessage());
    this.ractive.set(this.ns('showCancel'), false);
    this.ractive.fire('ready');
};

ProcessControls.prototype.start = function() {
    this.startTime = new Date().getTime();
    this.ractive.set(this.ns('showCancel'), true);
    this.ractive.fire('busy', this);
};

ProcessControls.prototype.cancel = function() {
    this.ractive.set('progress', 'Ready');
    this.ractive.set(this.ns('showCancel'), false);
    this.ractive.fire('ready');
};

ProcessControls.prototype.progress = function(cubesMarched, totalCubes) {
    this.ractive.set('progress', this.progressMessage(cubesMarched, totalCubes));
};

ProcessControls.prototype.progressMessage = function(cubesMarched, totalCubes) {
    var duration = this.formatDuration(this.startTime, new Date().getTime());
    return [
        '<strong>',
        ((cubesMarched / totalCubes) * 100).toFixed(2),
        '%</strong> complete, running for ',
        duration
    ].join('');
};

ProcessControls.prototype.doneMessage = function() {
    var duration = this.formatDuration(this.startTime, new Date().getTime());
    return 'completed in ' + duration;
};

ProcessControls.prototype.formatDuration = function(start, end) {
    var d = new Date(end - start);
    var values = [
        d.getHours(),
        d.getMinutes(),
        d.getSeconds(),
        d.getMilliseconds()
    ]
    values = values.reduce(function(prev, current, index, arr) {
        return prev.length ? prev : current ? arr.slice(index) : [];
    });
    values = values.reverse().map(function(value, index) {
        var unit = ['ms', 's', 'm', 'h'];
        return '<strong>' + value + '</strong>' + unit[index]
    }).reverse();
    return values.join(' ');
};

module.exports.ControlSection = ControlSection;
module.exports.ProcessControls = ProcessControls;
