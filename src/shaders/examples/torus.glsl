
// BOUNDING_BOX_POSITION 0 0 0
// BOUNDING_BOX_SIZE 1.6 0.6 1.6

float fTorus(vec3 p, float smallRadius, float largeRadius) {
    return length(vec2(length(p.xz) - largeRadius, p.y)) - smallRadius;
}

// Your glsl signed distance function:

float mapDistance(vec3 p) {
    return fTorus(p, 0.25, 0.5);
}
