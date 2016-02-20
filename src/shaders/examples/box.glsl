
// BOUNDING_BOX_POSITION 0 0 0
// BOUNDING_BOX_SIZE 2.5 2.1 2.2

float vmax(vec3 v) {
  return max(max(v.x, v.y), v.z);
}

float fBox(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return length(max(d, vec3(0))) + vmax(min(d, vec3(0)));
}

void pR(inout vec2 p, float a) {
  p = cos(a)*p + sin(a)*vec2(p.y, -p.x);
}

// Your glsl signed distance function:

float mapDistance(vec3 p) {
  pR(p.xy, 0.2);
  pR(p.xz, 0.4);
  return fBox(p, vec3(.8, .8, .8));
}
