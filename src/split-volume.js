
var maxDimension = function(dims) {
    if (dims[0] > dims[1]) {
        if (dims[0] > dims[2]) {
            return 0;
        }
    } else if (dims[1] > dims[2]) {
        return 1;
    }
    return 2;
};

var subVectors = function(a, b) {
    var c = [];
    c[0] = a[0] - b[0];
    c[1] = a[1] - b[1];
    c[2] = a[2] - b[2];
    return c;
};

var addVectors = function(a, b) {
    var c = [];
    c[0] = a[0] + b[0];
    c[1] = a[1] + b[1];
    c[2] = a[2] + b[2];
    return c;
};

var multiplyVectors = function(a, b) {
    var c = [];
    c[0] = a[0] * b[0];
    c[1] = a[1] * b[1];
    c[2] = a[2] * b[2];
    return c;
};

var ceilVector = function(a) {
    var c = [];
    c[0] = Math.ceil(a[0]);
    c[1] = Math.ceil(a[1]);
    c[2] = Math.ceil(a[2]);
    return c;
};

var volumeFits = function(volume, maxSize) {
    var vertexDims = addVectors(volume.dims, [1, 1, 1]);
    var vertexCount = vertexDims[0] * vertexDims[1] * vertexDims[2];
    var maxVerts = Math.pow(maxSize, 2);
    return vertexCount < maxVerts;
}

var splitVolume = function(volume, maxSize) {
    var volumes = [];
    var bounds = volume.bounds;
    var dims = volume.dims;

    if ( ! volumeFits(volume, maxSize)) {
        var size = subVectors(bounds[1], bounds[0]);
        var slice = [1, 1, 1];
        slice[maxDimension(dims)] = 0.5;
        size = multiplyVectors(size, slice);

        volumes.push({
            bounds: [
                bounds[0],
                addVectors(bounds[0], size)
            ],
            dims: ceilVector(multiplyVectors(dims, slice))
        });
        volumes.push({
            bounds: [
                subVectors(bounds[1], size),
                bounds[1]
            ],
            dims: ceilVector(multiplyVectors(dims, slice))
        });
    } else {
        volumes.push({
            bounds: bounds,
            dims: dims
        });
    }

    volumes = volumes.reduce(function(vs, volume) {
        if (volumeFits(volume, maxSize)) {
            return vs.concat(volume);
        }
        return vs.concat(splitVolume(volume, maxSize));
    }, []);

    volumes = volumes.map(function(volume) {
        volume.vertexDims = addVectors(volume.dims, [1, 1, 1]);
        volume.vertexCount = volume.vertexDims[0] * volume.vertexDims[1] * volume.vertexDims[2];
        volume.size = Math.ceil(Math.sqrt(volume.vertexCount));
        return volume;
    });

    return volumes;
}

module.exports = splitVolume;
