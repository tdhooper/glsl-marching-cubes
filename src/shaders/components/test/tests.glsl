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

// Index to coord

#pragma glslify: indexToCoord = require(../index-to-coord)

bool test_indextocoord_0_0() {
    return (indexToCoord(0, vec2(2,2)) == vec2(0,0));
}

bool test_indextocoord_1_0() {
    return (indexToCoord(1, vec2(2,2)) == vec2(1,0));
}

bool test_indextocoord_0_1() {
    return (indexToCoord(2, vec2(2,2)) == vec2(0,1));
}

bool test_indextocoord_1_1() {
    return (indexToCoord(3, vec2(2,2)) == vec2(1,1));
}

bool test_indextocoord_larger_size() {
    return (indexToCoord(7, vec2(3,3)) == vec2(1,2));
}

bool test_indextocoord_with_floats() {
    return (indexToCoord(7, vec2(3.,3.)) == vec2(1,2));
}


// Unpack UInt

#pragma glslify: unpackUint = require(../unpack-uint)

bool test_unpack_uint_1() {
    return (unpackUint(vec4(1,0,0,0)) == 1);
}

bool test_unpack_uint_2() {
    return (unpackUint(vec4(2,0,0,0)) == 2);
}

bool test_unpack_uint_256() {
    return (unpackUint(vec4(0,1,0,0)) == 256);
}

bool test_unpack_uint_123456() {
    return (unpackUint(vec4(64,226,1,0)) == 123456);
}


// and

#pragma glslify: and = require(../and)

bool test_and_0_1() {
    return (and(0,1) == 0);
}

bool test_and_1_1() {
    return (and(1,1) == 1);
}

bool test_and_3_8() {
    return (and(3,8) == 0);
}

bool test_and_10_8() {
    return (and(10,8) == 8);
}

bool test_and_21345_28734() {
    return (and(21345,28734) == 20512);
}

bool test_and_out_of_bounds() {
    return (and(51345,38734) != 32768);
}


// Shift Left

#pragma glslify: shiftLeft = require(../shift-left)

bool test_shift_left_1_1() {
    return (shiftLeft(1,1) == 2);
}

bool test_shift_left_1_5() {
    return (shiftLeft(1,5) == 32);
}

bool test_shift_left_123_3() {
    return (shiftLeft(123,3) == 984);
}

bool test_shift_left_1_11() {
    return (shiftLeft(1,11) == 2048);
}
