"use strict";

var CubeMarch = require("./cubemarch");
var STLExporter = require("./stl-exporter");
var Renderer = require("./renderer");

var dd = 200;
var dims = [dd, dd, dd];
var s = 1;
var bounds = [
    [-s, -s, -s],
    [s, s, s]
];

var cubeMarch = new CubeMarch(dims, bounds);

var doExport = true;

var exporter = new STLExporter();
var renderer = new Renderer();

if (doExport) {

    var filename = [
        'marched',
        new Date().getTime(),
        dims[0] + 'x' + dims[1] + 'x' + dims[2],
    ].join('-');
    exporter.startModel(filename);

} else {

    renderer.startModel();

}

var progressEl = document.getElementById('progress');

var updateGeometry = function(data, cubesMarched, totalCubes) {

    progressEl.innerHTML = ((cubesMarched / totalCubes) * 100).toFixed(2) + '% complete';

    if ( ! data) {
        return;
    }

    if (doExport) {
        exporter.addSection(data.vertices, data.faces);
    } else {
        renderer.addSection(data.vertices, data.faces);
    }
};

var done = function() {
    console.timeEnd('march');
    if (doExport) {
        exporter.finishModel();
    }
};

console.time('march');
cubeMarch.march(updateGeometry, done);


