precision mediump float;

#pragma glslify: coordToIndex = require(./components/coord-to-index)
#pragma glslify: getCube = require(./components/cube)
#pragma glslify: packFloat = require(glsl-read-float)
#pragma glslify: map = require(./components/map)

uniform vec2 resolution;

uniform vec3 boundsA;
uniform vec3 boundsB;
uniform vec3 dims;

const int VERTEX_COUNT = 8;

vec3 scale = (boundsB - boundsA) / dims;
vec3 shift = boundsA;


vec3 vertexPosition(vec3 cube, int vertex) {
    vec3 v = vec3(0);
    if (vertex == 1) {
        v = vec3(1, 0, 0);
    } else if (vertex == 2) {
        v = vec3(1, 1, 0);
    } else if (vertex == 3) {
        v = vec3(0, 1, 0);
    } else if (vertex == 4) {
        v = vec3(0, 0, 1);
    } else if (vertex == 5) {
        v = vec3(1, 0, 1);
    } else if (vertex == 6) {
        v = vec3(1, 1, 1);
    } else if (vertex == 7) {
        v = vec3(0, 1, 1);
    }
    return scale * (cube + v) + shift;
}

float potentialAtVertex(vec3 cube, int vertex) {
    vec3 pos = vertexPosition(cube, vertex);
    return map(pos);
}

void main() {

    float cubeIndex = float(coordToIndex(gl_FragCoord.xy, resolution.xy));
    cubeIndex = floor(cubeIndex / float(VERTEX_COUNT));

    if (cubeIndex >= dims.x * dims.y * dims.z) {
        gl_FragColor = vec4(1);
        return;
    }

    vec3 cube = getCube(cubeIndex, dims);

    float vertIndex = float(coordToIndex(gl_FragCoord.xy, resolution.xy));
    vertIndex = mod(vertIndex, float(VERTEX_COUNT));

    float potential = potentialAtVertex(cube, int(vertIndex));
    gl_FragColor = packFloat(potential);
}
