import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';  
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import * as TWEEN from '@tweenjs/tween.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

window.TWEEN = TWEEN;
// quick presence check (can be removed later)

//场景初始化
const scene =new THREE.Scene();
scene.background=new THREE.Color(0xf0f0f0); 
const camera=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.set(15,10,20);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);

const ambientLight=new THREE.AmbientLight(0xffffff,0.6);
const dirLight=new THREE.DirectionalLight(0xffffff,0.8);
dirLight.position.set(5,10,7);
scene.add(ambientLight,dirLight);





/*/定义五角星路径
// 1. 定义2D五角星路径
const starShape = new THREE.Shape();
const outerRadius = 2;    // 外半径
const innerRadius = 1;    // 内半径
const points = 5;         // 角数

for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    
    i === 0 ? starShape.moveTo(x, y) : starShape.lineTo(x, y);
}

// 2. 拉伸参数
const extrudeSettings = {
    depth: 0.8,           // 厚度
    bevelEnabled: false,   // 启用倒角
    bevelThickness: 0.2,  // 倒角厚度
    bevelSize: 0.1        // 倒角大小
};

// 3. 创建拉伸几何体
const starGeometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
//法线贴图
/* 

const textureLoader = new THREE.TextureLoader();
const normalMap=textureLoader.load('../three.js-r179/examples/textures/floors/FloorsCheckerboard_S_Normal.jpg');

const starMaterial=new THREE.MeshStandardMaterial({
    color:0xffdd00,
    metalness:0.3,
    roughness:0.5,
    normalMap:normalMap,
    normalScale:new THREE.Vector2(0,0)
});

// 补间动画1：移动到（5，3，2），耗时两秒


const starMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffdd00,      // 金黄色
    metalness: 0.3        // 金属质感
});

const star = new THREE.Mesh(starGeometry, starMaterial);
star.position.set(0, 0, 0);
scene.add(star);


new TWEEN.Tween(star.position, true)
    .to({x:5, y:3, z:2}, 2000)
    .easing(TWEEN.Easing.Bounce.Out) 
    .start();

// 补间动画2：颜色从黄色到红色
new TWEEN.Tween({color:0xffdd00}, true)
    .to({color:0xff3300}, 2000)
    .onUpdate((obj) => { 
        star.material.color.set(obj.color);
    })
    .start();

//动画完成后反向执行
new TWEEN.Tween(star.position, true)
    .to({x:0, y:0, z:0}, 2000)
    .easing(TWEEN.Easing.Bounce.Out)
    .delay(2000)
    .start(); 


function animate(){
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();
    renderer.render(scene,camera);
}
animate();




//金字塔
//1、定义定点数据
const pyramidGeometry =new THREE.BufferGeometry();
const vertices=new Float32Array([
    -3,0,-3, 3,0,-3, 3,0,3, -3,0,3,
    0,20,0
])
//2、定义面
const indices=new Uint32Array([
    //侧面
    0,1,4,
    1,2,4,
    2,3,4,
    3,0,4,
    //底面
    0,3,2,0,2,1
])
//3、设置几何体属性
//顶点位置
pyramidGeometry.setAttribute('position',new THREE.BufferAttribute(vertices,3));
//索引
pyramidGeometry.setIndex(new THREE.BufferAttribute(indices,1));
//计算法线
pyramidGeometry.computeVertexNormals();

//4、材质与网络
const cubeTextureLoader=new THREE.CubeTextureLoader();
const envMap=cubeTextureLoader.load([//环境贴图
    '/three.js-r179/examples/textures/cube/SwedishRoyalCastle/nx.jpg',
    '/three.js-r179/examples/textures/cube/SwedishRoyalCastle/ny.jpg',
    '/three.js-r179/examples/textures/cube/SwedishRoyalCastle/nz.jpg',
    '/three.js-r179/examples/textures/cube/SwedishRoyalCastle/px.jpg',
    '/three.js-r179/examples/textures/cube/SwedishRoyalCastle/py.jpg',
    '/three.js-r179/examples/textures/cube/SwedishRoyalCastle/pz.jpg'
])
const pyramidMaterial=new THREE.MeshStandardMaterial({
    color:0xffffff,
    metalness:0.9,
    roughness:0.1,
    envMap:envMap
});
const pyramid=new THREE.Mesh(pyramidGeometry,pyramidMaterial);
pyramid.position.set(-8,0,0);
scene.background=envMap;
scene.add(pyramid);

function animatePyramid(){
    pyramid.rotation.y+=0.005;
    pyramid.scale.x=1+Math.sin(Date.now()*0.001)*0.2;//水平缩放
    pyramid.scale.z=pyramid.scale.x;//保持比例
    requestAnimationFrame(animatePyramid);
}
animatePyramid();


// 漫游路径：矩形轨迹（x从-15→15→15→-15→-15，z从-15→-15→15→15→-15）
const cameraPath = [
    new THREE.Vector3(-15, 12, -15),
    new THREE.Vector3(15, 12, -15),
    new THREE.Vector3(15, 12, 15),
    new THREE.Vector3(-15, 12, 15),
    new THREE.Vector3(-15, 12, -15)
];

const path = new THREE.CatmullRomCurve3(cameraPath, true); // 闭合曲线
const totalTime = 20000; // 完整漫游时间（20秒）

function animateCameraRoam() {
    const time = (Date.now() % totalTime) / totalTime; // 0~1循环
    const cameraPos = path.getPointAt(time); // 获取路径上的点
    camera.position.copy(cameraPos);
    camera.lookAt(scene.position); // 始终看向场景中心
    requestAnimationFrame(animateCameraRoam);
}

// 启动漫游（可通过按键切换）
let isRoaming = false;
document.addEventListener('keydown', (e) => {
    if (e.key === 'r') isRoaming = !isRoaming;
});

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    if (isRoaming) animateCameraRoam(); // 按R键开启/关闭漫游
    controls.update();
    renderer.render(scene, camera);
}
animate();

function animatePyramid(){
    pyramid.rotation.y+=0.005;
    pyramid.scale.x=1+Math.sin(Date.now()*0.001)*0.2;//水平缩放
    pyramid.scale.z=pyramid.scale.x;//保持比例
    requestAnimationFrame(animatePyramid);
}
animatePyramid();

const radius=5;
const speed=0.001;
function animateVase(){
    const time=Date.now()*speed;
    vase.position.x=8+Math.cos(time)*radius;
    vase.position.z=Math.sin(time)*radius;
    vase.rotation.y+=0.008;
    vase.position.y = 2 + Math.sin(time)*1;
    requestAnimationFrame(animateVase);
}
animateVase();

const cameraPath = [
    new THREE.Vector3(-15, 12, -15),
    new THREE.Vector3(15, 12, -15),
    new THREE.Vector3(15, 12, 15),
    new THREE.Vector3(-15, 12, 15),
    new THREE.Vector3(-15, 12, -15)
];

const path = new THREE.CatmullRomCurve3(cameraPath, true); // 闭合曲线
const totalTime = 20000; // 完整漫游时间（20秒）


// 启动漫游（可通过按键切换）
let isRoaming = false;
document.addEventListener('keydown', (e) => {
    if (e.key === 'r') isRoaming = !isRoaming;
});

let isFollowing = false;
document.addEventListener('keydown', (e) => {
    if (e.key === 'f') isFollowing = !isFollowing;
});


function animateCameraRoam() {
    const time = (Date.now() % totalTime) / totalTime; // 0~1循环
    const cameraPos = path.getPointAt(time); // 获取路径上的点
    camera.position.copy(cameraPos);
    camera.lookAt(scene.position); // 始终看向场景中心
    requestAnimationFrame(animateCameraRoam);
}
// 跟随花瓶运动（相机在花瓶后方一定距离）

function animateCameraFollow() {
    if (!isFollowing) return;
    // 相机位置 = 花瓶位置 - 相机朝向向量 * 距离
    const offset = new THREE.Vector3(0, 3, 8); // 相机相对于花瓶的偏移
    offset.applyQuaternion(vase.quaternion); // 跟随花瓶旋转
    camera.position.copy(vase.position).add(offset);
    camera.lookAt(vase.position); // 看向花瓶
}
animateCameraFollow();
// 在动画循环中调用
function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    animateCameraFollow(); // 相机跟随
    if (isRoaming) animateCameraRoam(); // 如果在漫游
    controls.update();
    renderer.render(scene, camera);
}
animate();

// 第一人称视角控制
let isFirstPerson = false;
const moveSpeed = 0.1; // 移动速度
const rotateSpeed = 0.002; // 旋转速度
let mouseX = 0, mouseY = 0;

// 键盘控制移动
document.addEventListener('keydown', (e) => {
    if (e.key === 'p') isFirstPerson = !isFirstPerson;
    if (!isFirstPerson) return;
    switch (e.key) {
        case 'w': 
            camera.position.addScaledVector(camera.getWorldDirection(new THREE.Vector3()), moveSpeed); 
            break;
        case 's': 
            camera.position.addScaledVector(camera.getWorldDirection(new THREE.Vector3()), -moveSpeed); 
            break;
        case 'a': 
            camera.position.addScaledVector(
                camera.getWorldDirection(new THREE.Vector3())
                    .cross(camera.up)
                    .negate(), 
                moveSpeed
            ); 
            break;
        case 'd': 
            camera.position.addScaledVector(
                camera.getWorldDirection(new THREE.Vector3())
                    .cross(camera.up), 
                moveSpeed
            ); 
            break;
    }
});

// 鼠标控制视角旋转
document.addEventListener('mousemove', (e) => {
    if (!isFirstPerson) return;
    const deltaX = (typeof e.movementX === 'number') ? e.movementX : (e.clientX - mouseX);
    const deltaY = (typeof e.movementY === 'number') ? e.movementY : (e.clientY - mouseY);

    camera.rotation.y -= deltaX * rotateSpeed; // yaw
    camera.rotation.x -= deltaY * rotateSpeed; // pitch
    camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));

    if (typeof e.movementX !== 'number') {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }
});

// 锁定鼠标
document.addEventListener('keydown', (e) => {
    if (e.key === 'f') {
        isFirstPerson = !isFirstPerson;
        if (isFirstPerson) {
            renderer.domElement.requestPointerLock();
        } else {
            document.exitPointerLock();
        }
    }
});

// 花瓶
//  1. 定义旋转曲线（2D顶点数组）
const vasePoints = [];
for (let i = 0; i < 10; i++) {
    const y = i - 5; // y范围：-5~4
    const x = Math.cos(y * 0.5) * 1 + 2; // 曲线形状
    vasePoints.push(new THREE.Vector2(x, y));
}

// 2. 创建旋转几何体
//LatheGeometry：车床几何体，将2D轮廓绕Y轴旋转成型
const vaseGeometry = new THREE.LatheGeometry(vasePoints, 32); // 32段旋转精度

const textureLoader = new THREE.TextureLoader();

// 加载纹理（使用在线示例纹理，或本地图片）
const ceramicTexture = textureLoader.load('/three.js-r179/examples/models/json/lightmap/stone.jpg');

// 纹理参数设置
ceramicTexture.wrapS = THREE.RepeatWrapping; // 水平重复
ceramicTexture.wrapT = THREE.RepeatWrapping; // 垂直重复
ceramicTexture.repeat.set(4,8); // 水平重复2次，垂直重复4次
//ceramicTexture.minFilter = THREE.LinearMipmapLinearFilter; // 缩小过滤（更清晰）

// 替换花瓶材质
const vaseMaterial = new THREE.MeshLambertMaterial({ map: ceramicTexture });
const vase = new THREE.Mesh(vaseGeometry, vaseMaterial);
vase.position.set(8, 0, 0);
scene.add(vase);

const radius=5;
const speed=0.001;
function animateVase(){
    const time=Date.now()*speed;
    vase.position.x=8+Math.cos(time)*radius;
    vase.position.z=Math.sin(time)*radius;
    vase.rotation.y+=0.008;
    vase.position.y = 2 + Math.sin(time)*1;
    requestAnimationFrame(animateVase);
}
animateVase();

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();
    renderer.render(scene, camera);
}
animate();

gltfLoader.load('../three.js-r179/examples/models/gltf/Horse.glb', (gltf) => {
    const Horse = gltf.scene; // 模型场景（包含所有子网格）
    Horse.scale.set(2, 2, 2); // 缩放模型
    Horse.position.set(-10, 0, 0); // 位置
    scene.add(Horse);
    
    // 打印模型结构（查看子网格和材质）
    console.log('模型结构：', Horse);
    
    // 模型旋转动画
    function animateDuck() {
        Horse.rotation.y += 0.005;
        requestAnimationFrame(animateDuck);
    }
    animateDuck(); // 启动动画
}, (xhr) => {
    // 加载进度
    console.log(`加载进度：${(xhr.loaded / xhr.total * 100).toFixed(1)}%`);
}, (error) => {
    // 加载失败
    console.error('模型加载失败：', error);
});
*/
const gltfLoader = new GLTFLoader();

