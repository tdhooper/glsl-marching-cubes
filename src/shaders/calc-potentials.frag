precision mediump float;

#pragma glslify: coordToIndex = require(./components/coord-to-index)
#pragma glslify: packFloat = require(glsl-read-float)
#pragma glslify: map = require(./components/map)

uniform vec2 resolution;

uniform vec3 boundsA;
uniform vec3 boundsB;
uniform vec3 dims;

vec3 vertDims = dims + vec3(1);
vec3 scale = (boundsB - boundsA) / dims;
vec3 shift = boundsA;


vec3 vertFromIndex(float index) {
    vec3 vert = vec3(0);
    vert.x = mod(index, vertDims.x);
    vert.y = mod(floor(index / vertDims.x), vertDims.y);
    vert.z = mod(floor(index / (vertDims.y * vertDims.x)), vertDims.z);
    return scale * vert + shift; 
}

void main() {

    float vertIndex = float(coordToIndex(gl_FragCoord.xy, resolution.xy));

    if (vertIndex >= vertDims.x * vertDims.y * vertDims.z) {
        gl_FragColor = vec4(1);
        return;
    }

    vec3 vert = vertFromIndex(vertIndex);
    float potential = map(vert);
    gl_FragColor = packFloat(potential);
}
