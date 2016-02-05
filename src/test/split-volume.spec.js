var splitVolume = require("../split-volume");

describe("split-march-volume", function() {
    "use strict";

    var volume;
    var maxSize;

    beforeEach(function() {
        volume = {};
    });

    describe('when volume is within max size', function() {

        beforeEach(function() {
            maxSize = Math.ceil(Math.sqrt(5 * 5 * 5));
            var dd = 4;
            volume.dims = [dd, dd, dd];
            var s = 1;
            volume.bounds = [
                [-s, -s, -s],
                [s, s, s]
            ];
        });

        it("there is only one volume", function() {
            var volumes = splitVolume(volume, maxSize);
            expect(volumes.length).toBe(1);
        });

        it("dims remain unchanged", function() {
            var volumes = splitVolume(volume, maxSize);
            expect(volumes[0].dims).toBe(volume.dims);
        });

        it("bounds remain unchanged", function() {
            var volumes = splitVolume(volume, maxSize);
            expect(volumes[0].bounds).toBe(volume.bounds);
        });

        it("vertexDims is dimensions plus one", function() {
            var volumes = splitVolume(volume, maxSize);
            expect(volumes[0].vertexDims).toEqual([5, 5, 5]);
        });

        it("vertex count is vertex dimensions volume", function() {
            var volumes = splitVolume(volume, maxSize);
            expect(volumes[0].vertexCount).toBe(125); // 5 * 5 * 5
        });

        it("size is square that will contain all verts", function() {
            var volumes = splitVolume(volume, maxSize);
            expect(volumes[0].size).toBe(12);
        });
    });

    describe('when volume is larger than max size', function() {

        beforeEach(function() {
            maxSize = 11;
            var dd = 4;
            volume.dims = [dd, dd, dd];
            var s = 1;
            volume.bounds = [
                [-s, -s, -s],
                [s, s, s]
            ];
        });

        it("volumes are split into two", function() {
            var volumes = splitVolume(volume, maxSize);
            expect(volumes.length).toBe(2);
        });

        it("dims are split along z axis", function() {
            var volumes = splitVolume(volume, maxSize);
            expect(volumes[0].dims).toEqual([4, 4, 2]);
            expect(volumes[1].dims).toEqual([4, 4, 2]);
        });

        it("bounds are split along z axis", function() {
            var volumes = splitVolume(volume, maxSize);
            expect(volumes[0].bounds).toEqual([[-1, -1, -1], [1, 1, 0]]);
            expect(volumes[1].bounds).toEqual([[-1, -1, 0], [1, 1, 1]]);
        });

        it("size is never bigger than max size", function() {
            var volumes = splitVolume(volume, maxSize);
            expect(volumes[0].size <= maxSize).toBe(true);
            expect(volumes[1].size <= maxSize).toBe(true);
        });
    });

    describe('when volume has uneven dimensions', function() {

        beforeEach(function() {
            maxSize = 11;
            volume.dims = [5, 8, 2];
            var s = 1;
            volume.bounds = [
                [-s, -s, -s],
                [s, s, s]
            ];
        });

        it("volumes are split into two", function() {
            var volumes = splitVolume(volume, maxSize);
            expect(volumes.length).toBe(2);
        });

        it("dims are split along longest axis", function() {
            var volumes = splitVolume(volume, maxSize);
            expect(volumes[0].dims).toEqual([5, 4, 2]);
            expect(volumes[1].dims).toEqual([5, 4, 2]);
        });

        it("bounds are split along longest axis", function() {
            var volumes = splitVolume(volume, maxSize);
            expect(volumes[0].bounds).toEqual([[-1, -1, -1], [1, 0, 1]]);
            expect(volumes[1].bounds).toEqual([[-1, 0, -1], [1, 1, 1]]);
        });

        it("size is never bigger than max size", function() {
            var volumes = splitVolume(volume, maxSize);
            expect(volumes[0].size <= maxSize).toBe(true);
            expect(volumes[1].size <= maxSize).toBe(true);
        });
    });

    describe('when volume is much larger than max size', function() {

        beforeEach(function() {
            maxSize = 8;
            volume.dims = [5, 8, 2];
            var s = 1;
            volume.bounds = [
                [-s, -s, -s],
                [s, s, s]
            ];
        });

        it("volumes are split twice", function() {
            var volumes = splitVolume(volume, maxSize);
            expect(volumes.length).toBe(4);
        });

        it("dims are split along longest axies, and rounded up", function() {
            var volumes = splitVolume(volume, maxSize);
            expect(volumes[0].dims).toEqual([3, 4, 2]);
            expect(volumes[1].dims).toEqual([3, 4, 2]);
            expect(volumes[2].dims).toEqual([3, 4, 2]);
            expect(volumes[3].dims).toEqual([3, 4, 2]);
        });

        it("bounds are split along longest axies", function() {
            var volumes = splitVolume(volume, maxSize);

            expect(volumes[0].bounds).toEqual([[-1, -1, -1], [0, 0, 1]]);
            expect(volumes[1].bounds).toEqual([[0, -1, -1], [1, 0, 1]]);
            expect(volumes[2].bounds).toEqual([[-1, 0, -1], [0, 1, 1]]);
            expect(volumes[3].bounds).toEqual([[0, 0, -1], [1, 1, 1]]);
        });

        it("size is never bigger than max size", function() {
            var volumes = splitVolume(volume, maxSize);
            expect(volumes[0].size <= maxSize).toBe(true);
            expect(volumes[1].size <= maxSize).toBe(true);
            expect(volumes[2].size <= maxSize).toBe(true);
            expect(volumes[3].size <= maxSize).toBe(true);
        });
    });
});
