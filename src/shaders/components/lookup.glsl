#pragma glslify: unpackUint = require(./unpack-uint)

int lookup(sampler2D table, int index, int size) {
    vec2 uv = vec2(0, float(index) / float(size - 1));
    vec4 tex = texture2D(table, uv) * 255.;
    return unpackUint(tex);
}

#pragma glslify: export(lookup)
