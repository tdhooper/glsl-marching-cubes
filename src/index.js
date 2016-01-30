"use strict";

var CubeMarch = require("./cubemarch");



var debugMode = false;



var dd = 40;
var dims = [dd, dd, dd];
var s = 1;
var bounds = [
    [-s, -s, -s],
    [s, s, s]
];
console.time("init");
var cubeMarch = new CubeMarch(dims, bounds);
console.timeEnd("init");

if (debugMode) {

    var loop = require('raf-loop');
    var Stats = require('stats.js');
    
    var stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms
    document.body.appendChild(stats.domElement);

    var engine = loop(function(dt) {
        stats.begin();
        cubeMarch.march(true);
        stats.end();
    }).start();

} else {

    console.time("march");
    var result = cubeMarch.march();
    console.timeEnd("march");

    var THREE = require('three');
    THREE.TrackballControls = require('three.trackball');

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

    console.time("geometry");
    var geometry = new THREE.Geometry();
    var v, f;

    for (var i = 0; i < result.positions.length; ++i) {
        v = result.positions[i];
        geometry.vertices.push(new THREE.Vector3().fromArray(v));
    }

    for (var i = 0; i < result.cells.length; ++i) {
        f = result.cells[i];
        geometry.faces.push(new THREE.Face3(f[0], f[1], f[2]));
    }

    // geometry.mergeVertices();
    console.timeEnd("geometry");

    var obj = new THREE.Mesh(geometry, material);
    var wireframe = new THREE.WireframeHelper( obj, '#fff' );
    scene.add(obj);
    scene.add(wireframe);


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
};
