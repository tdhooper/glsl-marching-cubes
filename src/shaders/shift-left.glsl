int shiftLeft(int n, int shift) {
    return n *= int(pow(float(2), float(shift)));
}

#pragma glslify: export(shiftLeft)
