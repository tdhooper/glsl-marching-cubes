#pragma glslify: map = require(./map)
#pragma glslify: lookup = require(./lookup)

vec3 lookupVertexCoord(int i, sampler2D cubeVertsTable, int cubeVertsTable_size) {
    return vec3(
        lookup(cubeVertsTable, i * 3, cubeVertsTable_size),
        lookup(cubeVertsTable, i * 3 + 1, cubeVertsTable_size),
        lookup(cubeVertsTable, i * 3 + 2, cubeVertsTable_size)
    );
}

vec3 vertexPosition(
    vec3 cube,
    int vertex,
    sampler2D cubeVertsTable,
    int cubeVertsTable_size,
    vec3 scale,
    vec3 shift
) {
    vec3 v = lookupVertexCoord(vertex, cubeVertsTable, cubeVertsTable_size);
    return scale * (cube + v) + shift; 
}

float potentialAtVertex(
    vec3 cube,
    int vertex,
    sampler2D cubeVertsTable,
    int cubeVertsTable_size,
    vec3 scale,
    vec3 shift
) {
    vec3 pos = vertexPosition(cube, vertex, cubeVertsTable, cubeVertsTable_size, scale, shift);
    return map(pos);
}

#pragma glslify: export(potentialAtVertex)
