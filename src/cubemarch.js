"use strict";

var twgl = require("twgl.js");
var glslify = require("glslify");
var Scene = require('./scene');
var WorkerPool = require('./worker-pool');
var R = require('ramda');
var unpackFloat = require("glsl-read-float");
var splitVolume = require("./split-volume");

var CubeMarch = function(dims, bounds, el) {
    var vertexCount = (dims[0] + 1) * (dims[1] + 1) * (dims[2] + 1);
    var size = Math.ceil(Math.sqrt(vertexCount));
    var scene = new Scene(size, size);
    el && el.appendChild(scene.canvas);
    var maxSize = scene.gl.drawingBufferWidth;
    // maxSize = 100;

    var volume = { dims: dims, bounds: bounds };
    this.volumes = splitVolume(volume, maxSize);

    var newSize = this.volumes.reduce(function(max, volume) {
        return Math.max(max, volume.size);
    }, 0);
    scene.resize(newSize, newSize);

    this.potentialsProg = scene.createProgramInfo(
        glslify('./shaders/shader.vert'),
        glslify('./shaders/calc-potentials.frag')
    );

    this.totalCubes = dims[0] * dims[1] * dims[2];
    this.scene = scene;
    this.gl = scene.gl;
    this.startTime = new Date().getTime();
};

CubeMarch.prototype.sizeBuckets = function(pixels, maxSize) {
    return Math.ceil(pixels / Math.max(pixels / maxSize));
};

CubeMarch.prototype.calcPotentials = function(volumeIndex, pixels, uniforms, workers) {
    var volume = this.volumes[volumeIndex];
    var potentialsBuffer;
    var potentials;
    var blockPotentialBuffers = [];
    var blockPotentials = [];

    for (var i = 0; i < workers; i++) {
        potentialsBuffer = new ArrayBuffer(volume.vertexCount * 4);
        potentials = new Float32Array(potentialsBuffer);
        blockPotentialBuffers.push(potentialsBuffer);
        blockPotentials.push(potentials);
    }

    var r, g, b, a;
    var value;
    var i;
    var bl;
    var gl = this.gl;

    uniforms.boundsA = volume.bounds[0];
    uniforms.boundsB = volume.bounds[1];
    uniforms.dims = volume.dims;

    this.scene.draw({
        program: this.potentialsProg,
        uniforms: uniforms
    });

    gl.readPixels(
        0, 0,
        this.gl.drawingBufferWidth, this.gl.drawingBufferHeight,
        gl.RGBA, gl.UNSIGNED_BYTE,
        pixels
    );

    for (i = 0; i < volume.vertexCount; i++) {
        r = pixels[i * 4 + 0];
        g = pixels[i * 4 + 1];
        b = pixels[i * 4 + 2];
        a = pixels[i * 4 + 3];
        value = unpackFloat(r, g, b, a);
        for (bl = 0; bl < workers; bl++) {
            blockPotentials[bl][i] = value;
        }
    }

    return blockPotentialBuffers;
}

CubeMarch.prototype.marchVolume = function(volumeIndex, blockPotentialBuffers, updateGeometry, done) {
    var volume = this.volumes[volumeIndex];
    var workers = blockPotentialBuffers.length;
    var initialSpecs = [];
    var marchSpecs = [];

    for (var i = 0; i < workers; i++) {
        initialSpecs.push({
            transferable: blockPotentialBuffers[i]
        });
    }

    var workerPool = new WorkerPool('build/workers/march.js', workers);
    workerPool.each(initialSpecs);

    var blocks = 256;
    var start;
    var end = 0;
    var cubes = volume.dims[0] * volume.dims[1] * volume.dims[2];
    while (blocks--) {
        start = end;
        end = start + Math.floor((cubes - start) / (blocks + 1));
        marchSpecs.push({
            json: {
                start: start,
                end: end,
                dims: volume.dims,
                bounds: volume.bounds
            }
        });
    }

    var update = function(data, configIndex) {
        var spec = marchSpecs[configIndex].json;
        this.cubesMarched += spec.end - spec.start;
        updateGeometry(data, this.cubesMarched, this.totalCubes);
    };

    workerPool.each(marchSpecs, update.bind(this), done);
}

CubeMarch.prototype.march = function(updateGeometry, done, debug) {

    this.cubesMarched = 0;
    var gl = this.gl;

    var workers = 4;

    var uniforms = {
        time: new Date().getTime() - this.startTime
    };

    var pixelCount = gl.drawingBufferWidth * gl.drawingBufferHeight;
    var pixels = new Uint8Array(pixelCount * 4);

    var blockPotentialBuffers;
    var volumeIndex = 0;

    var nextVolume = function() {
        if (volumeIndex >= this.volumes.length) {
            done();
            return;
        }

        blockPotentialBuffers = this.calcPotentials(volumeIndex, pixels, uniforms, workers);
        this.marchVolume(volumeIndex, blockPotentialBuffers, updateGeometry, nextVolume.bind(this));

        volumeIndex += 1;
    };

    nextVolume.bind(this)();
};

module.exports = CubeMarch;
