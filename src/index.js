"use strict";

var CubeMarch = require("./cubemarch");
var STLExporter = require("./stl-exporter");
var Renderer = require("./renderer");
var Ractive = require('ractive');
var PreviewControls = require('./controls/preview-controls.js');
var DownloadControls = require('./controls/download-controls.js');
var BoundingControls = require('./controls/bounding-controls.js');

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
    },
    bounding: {
        position: {
            x: 0,
            y: 0,
            z: 0
        },
        size: {
            width: 2,
            height: 2,
            depth: 2
        }
    },
};

var cubeMarch = new CubeMarch(document.getElementById('background'));
var exporter = new STLExporter();
var renderer = new Renderer(document.getElementById('scene'));

var fs = require('fs');
var template = fs.readFileSync(__dirname + '/templates/ui.html', 'utf8');
var ractive = new Ractive({
    el: '#ui',
    template: template,
    data: state,
    computed: {
        bounds: function() {
            var position = this.get('bounding.position');
            var size = this.get('bounding.size');
            var w2 = size.width / 2;
            var h2 = size.height / 2;
            var d2 = size.depth / 2;
            var bounds = [
                [position.x - w2, position.y - h2, position.z - d2],
                [position.x + w2, position.y + h2, position.z + d2]
            ];
            return bounds;
        }
    }
});


var previewControls = new PreviewControls(cubeMarch, renderer, ractive);
var downloadControls = new DownloadControls(cubeMarch, exporter, ractive);
var boundingControls = new BoundingControls(ractive);

previewControls.init();
downloadControls.init();
boundingControls.init();
