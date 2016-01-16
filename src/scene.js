"use strict";

var twgl = require("twgl.js");

var Scene = function(width, height) {
    this.canvas = document.createElement('canvas');
    document.body.appendChild(this.canvas);

    this.gl = twgl.getWebGLContext(this.canvas);

    var arrays = {
        position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
    };
    this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, arrays);

    this.fbi = twgl.createFramebufferInfo(this.gl);
    
    this.width = width;
    this.height = height;
    this.gl.canvas.width = this.width;
    this.gl.canvas.height = this.height;
    this.gl.viewport(0, 0, this.width, this.height);
}

Scene.prototype.createBuffer = function(width, height) {
    width = width || this.width;
    height = height || this.height;
    var attachments = [
        {
            format: this.gl.RGBA,
            type: this.gl.UNSIGNED_BYTE,
            min: this.gl.NEAREST,
            mag: this.gl.NEAREST,
            wrap: this.gl.REPEAT
        }
    ];
    var fbi = twgl.createFramebufferInfo(
        this.gl,
        attachments,
        width,
        height
    )
    fbi.width = width;
    fbi.height = height;
    return fbi;
};

Scene.prototype.createProgramInfo = function(vs, fs) {
    return twgl.createProgramInfo(this.gl, [vs, fs]);
};

Scene.prototype.drawLastBuffer = function() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    twgl.drawBufferInfo(this.gl, this.gl.TRIANGLES, this.bufferInfo);
}

Scene.prototype.draw = function(spec) {

    this.gl.useProgram(spec.program.program);
    
    var uniforms = {};

    if (spec.uniforms) {
        Object.assign(uniforms, spec.uniforms);
    }

    if (spec.inputs) {
        var inputs = {};
        Object.keys(spec.inputs).map(function(key, index) {
            inputs[key] = spec.inputs[key].attachments[0];
        });
        Object.assign(uniforms, inputs);
    }

    var resolution = [this.width, this.height];

    if (spec.output) {
        var resolution = [spec.output.width, spec.output.height];
    }

    Object.assign(uniforms, {
        resolution: resolution,
    });

    twgl.setUniforms(spec.program, uniforms);

    if (spec.output) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, spec.output.framebuffer);
    } else {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    twgl.setBuffersAndAttributes(this.gl, spec.program, this.bufferInfo);
    twgl.drawBufferInfo(this.gl, this.gl.TRIANGLES, this.bufferInfo);
}

module.exports = Scene;
