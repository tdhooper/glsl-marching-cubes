
// BOUNDING_BOX_POSITION 0 0 0
// BOUNDING_BOX_SIZE 3 3 3

// Your glsl signed distance function:

float mapDistance(vec3 p) {
  p *= 5.;
  return sin(p.x) + sin(p.y) + sin(p.z);
}
