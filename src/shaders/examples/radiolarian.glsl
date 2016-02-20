#define PHI (sqrt(5.)*0.5 + 0.5)
#define PI 3.14159265

float fOpIntersectionRound(float a, float b, float r) {
    float m = max(a, b);
    if ((-a < r) && (-b < r)) {
        return max(m, -(r - sqrt((r+a)*(r+a) + (r+b)*(r+b))));
    } else {
        return m;
    }
}


// Cone with correct distances to tip and base circle. Y is up, 0 is in the middle of the base.
float fCone(vec3 p, float radius, float height) {
    vec2 q = vec2(length(p.xz), p.y);
    vec2 tip = q - vec2(0, height);
    vec2 mantleDir = normalize(vec2(height, radius));
    float mantle = dot(tip, mantleDir);
    float d = max(mantle, -q.y);
    float projected = dot(tip, vec2(mantleDir.y, -mantleDir.x));
    
    // distance to tip
    if ((q.y > height) && (projected < 0.)) {
        d = max(d, length(tip));
    }
    
    // distance to base ring
    if ((q.x > radius) && (projected > length(vec2(height, radius)))) {
        d = max(d, length(q - vec2(radius, 0)));
    }
    return d;
}

// Reflect space at a plane
float pReflect(inout vec3 p, vec3 planeNormal, float offset) {
    float t = dot(p, planeNormal)+offset;
    if (t < 0.) {
        p = p - (2.*t)*planeNormal;
    }
    return sign(t);
}

// Rotate around a coordinate axis (i.e. in a plane perpendicular to that axis) by angle <a>.
// Read like this: R(p.xz, a) rotates "x towards z".
// This is fast if <a> is a compile-time constant and slower (but still practical) if not.
void pR(inout vec2 p, float a) {
    p = cos(a)*p + sin(a)*vec2(p.y, -p.x);
}

// The "Round" variant uses a quarter-circle to join the two objects smoothly:
float fOpUnionRound(float a, float b, float r) {
    float m = min(a, b);
    if ((a < r) && (b < r) ) {
        return min(m, r - sqrt((r-a)*(r-a) + (r-b)*(r-b)));
    } else {
     return m;
    }
}

// Repeat around the origin by a fixed angle.
// For easier use, num of repetitions is use to specify the angle.
float pModPolar(inout vec2 p, float repetitions) {
    float angle = 2.*PI/repetitions;
    float a = atan(p.y, p.x) + angle/2.;
    float r = length(p);
    float c = floor(a/angle);
    a = mod(a,angle) - angle/2.;
    p = vec2(cos(a), sin(a))*r;
    // For an odd number of repetitions, fix cell index of the cell in -x direction
    // (cell index would be e.g. -5 and 5 in the two halves of the cell):
    if (abs(c) >= (repetitions/2.)) c = abs(c);
    return c;
}


vec3 pModDodecahedron(inout vec3 p) {
    vec3 v1 = normalize(vec3(0., PHI, 1.));
    vec3 v2 = normalize(vec3(PHI, 1., 0.));

    float sides = 5.;
    float dihedral = acos(dot(v1, v2));
    float halfDdihedral = dihedral / 2.;
    float faceAngle = 2. * PI / sides;
    
    p.z = abs(p.z);
    
    pR(p.xz, -halfDdihedral);
    pR(p.xy, faceAngle / 4.);
    
    p.x = -abs(p.x);
    
    pR(p.zy, halfDdihedral);
    p.y = -abs(p.y);
    pR(p.zy, -halfDdihedral);

    pR(p.xy, faceAngle);
    
    pR(p.zy, halfDdihedral);
    p.y = -abs(p.y);
    pR(p.zy, -halfDdihedral);

    pR(p.xy, faceAngle);
    
    pR(p.zy, halfDdihedral);
    p.y = -abs(p.y);
    pR(p.zy, -halfDdihedral);

    pR(p.xy, faceAngle);
    
    pR(p.zy, halfDdihedral);
    p.y = -abs(p.y);
    pR(p.zy, -halfDdihedral);

    p.z = -p.z;
    pModPolar(p.yx, sides);
    pReflect(p, vec3(-1, 0, 0), 0.);
    
    return p;
}

