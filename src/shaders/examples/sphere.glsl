
// BOUNDING_BOX_POSITION 0 0 0
// BOUNDING_BOX_SIZE 2 2 2

// Your glsl signed distance function:

float mapDistance(vec3 p) {
  return length(p) - .8;
}
