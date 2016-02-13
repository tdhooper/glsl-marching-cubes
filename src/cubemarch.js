"use strict";

var twgl = require("twgl.js");
var glslify = require("glslify");
var Scene = require('./scene');
var WorkerPool = require('./worker-pool');
var R = require('ramda');
var unpackFloat = require("glsl-read-float");
var splitVolume = require("./split-volume");

var CubeMarch = function() {
    this.scene = new Scene(1, 1);

    this.shaderVert = glslify('./shaders/shader.vert');
    this.calcPotentialsFrag = glslify('./shaders/calc-potentials.frag');

    this.startTime = new Date().getTime();
    this.numWorkers = 4;
    this.workerPool = new WorkerPool('build/workers/march.js', this.numWorkers);
};

CubeMarch.prototype.setVolume = function(dims, bounds) {
    var scene = this.scene;

    var vertexCount = (dims[0] + 1) * (dims[1] + 1) * (dims[2] + 1);
    var size = Math.ceil(Math.sqrt(vertexCount));
    scene.resize(size, size);
    var maxSize = scene.gl.drawingBufferWidth;
    // maxSize = 100;

    var volume = { dims: dims, bounds: bounds };
    this.volumes = splitVolume(volume, maxSize);

    var newSize = this.volumes.reduce(function(max, volume) {
        return Math.max(max, volume.size);
    }, 0);
    scene.resize(newSize, newSize);

    this.totalCubes = dims[0] * dims[1] * dims[2];
}

CubeMarch.prototype.sizeBuckets = function(pixels, maxSize) {
    return Math.ceil(pixels / Math.max(pixels / maxSize));
};

CubeMarch.prototype.calcPotentials = function(volumeIndex, pixels, uniforms) {
    var volume = this.volumes[volumeIndex];
    var potentialsBuffer;
    var potentials;
    var blockPotentialBuffers = [];
    var blockPotentials = [];

    for (var i = 0; i < this.numWorkers; i++) {
        potentialsBuffer = new ArrayBuffer(volume.vertexCount * 4);
        potentials = new Float32Array(potentialsBuffer);
        blockPotentialBuffers.push(potentialsBuffer);
        blockPotentials.push(potentials);
    }

    var r, g, b, a;
    var value;
    var i;
    var bl;
    var gl = this.scene.gl;

    uniforms.boundsA = volume.bounds[0];
    uniforms.boundsB = volume.bounds[1];
    uniforms.dims = volume.dims;

    this.scene.draw({
        program: this.potentialsProg,
        uniforms: uniforms
    });

    gl.readPixels(
        0, 0,
        gl.drawingBufferWidth, gl.drawingBufferHeight,
        gl.RGBA, gl.UNSIGNED_BYTE,
        pixels
    );

    for (i = 0; i < volume.vertexCount; i++) {
        r = pixels[i * 4 + 0];
        g = pixels[i * 4 + 1];
        b = pixels[i * 4 + 2];
        a = pixels[i * 4 + 3];
        value = unpackFloat(r, g, b, a);
        for (bl = 0; bl < this.numWorkers; bl++) {
            blockPotentials[bl][i] = value;
        }
    }

    return blockPotentialBuffers;
}

CubeMarch.prototype.marchVolume = function(config) {
    var volume = this.volumes[config.volumeIndex];
    var initialSpecs = [];
    var marchSpecs = [];

    for (var i = 0; i < this.numWorkers; i++) {
        initialSpecs.push({
            transferable: config.blockPotentialBuffers[i]
        });
    }

    this.workerPool.each('init', initialSpecs);

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
        config.onSection(data);
        config.onProgress(this.cubesMarched, this.totalCubes);
    };

    this.workerPool.each('march', marchSpecs, update.bind(this), config.onDone);
};

CubeMarch.prototype.abort = function() {
    this.workerPool.abort();
};

CubeMarch.prototype.march = function(config) {

    this.cubesMarched = 0;
    var gl = this.scene.gl;

    this.potentialsProg = this.scene.createProgramInfo(
        this.shaderVert,
        this.calcPotentialsFrag.replace('INSERT_MAP_DISTANCE', config.mapDistance)
    );

    var uniforms = {
        time: new Date().getTime() - this.startTime
    };

    var pixelCount = gl.drawingBufferWidth * gl.drawingBufferHeight;
    var pixels = new Uint8Array(pixelCount * 4);

    var blockPotentialBuffers;
    var volumeIndex = 0;

    var nextVolume = function() {
        if (volumeIndex >= this.volumes.length) {
            config.hasOwnProperty('onDone') && config.onDone();
            return;
        }

        blockPotentialBuffers = this.calcPotentials(volumeIndex, pixels, uniforms);

        this.marchVolume({
            volumeIndex: volumeIndex,
            blockPotentialBuffers: blockPotentialBuffers,
            onSection: config.onSection,
            onProgress: config.onProgress,
            onDone: nextVolume.bind(this)
        });

        volumeIndex += 1;
    };

    nextVolume.bind(this)();
};

module.exports = CubeMarch;
