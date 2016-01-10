precision mediump float;

#pragma glslify: coordToIndex = require(./coord-to-index)
#pragma glslify: unpackUint = require(./unpack-uint)
#pragma glslify: or = require(./or)
#pragma glslify: and = require(./and)
#pragma glslify: shiftLeft = require(./shift-left)
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

const int VERTEX_COUNT = 8;
const int EDGE_COUNT = 12;

vec3 scale = (boundsB - boundsA) / dims;
vec3 shift = boundsA;

float map(vec3 p) {
    return length(p) - .5;
}

int lookup(sampler2D table, int index, int size) {
    vec2 uv = vec2(0, float(index) / float(size - 1));
    vec4 tex = texture2D(table, uv) * 256.;
    return unpackUint(tex);
}

vec3 lookupVertexCoord(int i) {
    return vec3(
        lookup(cubeVertsTable, i * 3, cubeVertsTable_size),
        lookup(cubeVertsTable, i * 3 + 1, cubeVertsTable_size),
        lookup(cubeVertsTable, i * 3 + 2, cubeVertsTable_size)
    );
}

vec3 vertexPosition(vec3 cube, int vertex) {
    vec3 v = lookupVertexCoord(vertex);
    return scale * (cube + v) + shift; 
}

float potentialAtVertex(vec3 cube, int vertex) {
    return map(vertexPosition(cube, vertex));
}

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

void main() {
    float cubeIndex = float(coordToIndex(gl_FragCoord.xy, resolution.xy));
    cubeIndex = floor(cubeIndex / float(EDGE_COUNT) / 3.); // do for each edge, for x, y, and z

    vec3 dims2 = dims - vec3(1);

    if (cubeIndex >= dims2.x * dims2.y * dims2.z) {
        gl_FragColor = vec4(1);
        return;
    }

    vec3 cube = vec3(0);
    cube.z = mod(cubeIndex, dims2.z);
    cube.y = mod(floor(cubeIndex / dims2.z), dims2.y);
    cube.x = mod(floor(cubeIndex / (dims2.y * dims2.z)), dims2.x);

    cube.xyz = cube.zxy;

    int edgeTableIndex = 0;
    int newIndex;
    float s;
    for (int i = 0; i < VERTEX_COUNT; i++) {
        s = potentialAtVertex(cube, i);
        newIndex = 0;
        if (s > 0.) {
            newIndex = shiftLeft(1, i);
        }
        edgeTableIndex = or(edgeTableIndex, newIndex);
    }

    int edge_mask = lookup(edgeTable, edgeTableIndex, edgeTable_size);

    if (edge_mask == 0) {
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

    float a = potentialAtVertex(cube, vertIndexA);
    float b = potentialAtVertex(cube, vertIndexB);
    float d = a - b;
    float t = 0.;
    if (abs(d) > 1e-6) {
        t = a / d;
    }

    vec3 value = scale * ( (cube + p0) + t * (p1 - p0) ) + shift;

    gl_FragColor = packFloat(getComponent(value));
}
