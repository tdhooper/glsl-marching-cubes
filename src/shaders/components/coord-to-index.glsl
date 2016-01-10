int coordToIndex(vec2 coord, vec2 size) {
    return int(
        floor(coord.x) + (floor(coord.y) * size.x)
    );
}

#pragma glslify: export(coordToIndex)
