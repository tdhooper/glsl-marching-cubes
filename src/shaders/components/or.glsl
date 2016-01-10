const int OR_LENGTH = 15;

int or(int a, int b) {
    int result = 0;
    float bitA;
    float bitB;
    int bit;
    for (int i = 0; i < OR_LENGTH; i++) {
        bitA = mod(float(a), 2.);
        bitB = mod(float(b), 2.);
        a = a / 2;
        b = b / 2;
        bit = int(ceil((bitA + bitB) / 2.));
        result += bit * int(pow(2., float(i)));
    }
    return result;
}

#pragma glslify: export(or)
