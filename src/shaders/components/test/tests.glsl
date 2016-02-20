precision mediump float;


// Coord to index

#pragma glslify: coordToIndex = require(../coord-to-index)

bool test_coordtoindex_0_0() {
    return (coordToIndex(vec2(0,0), vec2(2,2)) == 0);
}

bool test_coordtoindex_1_0() {
    return (coordToIndex(vec2(1,0), vec2(2,2)) == 1);
}

bool test_coordtoindex_0_1() {
    return (coordToIndex(vec2(0,1), vec2(2,2)) == 2);
}

bool test_coordtoindex_1_1() {
    return (coordToIndex(vec2(1,1), vec2(2,2)) == 3);
}

bool test_coordtoindex_larger_size() {
    return (coordToIndex(vec2(1,2), vec2(3,3)) == 7);
}

bool test_coordtoindex_with_floats() {
    return (coordToIndex(vec2(1.9,2.9), vec2(3.,3.)) == 7);
}
