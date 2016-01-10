int unpackUint(vec4 values) {
    float result = 0.;
    result += values.x * pow(256., 0.);
    result += values.y * pow(256., 1.);
    result += values.z * pow(256., 2.);
    result += values.w * pow(256., 3.);
    return int(result);
}

#pragma glslify: export(unpackUint)
