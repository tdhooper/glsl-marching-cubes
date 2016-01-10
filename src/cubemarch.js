"use strict";

var glslify = require("glslify");
var twgl = require("twgl.js");
var R = require('ramda');
var unpackFloat = require("glsl-read-float")

var edgeTable = [
    0x0  , 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c,
    0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
    0x190, 0x99 , 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
    0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
    0x230, 0x339, 0x33 , 0x13a, 0x636, 0x73f, 0x435, 0x53c,
    0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
    0x3a0, 0x2a9, 0x1a3, 0xaa , 0x7a6, 0x6af, 0x5a5, 0x4ac,
    0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
    0x460, 0x569, 0x663, 0x76a, 0x66 , 0x16f, 0x265, 0x36c,
    0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
    0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff , 0x3f5, 0x2fc,
    0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
    0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55 , 0x15c,
    0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
    0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc ,
    0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
    0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc,
    0xcc , 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
    0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c,
    0x15c, 0x55 , 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
    0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc,
    0x2fc, 0x3f5, 0xff , 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
    0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c,
    0x36c, 0x265, 0x16f, 0x66 , 0x76a, 0x663, 0x569, 0x460,
    0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac,
    0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa , 0x1a3, 0x2a9, 0x3a0,
    0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c,
    0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33 , 0x339, 0x230,
    0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c,
    0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99 , 0x190,
    0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c,
    0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0
];

var cubeVerts = [
    0, 0, 0,
    1, 0, 0,
    1, 1, 0,
    0, 1, 0,
    0, 0, 1,
    1, 0, 1,
    1, 1, 1,
    0, 1, 1
];

var edgeIndices = [
    0, 1,
    1, 2,
    2, 3,
    3, 0,
    4, 5,
    5, 6,
    6, 7,
    7, 4,
    0, 4,
    1, 5,
    2, 6,
    3, 7
];

var toBaseArray = function(base, length, number) {
    var bits = new Array(length);
    var bit;
    var quotient;
    for (var i = 0; i < length; i++) {
        bit = number % base;
        quotient = Math.floor(number / base);
        bits[i] = bit;
        number = quotient;
    }
    return bits;
}

var packUint = R.curry(toBaseArray)(256, 4);

var addLookupTexture = function(name, gl, uniforms, table) {
    var packed = R.chain(packUint, table);
    var textures = twgl.createTextures(gl, {
      table: {
            mag: gl.NEAREST,
            min: gl.NEAREST,
            wrap: gl.CLAMP_TO_EDGE,
            src: packed,
            width: 1
        }
    });
    uniforms[name] = textures.table;
    uniforms[name + '_size'] = table.length;
}

var CubeMarch = function() {

    var canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    var gl = twgl.getWebGLContext(canvas);
    var programInfo = twgl.createProgramInfo(gl, [
        glslify('./shaders/shader.vert'),
        glslify('./shaders/shader.frag')
    ]);

    var arrays = {
      position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
    };
    var bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

    gl.canvas.width = gl.canvas.height = 256;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    var uniforms = {
        resolution: [gl.canvas.width, gl.canvas.height],
    };

    addLookupTexture('edgeTable', gl, uniforms, edgeTable);
    addLookupTexture('edgeIndicesTable', gl, uniforms, edgeIndices);
    addLookupTexture('cubeVertsTable', gl, uniforms, cubeVerts);

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

    this.gl = gl;
    this.uniforms = uniforms;
    this.programInfo = programInfo;
    this.bufferInfo = bufferInfo;
};

CubeMarch.prototype.march = function(dims, bounds) {

    var gl = this.gl;
    var uniforms = this.uniforms;

    this.uniforms.boundsA = bounds[0];
    this.uniforms.boundsB = bounds[1];
    this.uniforms.dims = dims;

    twgl.setUniforms(this.programInfo, uniforms);
    twgl.drawBufferInfo(this.gl, gl.TRIANGLES, this.bufferInfo);

    var pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
    gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    var pointCount = uniforms.dims[0] * uniforms.dims[1] * uniforms.dims[2] * 12 * 3;
    var r, g, b, a;
    var points = [];
    // return points;

    var pointIndex = 0;
    for (var i = 0; i < pointCount; i++) {
        r = pixels[i * 4 + 0];
        g = pixels[i * 4 + 1];
        b = pixels[i * 4 + 2];
        a = pixels[i * 4 + 3];
        if (r + a + b + g + a === 255 * 5) {
            continue;
        }
        // console.log(r, g, b, a);
        // continue;
        points[pointIndex] = points[pointIndex] || [];
        points[pointIndex].push(unpackFloat(r, g, b, a));
        if ((i + 1) % 3 == 0) {
            pointIndex += 1;
        }
    }
    return points;
};

module.exports = CubeMarch;
