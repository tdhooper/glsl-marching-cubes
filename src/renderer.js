"use strict";

var THREE = require('three');
THREE.TrackballControls = require('three.trackball');

var Renderer = function(el) {

    var width = el.offsetWidth;
    var height = el.offsetHeight;

    var camera = new THREE.PerspectiveCamera(45, width / height, 0.001, 1000);
    camera.position.z = 5;

    var renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setSize(width, height);
    el.appendChild( renderer.domElement );

    var controls = new THREE.TrackballControls(camera, renderer.domElement);

    var scene = new THREE.Scene();

    scene.add(camera);

    var axisHelper = new THREE.AxisHelper( 1 );
    scene.add( axisHelper );

    var light = new THREE.PointLight( 0xffffff, 1, 100 );
    light.position.set( 20, 30, 40 );
    camera.add( light );

    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    camera.add( light );

    this.materialColor = 0xaaaaaa;
    this.wireframeColor = 0xffffff;
    this.material = new THREE.MeshLambertMaterial({
        color: this.materialColor,
        side: THREE.DoubleSide
    });

    var boundsMaterial = new THREE.MeshBasicMaterial({
        color: '#ff0',
        wireframe: true
    });

    var boundsGeometry = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);
    var bounds = new THREE.Mesh(boundsGeometry, boundsMaterial);
    scene.add(bounds);

    function render() {
        renderer.render(scene, camera);
    }

    function animate() {
        render();
        controls.update();
        requestAnimationFrame(animate);
    }

    function onWindowResize() {
        width = el.offsetWidth;
        height = el.offsetHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    controls.addEventListener('change', function() {
        render();
    });

    window.addEventListener('resize', onWindowResize, false);
    animate();

    this.sections = [];
    this.scene = scene;
    this.bounds = bounds;
};

Renderer.prototype = {

    startModel: function() {
        this.sections.forEach(function(section) {
            this.scene.remove(section);
        }, this);
    },

    addSection: function(vertices, faces) {
        var geometry = new THREE.BufferGeometry();
        var positions = new Float32Array( faces.length * 3 * 3 );
        var faceNormal = {};
        var normals = new Float32Array( faces.length * 3 * 3 );
        var f, v1, v2, v3;

        for (var i = 0; i < faces.length; ++i) {
            f = faces[i];
            v1 = vertices[ f[0] ];
            v2 = vertices[ f[1] ];
            v3 = vertices[ f[2] ];

            faceNormal.x = (v2[1] - v1[1]) * (v3[2] - v1[2]) - (v2[2] - v1[2]) * (v3[1] - v1[1]);
            faceNormal.y = (v2[2] - v1[2]) * (v3[0] - v1[0]) - (v2[0] - v1[0]) * (v3[2] - v1[2]);
            faceNormal.z = (v2[0] - v1[0]) * (v3[1] - v1[1]) - (v2[1] - v1[1]) * (v3[0] - v1[0]);

            normals[ (i * 9) + 0 ] = faceNormal.x;
            normals[ (i * 9) + 1 ] = faceNormal.y;
            normals[ (i * 9) + 2 ] = faceNormal.z;
            normals[ (i * 9) + 3 ] = faceNormal.x;
            normals[ (i * 9) + 4 ] = faceNormal.y;
            normals[ (i * 9) + 5 ] = faceNormal.z;
            normals[ (i * 9) + 6 ] = faceNormal.x;
            normals[ (i * 9) + 7 ] = faceNormal.y;
            normals[ (i * 9) + 8 ] = faceNormal.z;

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
        var normalBuffer = new THREE.BufferAttribute( normals, 3 );
        geometry.addAttribute( 'position', positionBuffer );
        geometry.addAttribute( 'normal', normalBuffer );
        var obj = new THREE.Mesh(geometry, this.material);
        this.sections.push(obj);
        this.scene.add(obj);
    },

    setBoundingBox: function(x, y, z, width, height, depth) {
        this.bounds.position.set(x, y, z);
        this.bounds.scale.set(width, height, depth);
    },

    toggleBoundingBox: function(visible) {
        this.bounds.visible = visible;
    },

    toggleWireframe: function(visible) {
        this.material.wireframe = visible;
        this.material.color.setHex(visible ? this.wireframeColor : this.materialColor);
        this.material.emissive.setHex(visible ? this.wireframeColor : 0x000000);
        this.material.needsUpdate = true;
    }
};

module.exports = Renderer;
