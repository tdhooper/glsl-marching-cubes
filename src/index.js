"use strict";

var CubeMarch = require("./cubemarch");
var STLExporter = require("./stl-exporter");
var Renderer = require("./renderer");
var Ractive = require('ractive');
var PreviewControls = require('./controls/preview-controls.js');
var DownloadControls = require('./controls/download-controls.js');
var BoundingControls = require('./controls/bounding-controls.js');
var Editor = require('glsl-editor');
var fs = require('fs');

var example = fs.readFileSync(__dirname + '/shaders/example.glsl', 'utf8');
var config = {
    container: document.getElementById('main'),
    value: example
};

var editor = Editor(config);
editor.wrap.setAttribute('class', 'editor');

// inline CSS styles into bundle:
// both are optional.
require('glsl-editor/css');
require('glsl-editor/theme');

window.addEventListener('resize', editor.resize.bind(editor), false);

var state = {
    progress: 'Ready',
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

var cubeMarch = new CubeMarch();
var exporter = new STLExporter();
var renderer = new Renderer(document.getElementById('scene'));

var template = fs.readFileSync(__dirname + '/templates/controls.html', 'utf8');
var ractive = new Ractive({
    el: document.getElementById('main'),
    append: true,
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


var previewControls = new PreviewControls(cubeMarch, renderer, editor, ractive);
var downloadControls = new DownloadControls(cubeMarch, exporter, editor, ractive);
var boundingControls = new BoundingControls(renderer, ractive);

previewControls.init();
downloadControls.init();
boundingControls.init();
