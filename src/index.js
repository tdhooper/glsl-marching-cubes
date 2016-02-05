"use strict";

var CubeMarch = require("./cubemarch");
var STLWriter = require("./stl-writer");



var debugMode = false;


var dd = 100;
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

    var THREE = require('three');
    THREE.TrackballControls = require('three.trackball');

    var width = window.innerWidth;
    var height = window.innerHeight;

    var camera = new THREE.PerspectiveCamera(45, width / height, 0.001, 1000);
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

    var material = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide
    });

    var wireframeMaterial = new THREE.MeshBasicMaterial({
        color: '#fff',
        side: THREE.DoubleSide,
        wireframe: true
    });

    var axisHelper = new THREE.AxisHelper( 1 );
    scene.add( axisHelper );

    var faces = [];

    var updateGeometry = function(data) {

        if ( ! data) {
            return;
        }

        var geometry = new THREE.BufferGeometry();
        var positions = new Float32Array( data.faces.length * 3 * 3 );

        var f, v1, v2, v3, offset;
        for (var i = 0; i < data.faces.length; ++i) {
            f = data.faces[i];
            v1 = data.vertices[ f[0] ];
            v2 = data.vertices[ f[1] ];
            v3 = data.vertices[ f[2] ];
            faces.push([v1, v2, v3]);
            positions[ (i * 9) + 0 ] = v1[0];
            positions[ (i * 9) + 1 ] = v1[1];
            positions[ (i * 9) + 2 ] = v1[2];
            positions[ (i * 9) + 3 ] = v2[0];
            positions[ (i * 9) + 4 ] = v2[1];
            positions[ (i * 9) + 5 ] = v2[2];
            positions[ (i * 9) + 6 ] = v3[0];
            positions[ (i * 9) + 7 ] = v3[1];
            positions[ (i * 9) + 8 ] = v3[2];
        }

        var positionBuffer = new THREE.BufferAttribute( positions, 3 );
        geometry.addAttribute( 'position', positionBuffer );
        var obj = new THREE.Mesh(geometry, wireframeMaterial);
        scene.add(obj);
    };

    var done = function() {
        console.timeEnd('march');
        var stl = new STLWriter();
        stl.save(faces, 'marched.stl');
    };

    console.time('march');
    cubeMarch.march(updateGeometry, done);


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
