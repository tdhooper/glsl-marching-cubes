float map(vec3 p) {
    return length(p) - .5;
}

#pragma glslify: export(map)