vec3 pModIcosahedron(inout vec3 p) {

    vec3 v1 = normalize(vec3(1, 1, 1 ));
    vec3 v2 = normalize(vec3(0, 1, PHI+1.));

    float sides = 3.;
    float dihedral = acos(dot(v1, v2));
    float halfDdihedral = dihedral / 2.;
    float faceAngle = 2. * PI / sides;
    

    p.z = abs(p.z);    
    pR(p.yz, halfDdihedral);
    
    p.x = -abs(p.x);
    
    pR(p.zy, halfDdihedral);
    p.y = -abs(p.y);
    pR(p.zy, -halfDdihedral);

    pR(p.xy, faceAngle);
    
    pR(p.zy, halfDdihedral);
    p.y = -abs(p.y);
    pR(p.zy, -halfDdihedral);

    pR(p.xy, faceAngle);
     
    pR(p.zy, halfDdihedral);
    p.y = -abs(p.y);
    pR(p.zy, -halfDdihedral);

    pR(p.xy, faceAngle);
  
    pR(p.zy, halfDdihedral);
    p.y = -abs(p.y);
    pR(p.zy, -halfDdihedral);

    p.z = -p.z;
    pModPolar(p.yx, sides);
    pReflect(p, vec3(-1, 0, 0), 0.);

    return p;
}

float spikeModel(vec3 p) {
    pR(p.zy, PI/2.);
    return fCone(p, 0.25, 3.);
}

float spikesModel(vec3 p) {
    float smooth = 0.6;
    
    pModDodecahedron(p);
    
    vec3 v1 = normalize(vec3(0., PHI, 1.));
    vec3 v2 = normalize(vec3(PHI, 1., 0.));

    float sides = 5.;
    float dihedral = acos(dot(v1, v2));
    float halfDdihedral = dihedral / 2.;
    float faceAngle = 2. * PI / sides;
    
    float spikeA = spikeModel(p);
    
    pR(p.zy, -dihedral);

    float spikeB = spikeModel(p);

    pR(p.xy, -faceAngle);
    pR(p.zy, dihedral);
    
    float spikeC = spikeModel(p);
    
    return fOpUnionRound(
        spikeC,
        fOpUnionRound(
            spikeA,
            spikeB,
            smooth
        ),
        smooth
    );
}

float coreModel(vec3 p) {
    float outer = length(p) - .9;
    float spikes = spikesModel(p);
    outer = fOpUnionRound(outer, spikes, 0.4);
    return outer;
}

float exoSpikeModel(vec3 p) {
    pR(p.zy, PI/2.);
    p.y -= 1.;
    return fCone(p, 0.5, 1.);
}

float exoSpikesModel(vec3 p) {
    pModIcosahedron(p);

    vec3 v1 = normalize(vec3(1, 1, 1 ));
    vec3 v2 = normalize(vec3(0, 1, PHI+1.));

    float dihedral = acos(dot(v1, v2));

    float spikeA = exoSpikeModel(p);
    
    pR(p.zy, -dihedral);

    float spikeB = exoSpikeModel(p);

    return fOpUnionRound(spikeA, spikeB, 0.5);
}

float exoHolesModel(vec3 p) {
    float len = 3.;
    pModDodecahedron(p);
    p.z += 1.5;
    return length(p) - .65;
}

float exoModel(vec3 p) {    
    float thickness = 0.18;
    float outer = length(p) - 1.5;
    float inner = outer + thickness;

    float spikes = exoSpikesModel(p);
    outer = fOpUnionRound(outer, spikes, 0.3);
    
    float shell = max(-inner, outer);

    float holes = exoHolesModel(p);
    shell = fOpIntersectionRound(-holes, shell, thickness/2.);
    
    return shell;
}

float doExo(vec3 p) {
    //return length(p + vec3(0,0,-2)) - 3.;
    //float disp = (sin(length(p) * 5. - t * 8.)) * 0.03;
    return exoModel(p);
}

float doCore(vec3 p) {
    //return length(p + vec3(0,0,2)) - 3.;
    return coreModel(p);
}


// checks to see which intersection is closer
// and makes the y of the vec2 be the proper id
vec2 opU( vec2 d1, vec2 d2 ){
    
    return (d1.x<d2.x) ? d1 : d2;
    
}

float map( vec3 p ){  
    p *= 3.;
    vec2 res = vec2(doExo(p) ,1.); 
    res = opU(res, vec2(doCore(p) ,2.));
    
    return res.x;
}


// BOUNDING_BOX_POSITION 0 0 0
// BOUNDING_BOX_SIZE 1.8 1.8 1.8

// Your glsl signed distance function:

float mapDistance(vec3 p) {
    return map(p);
}
