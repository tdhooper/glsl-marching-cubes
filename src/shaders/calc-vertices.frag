precision mediump float;

#pragma glslify: potentialAtVertex = require(./components/potential-at-vertex)
#pragma glslify: coordToIndex = require(./components/coord-to-index)
#pragma glslify: getLookupTableIndex = require(./components/lookup-table-index)
#pragma glslify: lookup = require(./components/lookup)
#pragma glslify: and = require(./components/and)
#pragma glslify: shiftLeft = require(./components/shift-left)
#pragma glslify: packFloat = require(glsl-read-float)

uniform vec2 resolution;
uniform sampler2D edgeTable;
uniform sampler2D edgeIndicesTable;
uniform sampler2D cubeVertsTable;
uniform int edgeTable_size;
uniform int edgeIndicesTable_size;
uniform int cubeVertsTable_size;

uniform vec3 boundsA;
uniform vec3 boundsB;
uniform vec3 dims;

const int EDGE_COUNT = 12;

vec3 scale = (boundsB - boundsA) / dims;
vec3 shift = boundsA;


float getComponent(vec3 value) {
    int xyz = coordToIndex(gl_FragCoord.xy, resolution.xy);
    xyz = int(mod(float(xyz), 3.));
    if (xyz == 0) {
        return value.x;
    }
    if (xyz == 1) {
        return value.y;
    }
    if (xyz == 2) {
        return value.z;
    }
}

float getCubeIndex() {
    float index = float(coordToIndex(gl_FragCoord.xy, resolution.xy));
    index = floor(index / float(EDGE_COUNT) / 3.); // do for each edge, for x, y, and z
    vec3 dims2 = dims - vec3(1);
    if (index >= dims2.x * dims2.y * dims2.z) {
        return -1.;
    }
    return index;
}

vec3 getCube(float index) {
    vec3 dims2 = dims - vec3(1);
    vec3 cube = vec3(0);
    cube.z = mod(index, dims2.z);
    cube.y = mod(floor(index / dims2.z), dims2.y);
    cube.x = mod(floor(index / (dims2.y * dims2.z)), dims2.x);
    cube.xyz = cube.zxy;
    return cube;
}

void main() {
    float cubeIndex = getCubeIndex();

    if (cubeIndex < 0.) {
        gl_FragColor = vec4(1);
        return;
    }

    vec3 cube = getCube(cubeIndex);
    int lookupIndex = getLookupTableIndex(cube, cubeVertsTable, cubeVertsTable_size, scale, shift);
    int edge_mask = lookup(edgeTable, lookupIndex, edgeTable_size);

    if (edge_mask == 0) {
        // split here to reduce num pixels read
        // gl_FragColor = vec4(1,0,0,1);
        gl_FragColor = vec4(1);
        return;
    }

    float ei = float(coordToIndex(gl_FragCoord.xy, resolution.xy));
    ei = floor(ei / 3.); // do for x, y, and z
    int edgeIndex = int(mod(ei, float(EDGE_COUNT)));

    if (( and(edge_mask, shiftLeft(1, edgeIndex)) ) == 0) {
        gl_FragColor = vec4(1);
        return;
    }

    int vertIndexA = lookup(edgeIndicesTable, edgeIndex * 2, edgeIndicesTable_size);
    int vertIndexB = lookup(edgeIndicesTable, edgeIndex * 2 + 1, edgeIndicesTable_size);
    vec3 p0 = vec3(
        lookup(cubeVertsTable, vertIndexA * 3, cubeVertsTable_size),
        lookup(cubeVertsTable, vertIndexA * 3 + 1, cubeVertsTable_size),
        lookup(cubeVertsTable, vertIndexA * 3 + 2, cubeVertsTable_size)
    );
    vec3 p1 = vec3(
        lookup(cubeVertsTable, vertIndexB * 3, cubeVertsTable_size),
        lookup(cubeVertsTable, vertIndexB * 3 + 1, cubeVertsTable_size),
        lookup(cubeVertsTable, vertIndexB * 3 + 2, cubeVertsTable_size)
    );

    float a = potentialAtVertex(cube, vertIndexA, cubeVertsTable, cubeVertsTable_size, scale, shift);
    float b = potentialAtVertex(cube, vertIndexB, cubeVertsTable, cubeVertsTable_size, scale, shift);
    float d = a - b;
    float t = 0.;
    if (abs(d) > 1e-6) {
        t = a / d;
    }

    vec3 value = scale * ( (cube + p0) + t * (p1 - p0) ) + shift;

    gl_FragColor = packFloat(getComponent(value));
}

      //var f = triTable[lookupIndex];
      // offset = cubeIndex * EDGE_COUNT * 3
      // for(var i=0; i<f.length; i += 3) {
      // faces.push([
      //   offset + f[i],
      //   offset + f[i+1],
      //   offset + f[i+2]
      // ]);
      // }

