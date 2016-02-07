"use strict";

var CubeMarch = require("./cubemarch");
var STLExporter = require("./stl-exporter");
var Renderer = require("./renderer");
var Ractive = require('ractive');

var dd = 50;
var dims = [dd, dd, dd];
var s = 1;
var bounds = [
    [-s, -s, -s],
    [s, s, s]
];

var cubeMarch = new CubeMarch(dims, bounds, document.getElementById('background'));
var exporter = new STLExporter();
var renderer = new Renderer(document.getElementById('scene'));

var fs = require('fs');
var template = fs.readFileSync(__dirname + '/templates/ui.html', 'utf8');
var ractive = new Ractive({
    el: '#ui',
    template: template
});



var updateProgress = function(cubesMarched, totalCubes) {
    ractive.set('progress', ((cubesMarched / totalCubes) * 100).toFixed(2) + '% complete');
};



var updateRender = function(data, cubesMarched, totalCubes) {
    updateProgress(cubesMarched, totalCubes);
    if ( ! data) {
        return;
    }
    renderer.addSection(data.vertices, data.faces);
};

var render = function() {
    cubeMarch.abort();
    renderer.startModel();
    cubeMarch.march({
        onSection: updateRender,
        onProgress: updateProgress
    });
};



var updateSave = function(data, cubesMarched, totalCubes) {
    updateProgress(cubesMarched, totalCubes);
    if ( ! data) {
        return;
    }
    exporter.addSection(data.vertices, data.faces);
};

var saveDone = function() {
    exporter.finishModel();
};

var save = function() {
    cubeMarch.abort();
    var filename = [
        'marched',
        new Date().getTime(),
        dims[0] + 'x' + dims[1] + 'x' + dims[2]
    ].join('-');
    exporter.startModel(filename);
    cubeMarch.march({
        onSection: updateSave,
        onProgress: updateProgress,
        onDone: saveDone
    });
};



ractive.on('start-render', render);
ractive.on('start-save', save);