// 加载GLTF模型
// 加载模型（使用Three.js示例模型，或本地GLB文件）
// 加载模型（使用Three.js示例模型，或本地GLB文件）

// 加载自定义纹理
const textureLoader = new THREE.TextureLoader();
const HorseTexture = textureLoader.load('../three.js-r179/examples/textures\colors.png');
const HorseNormalMap = textureLoader.load('three.js-r179\examples\textures\brick_bump.jpg');

gltfLoader.load('../three.js-r179/examples/models/gltf/Horse.glb', (gltf) => {
    const Horse = gltf.scene;
    Horse.scale.set(2, 2, 2);
    Horse.position.set(-10, 0, 0);
    
    // 遍历模型所有子网格，替换材质
    Horse.traverse((child) => {
        if (child.isMesh) { // 只处理网格对象
            child.material = new THREE.MeshStandardMaterial({
                map: HorseTexture,
                normalMap: HorseNormalMap,
                normalScale: new THREE.Vector2(0.5, 0.5),
                metalness: 0.2,
                roughness: 0.6
            });
            child.castShadow = true; // 开启阴影
            child.receiveShadow = true;
        }
    });
    scene.add(Horse);

    const animatedBox = gltf.scene;
    animatedBox.position.set(0, 0, 0);
    scene.add(animatedBox);

    // 获取模型动画剪辑
    const animations = gltf.animations;
    if (animations.length > 0) {
        // 创建动画混合器
        const mixer = new THREE.AnimationMixer(animatedBox);
        // 播放第一个动画
        const action = mixer.clipAction(animations[0]);
        action.loop = THREE.LoopRepeat; // 循环播放
        action.play();

        // 在动画循环中更新混合器
        function animateMixer() {
            mixer.update(0.016); // 每帧更新 (60fps对应0.016秒)
            requestAnimationFrame(animateMixer);
        }
        animateMixer();
    }
});

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();
    renderer.render(scene, camera);
}
animate();

