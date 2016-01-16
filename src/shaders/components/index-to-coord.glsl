vec2 indexToCoord(int index, vec2 size) {
    float idx = float(index);
    float x = mod(idx, size.x);
    float y = (idx - x) / size.x;
    return vec2(x, y);
}

#pragma glslify: export(indexToCoord)
