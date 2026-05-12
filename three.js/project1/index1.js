import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';  
// 初始化Three.js核心组件
const container = document.getElementById( 'scene-container' );//获取容器
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xf0f0f0 );

const camera = new THREE.PerspectiveCamera( 75, container.clientWidth / container.clientHeight, 0.1, 1000 );
camera.position.set( 8, 5, 10 );

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( container.clientWidth, container.clientHeight );
container.appendChild( renderer.domElement );//将渲染器添加到页面中

const controls = new OrbitControls( camera, renderer.domElement );//轨道控制器
controls.enableDamping = true;//开启阻尼效果

const ambientLight = new THREE.AmbientLight( 0xffffff, 0.6 );
const dirLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
dirLight.position.set( 10 ,15, 5 );
scene.add( ambientLight, dirLight );

// 地面
const floorGeometry = new THREE.PlaneGeometry( 50, 50 );
const floorMaterial = new THREE.MeshStandardMaterial( { color: 0xdddddd } );
const floor = new THREE.Mesh( floorGeometry, floorMaterial );
floor.rotation.x = - Math.PI / 2;//将地面旋转为水平面
scene.add( floor );

//墙壁
//左侧墙体
const wallLeftGeometry = new THREE.BoxGeometry( 0.2, 3, 10 );
const wallLeftMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff } );
const wallLeft = new THREE.Mesh( wallLeftGeometry, wallLeftMaterial );
wallLeft.position.set( -7.4, 1.5, 0 );
scene.add( wallLeft );
//右侧墙体
const wallRightGeometry = wallLeft.clone().geometry;
const wallRightMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff } );
const wallRight = new THREE.Mesh( wallRightGeometry, wallLeftMaterial );
wallRight.position.set( 7.4, 1.5, 0 );
scene.add( wallRight);


function animate() {
    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );
}
animate();