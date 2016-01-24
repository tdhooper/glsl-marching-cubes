precision mediump float;

#pragma glslify: potentialAtVertex = require(./components/potential-at-vertex)
#pragma glslify: coordToIndex = require(./components/coord-to-index)
#pragma glslify: getCube = require(./components/cube)
#pragma glslify: getLookupTableIndex = require(./components/lookup-table-index)
#pragma glslify: lookup = require(./components/lookup)
#pragma glslify: and = require(./components/and)
#pragma glslify: shiftLeft = require(./components/shift-left)
#pragma glslify: packFloat = require(glsl-read-float)

uniform vec2 resolution;
uniform sampler2D edgeIndicesTable;
uniform sampler2D cubeVertsTable;
uniform sampler2D triTable;
uniform int edgeIndicesTable_size;
uniform int cubeVertsTable_size;
uniform int triTable_size;

uniform vec3 boundsA;
uniform vec3 boundsB;
uniform vec3 dims;

const int EDGE_COUNT = 12;
const int TRI_TABLE_ROW_SIZE = 16;

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
    index = floor(index / float(TRI_TABLE_ROW_SIZE) / 3.); // repeat for each tritable column, for x, y, and z
    vec3 dims2 = dims - vec3(1);
    if (index >= dims2.x * dims2.y * dims2.z) {
        return -1.;
    }
    return index;
}

vec3 calcVertex(vec3 cube, int edgeIndex) {

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

    return value;
}

int getTriEdgeIndex(int lookupIndex) {
    float iir = float(coordToIndex(gl_FragCoord.xy, resolution.xy));
    iir = floor(iir / 3.); // do for x, y, and z
    float indexInRow = mod(iir, float(TRI_TABLE_ROW_SIZE));

    float triTableLookup = float(lookupIndex) * float(TRI_TABLE_ROW_SIZE) + indexInRow;
    int vertexIndex = lookup(
        triTable,
        int(triTableLookup),
        triTable_size
    );

    return vertexIndex;
}

void main() {

    float cubeIndex = getCubeIndex();

    if (cubeIndex < 0.) {
        gl_FragColor = vec4(1);
        return;
    }

    vec3 cube = getCube(cubeIndex, dims);
    int lookupIndex = getLookupTableIndex(cube, scale, shift);

    int edgeIndex = getTriEdgeIndex(lookupIndex);

    if (edgeIndex > EDGE_COUNT - 1) {
        gl_FragColor = vec4(1);
        return;
    }

    vec3 vert = calcVertex(cube, edgeIndex);
    gl_FragColor = packFloat(getComponent(vert));
}
