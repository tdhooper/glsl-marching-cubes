"use strict";

var CubeMarch = require("./cubemarch");
var STLExporter = require("./stl-exporter");
var Renderer = require("./renderer");
var Ractive = require('ractive');

var s = 1;
var bounds = [
    [-s, -s, -s],
    [s, s, s]
];

var state = {
    preview: {
        resolution: 50
    },
    download: {
        resolution: 500
    }
};

var cubeMarch = new CubeMarch(document.getElementById('background'));
var exporter = new STLExporter();
var renderer = new Renderer(document.getElementById('scene'));

var fs = require('fs');
var template = fs.readFileSync(__dirname + '/templates/ui.html', 'utf8');
var ractive = new Ractive({
    el: '#ui',
    template: template,
    data: state
});



var Control = function(ractive) {
    this.ractive = ractive;
}

Control.prototype = {

    init: function() {
        this.ractive.on('busy', this.busyHandler.bind(this));
        this.ractive.on('ready', this.readyHandler.bind(this));
        this.ractive.on(this.ns('start'), this.start.bind(this));
        this.ractive.on(this.ns('cancel'), this.cancel.bind(this));
    },

    busyHandler: function(control) {
        if (control !== this) {
            this.ractive.set(this.ns('disable'), true);
        }
    },

    readyHandler: function() {
        this.ractive.set(this.ns('disable'), false);
    },

    done: function() {
        this.ractive.set(this.ns('showCancel'), false);
        this.ractive.fire('ready');
    },

    start: function() {
        this.ractive.set(this.ns('showCancel'), true);
        this.ractive.fire('busy', this);
    },

    cancel: function() {
        this.ractive.set('progress', '');
        this.ractive.set(this.ns('showCancel'), false);
        this.ractive.fire('ready');
    },

    progress: function(cubesMarched, totalCubes) {
        this.ractive.set('progress', ((cubesMarched / totalCubes) * 100).toFixed(2) + '% complete');
    },

    ns: function(key) {
        return [this.namespace, key].join('.');
    }
};



var Preview = function(cubeMarch, renderer, ractive) {
    Control.call(this, ractive);
    this.renderer = renderer;
    this.cubeMarch = cubeMarch;
}

Preview.prototype = Object.create(Control.prototype);
Preview.prototype.constructor = Preview;
Preview.prototype.parent = Control.prototype;
Preview.prototype.namespace = 'preview';

Preview.prototype.update = function(data) {
    if ( ! data) {
        return;
    }
    this.renderer.addSection(data.vertices, data.faces);
}

Preview.prototype.start = function() {
    this.parent.start.call(this);
    this.cubeMarch.abort();
    var dd = parseInt(this.ractive.get('preview.resolution'), 10);
    this.cubeMarch.setVolume([dd, dd, dd], bounds);
    this.renderer.startModel();
    this.cubeMarch.march({
        onSection: this.update.bind(this),
        onProgress: this.progress.bind(this),
        onDone: this.done.bind(this)
    });
};

Preview.prototype.cancel =function() {
    this.parent.cancel.call(this);
    this.cubeMarch.abort();
};



var Download = function(cubeMarch, exporter, ractive) {
    Control.call(this, ractive);
    this.exporter = exporter;
    this.cubeMarch = cubeMarch;
}

Download.prototype = Object.create(Control.prototype);
Download.prototype.constructor = Download;
Download.prototype.parent = Control.prototype;
Download.prototype.namespace = 'download';

Download.prototype.update = function(data) {
    if ( ! data) {
        return;
    }
    this.exporter.addSection(data.vertices, data.faces);
};

Download.prototype.done = function() {
    this.parent.done.call(this);
    this.exporter.finishModel();
};

Download.prototype.start = function() {
    this.parent.start.call(this);

    this.cubeMarch.abort();
    var dd = parseInt(this.ractive.get('download.resolution'), 10);
    var dims = [dd, dd, dd];
    this.cubeMarch.setVolume(dims, bounds);
    var filename = [
        'marched',
        new Date().getTime(),
        dims[0] + 'x' + dims[1] + 'x' + dims[2]
    ].join('-');
    this.exporter.startModel(filename);
    this.cubeMarch.march({
        onSection: this.update.bind(this),
        onProgress: this.progress.bind(this),
        onDone: this.done.bind(this)
    });
};

Download.prototype.cancel =function() {
    this.parent.cancel.call(this);
    this.cubeMarch.abort();
};


var preview = new Preview(cubeMarch, renderer, ractive);
var download = new Download(cubeMarch, exporter, ractive);

preview.init();
download.init();
