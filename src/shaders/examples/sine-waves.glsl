
// BOUNDING_BOX_POSITION 0 0 0
// BOUNDING_BOX_SIZE 10 10 10

// Your glsl signed distance function:

float mapDistance(vec3 p) {
  return sin(p.x) + sin(p.y) + sin(p.z);
}
