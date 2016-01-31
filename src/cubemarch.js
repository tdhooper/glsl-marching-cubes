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

CubeMarch.prototype.march = function(updateGeometry, done, debug) {

    var time = function(name) { ! debug && console.time(name); };
    var timeEnd = function(name) { ! debug && console.timeEnd(name); };

    var scene = this.scene;
    var gl = this.gl;
    var dims = this.dims;
    var bounds = this.bounds;

    var workers = 4;
    var blocks = 8;

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
    var potentialsBuffer;
    var potentials;
    var blockPotentialBuffers = [];
    var blockPotentials = [];
    for (var i = 0; i < workers; i++) {
        potentialsBuffer = new ArrayBuffer(this.verts * 4);
        potentials = new Float32Array(potentialsBuffer);
        blockPotentialBuffers.push(potentialsBuffer);
        blockPotentials.push(potentials);
    }
    var r, g, b, a;
    var value;
    var bl;
    time("parsePixels");
    for (var i = 0; i < this.verts; i++) {
        r = pixels[i * 4 + 0];
        g = pixels[i * 4 + 1];
        b = pixels[i * 4 + 2];
        a = pixels[i * 4 + 3];
        value = unpackFloat(r, g, b, a);
        for (bl = 0; bl < workers; bl++) {
            blockPotentials[bl][i] = value;
        }
    }
    timeEnd("parsePixels");

    if (debug) {
        return;
    }

    time("startJobs");

    var initialSpecs = [];
    var marchSpecs = [];

    for (var i = 0; i < workers; i++) {
        initialSpecs.push({
            transferable: blockPotentialBuffers[i]
        });
    }

    var start;
    var end = 0;
    var cubes = dims[0] * dims[1] * dims[2];
    var verts = (dims[0] + 1) * (dims[1] + 1) * (dims[2] + 1);
    var overlap = Math.cbrt(verts) * Math.cbrt(verts);
    while (blocks--) {
        start = end;
        end = start + Math.floor((cubes - start) / (blocks + 1));
        marchSpecs.push({
            json: {
                start: start,
                end: end,
                pStart: 0,
                dims: dims,
                bounds: bounds
            }
        });
    }

    time("workerInit");  
    var workerPool = new WorkerPool('build/workers/march.js', workers);
    timeEnd("workerInit");  
    time("workerEach");  
    workerPool.each(initialSpecs);
    workerPool.each(marchSpecs, updateGeometry, done);
    timeEnd("workerEach");  
    timeEnd("startJobs");
};

module.exports = CubeMarch;
