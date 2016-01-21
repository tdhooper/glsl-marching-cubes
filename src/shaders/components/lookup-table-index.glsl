#pragma glslify: map = require(./map)

int getLookupTableIndex(
    vec3 cube,
    vec3 scale,
    vec3 shift
) {
    int index = 0;

    if (map(scale * (cube + vec3(0, 0, 0)) + shift) > 0.) {
        index += 1;
    }
    if (map(scale * (cube + vec3(1, 0, 0)) + shift) > 0.) {
        index += 2;
    }
    if (map(scale * (cube + vec3(1, 1, 0)) + shift) > 0.) {
        index += 4;
    }
    if (map(scale * (cube + vec3(0, 1, 0)) + shift) > 0.) {
        index += 8;
    }
    if (map(scale * (cube + vec3(0, 0, 1)) + shift) > 0.) {
        index += 16;
    }
    if (map(scale * (cube + vec3(1, 0, 1)) + shift) > 0.) {
        index += 32;
    }
    if (map(scale * (cube + vec3(1, 1, 1)) + shift) > 0.) {
        index += 64;
    }
    if (map(scale * (cube + vec3(0, 1, 1)) + shift) > 0.) {
        index += 128;
    }

    return index;
}

#pragma glslify: export(getLookupTableIndex)
