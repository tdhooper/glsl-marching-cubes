precision mediump float;

#pragma glslify: potentialAtVertex = require(./components/potential-at-vertex)
#pragma glslify: coordToIndex = require(./components/coord-to-index)
#pragma glslify: indexToCoord = require(./components/index-to-coord)
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
    index = floor(index / float(TRI_TABLE_ROW_SIZE) / 3.); // repeat for each tritable column, for x, y, and z
    vec3 dims2 = dims - vec3(1);
    if (index >= dims2.x * dims2.y * dims2.z) {
        return -1.;
    }
    return index;
}

vec4 getVertexComponentForCubeEdge(float cubeIndex, float edgeIndex, float component) {
    float index = cubeIndex * float(EDGE_COUNT) * 3. + edgeIndex * 3. + component;
    vec2 coord = indexToCoord(int(index), resolution.xy);
    return texture2D(vertices, coord.xy / resolution);
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
    iir = floor(iir / 3.); // do for x, y, and z
    float indexInRow = mod(iir, float(TRI_TABLE_ROW_SIZE));

    float triTableLookup = float(lookupIndex) * float(TRI_TABLE_ROW_SIZE) + indexInRow;
    int vertexIndex = lookup(
        triTable,
        int(triTableLookup),
        triTable_size
    );

    if (vertexIndex < 0) {
        gl_FragColor = vec4(1);
        return;
    }

    int xyz = coordToIndex(gl_FragCoord.xy, resolution.xy);
    float component = mod(float(xyz), 3.);

    gl_FragColor = getVertexComponentForCubeEdge(cubeIndex, float(vertexIndex), component);
}
