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
uniform sampler2D vertices;

uniform sampler2D edgeTable;
uniform sampler2D cubeVertsTable;
uniform sampler2D triTable;
uniform int edgeTable_size;
uniform int cubeVertsTable_size;
uniform int triTable_size;

uniform vec3 boundsA;
uniform vec3 boundsB;
uniform vec3 dims;

const int EDGE_COUNT = 12;
const int TRI_TABLE_ROW_SIZE = 16;

vec3 scale = (boundsB - boundsA) / dims;
vec3 shift = boundsA;


float getCubeIndex() {
    float index = float(coordToIndex(gl_FragCoord.xy, resolution.xy));
    index = floor(index / float(TRI_TABLE_ROW_SIZE)); // repeat for each tritable column
    vec3 dims2 = dims - vec3(1);
    if (index >= dims2.x * dims2.y * dims2.z) {
        return -1.;
    }
    return index;
}

void main() {
    float cubeIndex = getCubeIndex();

    if (cubeIndex < 0.) {
        gl_FragColor = vec4(1);
        return;
    }

    vec3 cube = getCube(cubeIndex, dims);
    int lookupIndex = getLookupTableIndex(cube, cubeVertsTable, cubeVertsTable_size, scale, shift);
    int edge_mask = lookup(edgeTable, lookupIndex, edgeTable_size);

    if (edge_mask == 0) {
        gl_FragColor = vec4(1);
        return;
    }

    float iir = float(coordToIndex(gl_FragCoord.xy, resolution.xy));
    float indexInRow = mod(iir, float(TRI_TABLE_ROW_SIZE));

    float triTableLookup = float(lookupIndex) * float(TRI_TABLE_ROW_SIZE) + indexInRow;
    int vertexIndex = lookup(
        triTable,
        int(triTableLookup),
        triTable_size
    );

    float offset = cubeIndex * float(EDGE_COUNT);
    gl_FragColor = packFloat(offset + float(vertexIndex));
}
