"use strict";

var CubeMarch = require("./cubemarch");
var THREE = require('three');
THREE.TrackballControls = require('three.trackball');

var dd = 4;
var dims = [dd, dd, dd];
var bounds = [
    [-1, -1, -1],
    [1, 1, 1]
];
console.time("march");
var cubeMarch = new CubeMarch();
var points = cubeMarch.march(dims, bounds);
console.timeEnd("march");
// console.log(points)
// points.forEach(function(point) {
//     console.log(point);
// });




var width = window.innerWidth;
var height = window.innerHeight;

var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
var cameraZoom = 250;
//var camera = new THREE.OrthographicCamera(width / - cameraZoom, width / cameraZoom, height / cameraZoom, height / - cameraZoom, 1, 1000 );
camera.position.z = 30;

var controls = new THREE.TrackballControls(camera);

var renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
});
renderer.setSize(width, height);
renderer.domElement.id = 'three';
document.body.appendChild( renderer.domElement );

var scene = new THREE.Scene();

var light = new THREE.PointLight( 0xffffff, 1, 100 );
light.position.set( 20, 30, 40 );
scene.add( light );

var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

var material = new THREE.MeshNormalMaterial({
    side: THREE.DoubleSide
    // ,wireframe: true
});

var wireframeMaterial = new THREE.MeshBasicMaterial({
    color: '#fff',
    side: THREE.DoubleSide,
    wireframe: true
});

var axisHelper = new THREE.AxisHelper( 1 );
scene.add( axisHelper );

var addHelper = function(v, c) {
    // console.log(v);
    var g = new THREE.SphereGeometry(.05);
    var color = new THREE.Color().setHSL(c || 0, 1, 0.5);
    var m = new THREE.MeshBasicMaterial({ color: color })
    var o = new THREE.Mesh(g, m);
    o.position.copy(v);
    scene.add(o);
}

points.forEach(function(point) {
    addHelper(new THREE.Vector3().fromArray(point));
});

var geometry = new THREE.BoxGeometry(1, 1, 1);
var obj = new THREE.Mesh(geometry, material);
obj.position.copy(new THREE.Vector3(.5, .5, .5));
var wireframe = new THREE.WireframeHelper( obj, '#fff' );
// scene.add(obj);
// scene.add(wireframe);


function render() {
    renderer.render(scene, camera);
}

function animate() {
    render();
    controls.update();
    requestAnimationFrame(animate);
}

function onWindowResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

var rel = document.querySelector('link[rel="canonical"]');
var penUrl = rel ? rel.getAttribute('href').split('?')[0] : window.location;

function storeControls() {
    var state = JSON.stringify({
        target: controls.target,
        position: controls.object.position,
        up: controls.object.up
    })
    sessionStorage.setItem(penUrl + 'threecontrols', state);
}

function restoreControls() {
    var state = sessionStorage.getItem(penUrl + 'threecontrols');
    state = JSON.parse(state);
    //state = false;
    if (state) {
        controls.target0.copy(state.target);
        controls.position0.copy(state.position);
        controls.up0.copy(state.up);
        controls.reset();    
    }
}

controls.addEventListener('change', function() {
    render();
    storeControls();
});

window.addEventListener('resize', onWindowResize, false);
restoreControls()
animate();

