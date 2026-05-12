import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';  
import { EffectComposer } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const container = document.getElementById( 'scene-container' );
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xf0f0f0 );

const camera = new THREE.PerspectiveCamera( 75, container.clientWidth / container.clientHeight, 0.1, 1000 );
camera.position.set( 8, 5, 10 );

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( container.clientWidth, container.clientHeight );
container.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;

const ambientLight = new THREE.AmbientLight( 0xffffff, 0.6 );
const dirLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
dirLight.position.set( 10 ,15, 5 );
scene.add( ambientLight, dirLight );


// 地面
const floorGeometry = new THREE.PlaneGeometry( 50, 50 );
const floorMaterial = new THREE.MeshStandardMaterial( { color: 0xdddddd } );
const floor = new THREE.Mesh( floorGeometry, floorMaterial );
floor.rotation.x = - Math.PI / 2;
scene.add( floor );
//地面纹理
const textureLoader = new THREE.TextureLoader();
const floorTexture = textureLoader.load( 'floor.png' );
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;//重复平铺
floorTexture.repeat.set( 8, 5 );
floorMaterial.map = floorTexture;
floorMaterial.needsUpdate = true;


//车间墙体
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
//墙体材质
const wallTexture = textureLoader.load( 'uv_grid.png' );
wallLeftMaterial.map = wallTexture;
wallLeftMaterial.needsUpdate = true;
wallRightMaterial.map = wallTexture;
wallRightMaterial.needsUpdate = true;

//test
const gui=new GUI();
const cubeFolder=gui.addFolder('立方体位置');

cubeFolder.add(wallLeft.position, 'x', -50, 50).name('立方体X轴');//gui.add(cube.position, 'x', -5, 5).name('立方体X轴');
cubeFolder.add(wallLeft.position, 'y', -50, 50).name('立方体Y轴');
cubeFolder.add(wallLeft.position, 'z', -50, 50).name('立方体Z轴');

//操作台
//操作台台面
const tableTopGeometry = new THREE.BoxGeometry( 4, 0.2, 2 );
const tableTopMaterial = new THREE.MeshLambertMaterial( { color: 0x888888 } );
const tableTop = new THREE.Mesh( tableTopGeometry, tableTopMaterial );
tableTop.position.set( -4, 1, -3);
scene.add( tableTop );
//操作台桌腿
const tableLegGeometry = new THREE.CylinderGeometry( 0.15, 0.15, 1 );
const tableLegMaterial = new THREE.MeshStandardMaterial( { color: 0x555555 } );
for(let i=0;i<4;i++){
    const tableLeg = new THREE.Mesh( tableLegGeometry, tableLegMaterial );
    const x = i%2==0?-5.9:-2.1;
    const z = i<2?-4:-2;
    tableLeg.position.set( x, 0.5, z);
    scene.add( tableLeg );
}

//创建传送带
//传送带路径
const beltShape = new THREE.Shape();
beltShape.moveTo( 1, 0 );
beltShape.lineTo( 6, 0 );
beltShape.lineTo( 6, 0.5 );
beltShape.lineTo( 1, 0.5 );
beltShape.lineTo( 1, 0 );
//拉伸参数
const extrudeSettings = {
    depth: 2,
    bevelEnabled: false,
};
//拉伸几何体
const beltGeometry = new THREE.ExtrudeGeometry( beltShape, extrudeSettings );
const beltMaterial = new THREE.MeshLambertMaterial( { color: 0x444444 } );
const belt = new THREE.Mesh( beltGeometry, beltMaterial );
belt.position.set(0, 0.1, 0);
scene.add( belt );
//传送带材质
const beltTexture = textureLoader.load( 'belt.png' );
beltTexture.wrapS = beltTexture.wrapT = THREE.RepeatWrapping;
beltTexture.repeat.set( 3, 1 );
beltMaterial.map = beltTexture;
beltMaterial.metalness = 0.8;
beltMaterial.roughness = 0.2;
beltMaterial.needsUpdate = true;

//创建物料
const materialGeometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
const materialMaterial = new THREE.MeshStandardMaterial( { color: 0xffdd00 });
//const material = new THREE.Mesh( materialGeometry, materialMaterial );
//material.position.set( 1, 0.6, 1 );
//scene.add( material );
const materialArray = [];


//指示灯
const spriteMat = new THREE.SpriteMaterial( { color: 0xff0000 } );
const indicatorLight = new THREE.Sprite( spriteMat );
indicatorLight.position.set( -4, 3, -3 );
indicatorLight.scale.set( 0.3, 0.3, 1 );
scene.add( indicatorLight );

//窗口适配
window.addEventListener( 'resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( container.clientWidth, container.clientHeight );
} );
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(); 

//点击交互
window.addEventListener( 'click', ( event ) => {
    mouse.x = ( event.clientX / container.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / container.clientHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    const intersects = raycaster.intersectObjects( tableTop );
    if ( intersects.length > 0 ) {
        alert('操作台: 数控设备调试台');
    }
} );

//视角复位
document.getElementById('reset-view').addEventListener('click', () => {
    camera.position.set(8, 5, 10);
    controls.target.set(0, 0, 0);
});

//后期处理
const composer = new EffectComposer( renderer );
const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );
const bloomPass = new UnrealBloomPass( new THREE.Vector2( container.clientWidth, container.clientHeight ),
 0.2,0.4,0.3);
composer.addPass( bloomPass );

//动画控制
let isAnimating = true;
document.getElementById('toggle-animation').addEventListener('click', () => {
    isAnimating = !isAnimating;
    const btn = document.getElementById('toggle-animation');
    btn.textContent = isAnimating ? '启动动画' : '暂停动画';
    document.getElementById('status').textContent = isAnimating ? '运行中' : '已暂停';
});

document.getElementById('spawn-material')?.addEventListener('click', () => {
    const initMaterial=new THREE.Mesh( materialGeometry, materialMaterial );
    initMaterial.position.set( 1, 0.8, 1 );
    initMaterial.progress=0;
    materialArray.push(initMaterial);
    scene.add( initMaterial );
});

//test
const geometry = new THREE.SphereGeometry( 500, 60, 40 );
                // invert the geometry on the x-axis so that all of the faces point inward
geometry.scale( - 1, 1, 1 );

const texture = new THREE.TextureLoader().load( 'textures/2294472375_24a3b8ef46_o.jpg' );
texture.colorSpace = THREE.SRGBColorSpace;
const material = new THREE.MeshBasicMaterial( { map: texture } );

const mesh = new THREE.Mesh( geometry, material );

scene.add( mesh );

let materialProgress=0;
function animate() {
    requestAnimationFrame(animate);
    beltTexture.offset.x += 0.003;
    if(!isAnimating) {
        beltTexture.offset.x += isAnimating ? 0.003 : 0.005;
        materialArray.forEach((mat) => {
            mat.progress += 0.005;
            if (mat.progress > 1) mat.progress = 0;
            const x = 1 + mat.progress * 5; // 1+0=1（起点）→1+5=6（终点）
            mat.position.set(x, 0.8, 1); // y=0.6是传送带表面高度（原0.9飘在上面）  
        });
        const time = Date.now() * 0.001;
        indicatorLight.material.color.setHSL( ( Math.sin( time )  ) , 1, 0.5 );
    }
        controls.update();
        composer.render();
}

animate();
