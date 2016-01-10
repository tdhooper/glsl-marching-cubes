#pragma glslify: potentialAtVertex = require(./potential-at-vertex)
#pragma glslify: or = require(./or)
#pragma glslify: shiftLeft = require(./shift-left)

const int VERTEX_COUNT = 8;

int getLookupTableIndex(
    vec3 cube,
    sampler2D cubeVertsTable,
    int cubeVertsTable_size,
    vec3 scale,
    vec3 shift
) {
    int index = 0;
    int newIndex;
    float s;
    for (int i = 0; i < VERTEX_COUNT; i++) {
        s = potentialAtVertex(cube, i, cubeVertsTable, cubeVertsTable_size, scale, shift);
        newIndex = 0;
        if (s > 0.) {
            newIndex = shiftLeft(1, i);
        }
        index = or(index, newIndex);
    }
    return index;
}

#pragma glslify: export(getLookupTableIndex)
