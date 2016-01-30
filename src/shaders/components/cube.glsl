vec3 getCube(float index, vec3 dims) {
    vec3 cube = vec3(0);
    cube.x = mod(index, dims.x);
    cube.y = mod(floor(index / dims.x), dims.y);
    cube.z = mod(floor(index / (dims.y * dims.x)), dims.z);
    return cube;
}

#pragma glslify: export(getCube)