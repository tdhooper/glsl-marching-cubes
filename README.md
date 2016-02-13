# WebGL Signed Distance Function Mesher

Extract an STL from a glsl distance function

http://tdhooper.github.io/glsl-marching-cubes/

## Tools used

* [three.js](http://threejs.org/)
* [stack.gl](http://stack.gl/)
* [TWGL](http://twgljs.org/)
* [FileSaver.js](https://github.com/eligrey/FileSaver.js/)
* [Ractive.js](http://www.ractivejs.org/)

## How does it work?

It follows the basic marching cubes algorithm, except distances for each cube vertex are extracted from the shader first<sup>[1](#user-content-fn1)</sup>, to reduce the number of GPU/CPU round trips.

The volume to be marched is subdivided into blocks small enough to fit the maximum texture size. As distances are extracted first, any blocks which are entirely inside (negative) or outside (positive) the surface are skipped, saving some time for models with a lot of empty space.

I tried running the entire marching cubes algorithm on the GPU, but the cost and difficulty of getting data back onto the CPU made it far too slow.

The JavaScript marching cubes implementation is based on<sup>[2](#user-content-fn2)</sup>, which actually runs much faster for simple models. I haven’t compared them with more complex models.

* <a id="fn1">1</a> https://github.com/mikolalysenko/isosurface
* <a id=“fn2”>2</a> https://github.com/mikolalysenko/glsl-read-float
