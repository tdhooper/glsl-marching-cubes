"use strict";

var twgl = require("twgl.js");
var glslify = require("glslify");
var Scene = require('./scene');
var WorkerPool = require('./worker-pool');
var R = require('ramda');
var unpackFloat = require("glsl-read-float");

var CubeMarch = function(dims, bounds) {

    this.verts = (dims[0] + 1) * (dims[1] + 1) * (dims[2] + 1);
    var pixels = this.verts;
    var size = Math.ceil(Math.sqrt(pixels));
    // size = nextPowerOfTwo(size);
    var scene = new Scene(size, size);
    if (size > scene.gl.drawingBufferWidth) {
        throw new Error('Context too big');
    }

    var uniforms = {
        boundsA: bounds[0],
        boundsB: bounds[1],
        dims: dims
    };

    this.potentialsProg = scene.createProgramInfo(
        glslify('./shaders/shader.vert'),
        glslify('./shaders/calc-potentials.frag')
    );

    this.scene = scene;
    this.gl = scene.gl;
    this.uniforms = uniforms;
    this.dims = dims;
    this.bounds = bounds;
    this.startTime = new Date().getTime();
};

CubeMarch.prototype.march = function(updateGeometry, debug) {

    var time = function(name) { ! debug && console.time(name); };
    var timeEnd = function(name) { ! debug && console.timeEnd(name); };

    var scene = this.scene;
    var gl = this.gl;
    var dims = this.dims;
    var bounds = this.bounds;

    this.uniforms.time = new Date().getTime() - this.startTime;

    this.scene.draw({
        program: this.potentialsProg,
        uniforms: this.uniforms
    });

    var pixelCount = gl.drawingBufferWidth * gl.drawingBufferHeight;
    var pixels = new Uint8Array(pixelCount * 4);
    time("readPixels");
    gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    timeEnd("readPixels");
    var potentials = [];
    var r, g, b, a;
    time("parsePixels");
    for (var i = 0; i < pixelCount; i++) {
        r = pixels[i * 4 + 0];
        g = pixels[i * 4 + 1];
        b = pixels[i * 4 + 2];
        a = pixels[i * 4 + 3];
        if (r + a + b + g + a === 255 * 5) {
            continue;
        }
        potentials.push(unpackFloat(r, g, b, a));
    }
    timeEnd("parsePixels");

    if (debug) {
        return;
    }

    var cubes = [];
    for (var z = 0; z < dims[2]; z++) {
        for (var y = 0; y < dims[1]; y++) {
            for (var x = 0; x < dims[0]; x++) {
                cubes.push([x, y, z]);
            }
        }
    }

    var configs = cubes.map(function(cube) {
        return {
            cube: cube,
            dims: dims,
            bounds: bounds,
            potentials: potentials
        };
    });

    var workerPool = new WorkerPool('build/workers/march.js', 4);
    workerPool.each(configs, updateGeometry);
};

module.exports = CubeMarch;
