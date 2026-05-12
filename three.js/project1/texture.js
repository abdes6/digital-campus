import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';  
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import * as TWEEN from '@tweenjs/tween.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// 基础场景（黑色背景+环境贴图）
const scene = new THREE.Scene();

const cubeTextureLoader = new THREE.CubeTextureLoader();

const envMap = cubeTextureLoader.load([
    '/three.js-r179/examples/textures/cube/SwedishRoyalCastle/nx.jpg',
    '/three.js-r179/examples/textures/cube/SwedishRoyalCastle/ny.jpg',
    '/three.js-r179/examples/textures/cube/SwedishRoyalCastle/nz.jpg',
    '/three.js-r179/examples/textures/cube/SwedishRoyalCastle/px.jpg',
    '/three.js-r179/examples/textures/cube/SwedishRoyalCastle/py.jpg',
    '/three.js-r179/examples/textures/cube/SwedishRoyalCastle/pz.jpg'
]);

scene.background = envMap;
scene.environment = envMap; // 环境光反射

// 相机、渲染器、控制器
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(15, 10, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // 开启阴影
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// 光源
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 15, 8);
dirLight.castShadow = true;
scene.add(ambientLight, dirLight);

// 地面（平面几何体+纹理）
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundTexture = new THREE.TextureLoader().load('/three.js-r179/examples/models/json/lightmap/stone.jpg');
groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(10, 10);

const groundMaterial = new THREE.MeshStandardMaterial({ 
    map: groundTexture, 
    roughness: 0.8 
});

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -5;
ground.receiveShadow = true;
scene.add(ground);

// 添加一个示例立方体
const cubeGeometry = new THREE.BoxGeometry(3, 3, 3);
const cubeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4facfe,
    metalness: 0.7,
    roughness: 0.2
});
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 1.5, 0);
cube.castShadow = true;
scene.add(cube);

//用LatheGeometry创建柱子（场景四角）
function createPillar(x, z) {
    const pillarPoints = [];
    for (let i = 0; i < 10; i++) {
        const y = i - 5;
        const x = Math.sin(y * 0.2) * 0.5 + 1;
        pillarPoints.push(new THREE.Vector2(x, y));
    }
    const pillarGeometry = new THREE.LatheGeometry(pillarPoints, 32);
    const pillarMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.1 });
    const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    pillar.position.set(x, 0, z);
    pillar.castShadow = true;
    scene.add(pillar);
}

createPillar(-20, -20);
createPillar(20, -20);
createPillar(-20, 20);
createPillar(20, 20);

const gltfLoader = new GLTFLoader();
gltfLoader.load('/three.js-r179/examples/models/gltf/DragonAttenuation.glb', (gltf) => {
    const product = gltf.scene;
    product.scale.set(3, 3, 3);
    product.position.set(0, -2, 0);
    product.castShadow = true;

    // 替换材质（金属质感）
    product.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
                color: 0xffffff, 
                metalness: 0.9,
                roughness: 0.1,
                envMap: envMap
            });
        }
    });

    // 产品旋转动画
    function animateProduct() {
        product.rotation.y += 0.003;
        requestAnimationFrame(animateProduct);
    }
    animateProduct();
    
    scene.add(product);
});

// 模式切换：默认视角/自动漫游/跟随产品
let mode = 0; // 0:默认 1:漫游 2:跟随
document.addEventListener('keydown', (e) => {
    if (e.key === '1') mode = 0;
    if (e.key === '2') mode = 1;
    if (e.key === '3') mode = 2;
});

//相机漫游路径
const cameraPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(20, 15, 25),
    new THREE.Vector3(-20, 15, 25),
    new THREE.Vector3(-20, 15, -25),
    new THREE.Vector3(20, 15, -25),
], true);
const totalTime = 30000;

//动画循环
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    // 旋转立方体
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    controls.update();
    renderer.render(scene, camera);
    //相机模式逻辑
    const product = scene.getObjectByName('Duck'); // 假设模型名称为Duck
    if (product) {
        switch (mode) {
            case 1: // 漫游
                const time = (Date.now() % totalTime) / totalTime;
                camera.position.copy(cameraPath.getPointAt(time));
                camera.lookAt(0, 0, 0);
                break;
            case 2: // 跟随
                const offset = new THREE.Vector3(0, 5, 10);
                offset.applyQuaternion(product.quaternion);
                camera.position.lerp(product.position.clone().add(offset), 0.05); // 平滑跟随
                camera.lookAt(product.position);
                break;
        }
    }

    renderer.render(scene, camera);
}

animate();

// 提示文本
const info = document.createElement('div');
info.style.position = 'absolute';
info.style.top = '10px';
info.style.color = 'white';
info.innerHTML = '1-默认视角 | 2-自动漫游 | 3-跟随产品 | 鼠标拖动旋转/滚轮缩放';
document.body.appendChild(info);


// 窗口大小调整
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});