vec3 getCube(float index, vec3 dims) {
    vec3 dims2 = dims - vec3(1);
    vec3 cube = vec3(0);
    cube.z = mod(index, dims2.z);
    cube.y = mod(floor(index / dims2.z), dims2.y);
    cube.x = mod(floor(index / (dims2.y * dims2.z)), dims2.x);
    cube.xyz = cube.zyx;
    return cube;
}

#pragma glslify: export(getCube)