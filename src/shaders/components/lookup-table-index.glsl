#pragma glslify: map = require(./map)

int getLookupTableIndex(
    vec3 cube,
    vec3 scale,
    vec3 shift
) {
    int index = 0;

    // vec3 offset = vec3(0);
    // float c;
    // for (float i = 0.; i < 8.; i++) {
    //     offset.x = mod(floor((i + 1.) / 2.), 2.);
    //     offset.y = mod(floor(i / 2.), 2.);
    //     offset.z = mod(floor(i / 4.), 2.);
    //     c = map(scale * (cube + offset) + shift);
    //     // if (c > 0.) {
    //     //     index += int( pow(2., i) );
    //     // }
    //     index += int(
    //         pow(2., i) * clamp(ceil(c), 0., 1.)
    //     );
    // }

    // index += 1 * int(clamp(ceil( map(scale * (cube + vec3(0, 0, 0)) + shift) ), 0., 1.));
    // index += 2 * int(clamp(ceil( map(scale * (cube + vec3(1, 0, 0)) + shift) ), 0., 1.));
    // index += 4 * int(clamp(ceil( map(scale * (cube + vec3(1, 1, 0)) + shift) ), 0., 1.));
    // index += 8 * int(clamp(ceil( map(scale * (cube + vec3(0, 1, 0)) + shift) ), 0., 1.));
    // index += 16 * int(clamp(ceil( map(scale * (cube + vec3(0, 0, 1)) + shift) ), 0., 1.));
    // index += 32 * int(clamp(ceil( map(scale * (cube + vec3(1, 0, 1)) + shift) ), 0., 1.));
    // index += 64 * int(clamp(ceil( map(scale * (cube + vec3(1, 1, 1)) + shift) ), 0., 1.));
    // index += 128 * int(clamp(ceil( map(scale * (cube + vec3(0, 1, 1)) + shift) ), 0., 1.));

    if (map(scale * (cube + vec3(0, 0, 0)) + shift) > 0.) {
        index += 1;
    }
    if (map(scale * (cube + vec3(1, 0, 0)) + shift) > 0.) {
        index += 2;
    }
    if (map(scale * (cube + vec3(1, 1, 0)) + shift) > 0.) {
        index += 4;
    }
    if (map(scale * (cube + vec3(0, 1, 0)) + shift) > 0.) {
        index += 8;
    }
    if (map(scale * (cube + vec3(0, 0, 1)) + shift) > 0.) {
        index += 16;
    }
    if (map(scale * (cube + vec3(1, 0, 1)) + shift) > 0.) {
        index += 32;
    }
    if (map(scale * (cube + vec3(1, 1, 1)) + shift) > 0.) {
        index += 64;
    }
    if (map(scale * (cube + vec3(0, 1, 1)) + shift) > 0.) {
        index += 128;
    }

    return index;
}

#pragma glslify: export(getLookupTableIndex)
