"use strict";

var STLWriter = require("./stl-writer");

var STLExporter = function() {
    this.writer = new STLWriter();
}

STLExporter.prototype = {

    maxVerts: 6000000,

    startModel: function(filename) {
        this.part = -1;
        this.filename = filename;
        this.nextPart();
    },

    nextPart: function() {
        this.part += 1;
        this.vertIndex = -1;
        this.numVerts = 0;
        this.numFaces = 0;
        this.faces = new Float32Array(this.maxVerts);
    },

    addFace: function(v1, v2, v3) {
        if (this.numVerts + 9 > this.maxVerts) {
            this.save();
            this.nextPart();
        }

        this.faces[++this.vertIndex] = v1[0];
        this.faces[++this.vertIndex] = v1[1];
        this.faces[++this.vertIndex] = v1[2];
        this.faces[++this.vertIndex] = v2[0];
        this.faces[++this.vertIndex] = v2[1];
        this.faces[++this.vertIndex] = v2[2];
        this.faces[++this.vertIndex] = v3[0];
        this.faces[++this.vertIndex] = v3[1];
        this.faces[++this.vertIndex] = v3[2];

        this.numVerts += 9;
        this.numFaces += 1;
    },

    finishModel: function() {
        this.save();
        delete this.faces;
    },

    save: function() {
        var filename = [this.filename, 'part', this.part].join('-') + '.stl';
        this.writer.save(this.faces, this.numFaces, filename);
    }
};

module.exports = STLExporter;
