"use strict";

var CubeMarch = require("./cubemarch");



var debugMode = false;


var dd = 200;
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

    var geometry = new THREE.Geometry();
    var obj = new THREE.Mesh(geometry, material);
    var wireframe = new THREE.WireframeHelper( obj, '#fff' );
    // scene.add(obj);
    scene.add(wireframe);


    var updateGeometry = function(data) {
        if ( ! data) {
            return;
        }

        var v, f;
        var len = geometry.vertices.length;

        for (var i = 0; i < data.vertices.length; ++i) {
            v = data.vertices[i];
            geometry.vertices.push(new THREE.Vector3().fromArray(v));
        }

        for (var i = 0; i < data.faces.length; ++i) {
            f = data.faces[i];
            geometry.faces.push(
                new THREE.Face3(
                    f[0] + len,
                    f[1] + len,
                    f[2] + len
                )
            );
        }

        geometry.verticesNeedUpdate = true;
        geometry.elementsNeedUpdate = true;

        scene.remove(wireframe);
        wireframe = new THREE.WireframeHelper( obj, '#fff' );
        scene.add(wireframe);

    };

    var done = function() {
        console.timeEnd('march');
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
