const int AND_LENGTH = 15;

int and(int a, int b) {
    int result = 0;
    float bitA;
    float bitB;
    int bit;
    for (int i = 0; i < AND_LENGTH; i++) {
        bitA = mod(float(a), 2.);
        bitB = mod(float(b), 2.);
        a = a / 2;
        b = b / 2;
        bit = int(floor((bitA + bitB) / 2.));
        result += bit * int(pow(2., float(i)));
    }
    return result;
}

#pragma glslify: export(and)
