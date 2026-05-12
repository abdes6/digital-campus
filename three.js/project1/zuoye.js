import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';  
import { EffectComposer } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const container = document.getElementById( 'scene-container' );

//初始化场景
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );

const camera = new THREE.PerspectiveCamera( 75, container.clientWidth / container.clientHeight, 0.1, 1000 );
camera.position.set( 0, 15, 30 );

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( container.clientWidth, container.clientHeight );
container.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;


//光源
//环境光
const ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 );
scene.add( ambientLight);   
//平行光
const dirlight = new THREE.DirectionalLight(0xffffff, 0.8);
dirlight.position.set(0, 20, 20);
dirlight.castShadow=true;
dirlight.target.position.set(0,0,0);
scene.add(dirlight);

//台灯
const spotlights=[];
for(let i=0;i<7;i++){
    spotlights.push(createSpotLight(-3*(i),6.88,9));
    spotlights.push(createSpotLight(3*(i),6.88,9));
    spotlights.push(createSpotLight(-3*(i),6.88,-9));
    spotlights.push(createSpotLight(3*(i),6.88,-9));
}
spotlights.forEach( spotlight => {scene.add( spotlight );} );
//吊灯
for(let i=0;i<7;i++){
    const dirlight=new THREE.DirectionalLight(0xffffff, 0.01);
    dirlight.position.set(-3*(i),19.5,10);
    dirlight.castShadow=true;
    scene.add(dirlight);
    const dirlight2=new THREE.DirectionalLight(0xffffff, 0.01);
    dirlight2.castShadow=true;
    dirlight2.position.set(3*(i),19.5,10);
    scene.add(dirlight2);
    const dirlight3=new THREE.DirectionalLight(0xffffff, 0.01);
    dirlight3.position.set(-3*(i),19.5,-10);
    dirlight3.castShadow=true;
    scene.add(dirlight3);
    const dirlight4=new THREE.DirectionalLight(0xffffff, 0.01);
    dirlight4.position.set(3*(i),19.5,-10);
    dirlight4.castShadow=true;
    scene.add(dirlight4);
}

//坐标轴辅助器
//const axesHelper = new THREE.AxesHelper( 25 );
//scene.add( axesHelper );

// 地面
const floorGeometry = new THREE.PlaneGeometry( 50, 50 );
const floorMaterial = new THREE.MeshStandardMaterial( { color: 0xdddddd } );
const floor = new THREE.Mesh( floorGeometry, floorMaterial );
floor.rotation.x = - Math.PI / 2;
scene.add( floor );

//地面纹理
const textureLoader = new THREE.TextureLoader();
const floorTexture = textureLoader.load( 'textures/floor.jpg' );
floorMaterial.map = floorTexture;
floorMaterial.normalMap = textureLoader.load( 'textures/floor1.jpg' );
floorMaterial.roughness = 0.8;
floorMaterial.metalness = 0.2;
floorMaterial.needsUpdate = true;


//车间墙体
//左侧墙体
const walls = [
      createWall(50, 18, 0.5, 0, 9, -25),
      createWall(0.5, 18, 50, -25, 9, 0),
      createWall(0.5, 18, 50, 25, 9, 0),
      createWall(50.25, 0.5, 50.25, 0, 18.25, 0)
];
walls.forEach(wall => scene.add(wall));

//gui
//const gui = new GUI();


//操作台
//操作台台面
const tableTops1=[
        createTableTop( 40, 0.2, 2, 0, 2, 11 ),
        createTableTop( 40, 0.2, 2, 0, 2, 7 )
];
const tableTops2=[
        createTableTop( 40, 0.2, 2, 0, 2, -11 ),
        createTableTop( 40, 0.2, 2, 0, 2, -7 ) 
]
tableTops1.forEach(tableTop => scene.add(tableTop));
tableTops2.forEach(tableTop => scene.add(tableTop));


//操作台桌面桌腿
const tableLegs1 = [];
const tableLegs2 = [];
for(let i=0;i<14;i++){
    tableLegs1.push(createTableLeg(-19.5 + i*3, 10.5));
    tableLegs1.push(createTableLeg(-19.5 + i*3, 7.5));
}
tableLegs1.forEach(leg => scene.add(leg));
for(let i=0;i<14;i++){
    tableLegs2.push(createTableLeg(-19.5 + i*3, -10.5));
    tableLegs2.push(createTableLeg(-19.5 + i*3, -7.5));
}
tableLegs2.forEach(leg => scene.add(leg));


//操作台底座桌角
const tableCorners1=[
    createTableCorner(-19,1,6.5),
    createTableCorner(-19,1,10.5),
    createTableCorner(19,1,6.5),
    createTableCorner(19,1,10.5),
    createTableCorner(0,1,6.5),
    createTableCorner(0,1,10.5),
];
tableCorners1.forEach(corner => scene.add(corner));
const tableCorners2=[
    createTableCorner(-19,1,-6.5),
    createTableCorner(-19,1,-10.5),
    createTableCorner(19,1,-6.5),
    createTableCorner(19,1,-10.5),
    createTableCorner(0,1,-6.5),
    createTableCorner(0,1,-10.5),
];
tableCorners2.forEach(corner => scene.add(corner));


//操作台桌面
const desk = new THREE.Mesh(
    new THREE.BoxGeometry(40,0.2,2.9),
    new THREE.MeshStandardMaterial({color:0xffffff})
);
desk.position.set(0,4.5,9);
const desk2=desk.clone();
desk2.position.set(0,4.5,-9);
scene.add(desk);
scene.add(desk2);
const deskmat=new THREE.Mesh(
    new THREE.BoxGeometry(40,0.1,2.8),
    new THREE.MeshStandardMaterial({
        color:0xd4bb98,
        map:textureLoader.load('textures/deskmat.jpg'),
        normalMap:textureLoader.load('textures/deskmat1.jpg'),
    })
)
deskmat.position.set(0,4.65,9);
scene.add(deskmat);
const deskmat2=deskmat.clone();
deskmat2.position.set(0,4.65,-9);
scene.add(deskmat2);


//操作台支架(横梁)
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.15,0.15,4),
    new THREE.MeshStandardMaterial({color:0xffffff})
);
for(let i=0;i<14;i++){
    const leg1 = cube.clone();
    leg1.position.set(-19.5 + i*3,7,9);
    const leg2 = cube.clone();
    leg2.position.set(-19.5 + i*3,7,-9);
    scene.add(leg1);
    scene.add(leg2);
}


//灯
const lights=[
    createLight(10.6),
    createLight(-10.6),
    createLight(7.38),
    createLight(-7.38)
];
const light1=lights[0];
lights.forEach( light => {scene.add( light );} );


//白色台面
const whitedesk= new THREE.Mesh(
    new THREE.BoxGeometry(40,0.2,2.9),
    new THREE.MeshBasicMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:2})
);
whitedesk.position.set(0,2.1,10.2);
whitedesk.scale.set(1,0.1,0.1)  ;
const whiteDesk1=whitedesk.clone();
whiteDesk1.position.set(0,2.1,-10.2);
const whiteDesk2=whitedesk.clone();
whiteDesk2.position.set(0,2.1,10.2);
scene.add(whiteDesk1);
scene.add(whiteDesk2);
const whiteDesk3=whitedesk.clone();
whiteDesk3.position.set(0,2.1,7.8);
const whiteDesk4=whitedesk.clone();
whiteDesk4.position.set(0,2.1,-7.8);
scene.add(whiteDesk3);
scene.add(whiteDesk4);


//创建传送带
//传送带路径
const beltShape = new THREE.Shape();
beltShape.moveTo( -20, 0.8 );
beltShape.lineTo( 20, 0.8 );
beltShape.lineTo( 20, 1 );
beltShape.lineTo( -20, 1 );
beltShape.lineTo( -20, 0.8 );
//拉伸参数
const extrudeSettings = {
    depth: 2,
    bevelEnabled: false,
};
//拉伸几何体
//传送带材质
const beltTextures=[];
const beltTexture = textureLoader.load( '2.png' );
const beltTexture1 = textureLoader.load( '2.png' );
beltTextures.push(beltTexture);
beltTextures.push(beltTexture1);
for(let i=0;i<beltTextures.length;i++){
    beltTextures[i].wrapS = beltTextures[i].wrapT = THREE.RepeatWrapping;
    beltTextures[i].repeat.set( 3, 1 );
    beltTextures[i].metalness = 0.8;
    beltTextures[i].roughness = 0.2;
    beltTextures[i].needsUpdate = true;
}
const beltGeometry = new THREE.ExtrudeGeometry( beltShape, extrudeSettings );
const beltMaterial = new THREE.MeshLambertMaterial( { color: 0x295b3f,
    map: beltTexture,
    normalMap: textureLoader.load( 'textures/belt1.jpg' ),
 } );
const belt1 = new THREE.Mesh( beltGeometry, beltMaterial );
const belt2 = new THREE.Mesh( beltGeometry, beltMaterial );
belt1.position.set(0, 1.12, 8);
belt2.position.set(0, 1.12, -10);
scene.add( belt1);
scene.add( belt2);


//指示灯
const spriteMat = new THREE.SpriteMaterial( { color: 0xff0000 } );
const indicatorLight = new THREE.Sprite( spriteMat );
indicatorLight.position.set( 6, 9, -20 );
indicatorLight.scale.set( 3, 3, 3 ); 
scene.add( indicatorLight );
const indicatorLight1 = new THREE.Sprite( spriteMat );
indicatorLight1.position.set( -6, 9, -20 );
indicatorLight1.scale.set( 3, 3, 3 ); 
scene.add( indicatorLight1 );

//gltf模型
//加载器
const gltfLoader = new GLTFLoader();
//创建物料
let materialGeometry=null;
gltfLoader.load( 'models/portable_handheld_fan/scene.gltf', ( gltf ) => {
    materialGeometry = gltf.scene;
    materialGeometry.scale.set( 5, 5, 5 );
    materialGeometry.position.set( 19, 2.38, 9.84 );
    materialGeometry.rotation.x = -Math.PI/2;
    /*const guiFolder1 = gui.addFolder('物料模型位置');
    guiFolder1.add( materialGeometry.position, 'x', -25, 25 ).name('物料X位置');
    guiFolder1.add( materialGeometry.position, 'y', 0, 10 ).name('物料Y位置');
    guiFolder1.add( materialGeometry.position, 'z', -15, 15 ).name('物料Z位置');
    guiFolder1.add(materialGeometry.rotation, 'x', 0, Math.PI * 2 ).name('物料X旋转');
    guiFolder1.add(materialGeometry.rotation, 'y', 0, Math.PI * 2 ).name('物料Y旋转');
    guiFolder1.add(materialGeometry.rotation, 'z', 0, Math.PI * 2 ).name('物料Z旋转');
    scene.add( materialGeometry );
    */
});
//盒子模型
gltfLoader.load( 'models/box/scene.gltf', ( gltf ) => {
    const box = gltf.scene;
    box.scale.set( 3, 3, 3 );
    box.position.set( -20, 1.7, -19 );
    scene.add( box );
} );
gltfLoader.load( 'models/boxes/scene.gltf', ( gltf ) => {
    const boxes = gltf.scene;
    boxes.scale.set( 6, 6, 6 );
    boxes.position.set( 15, 0, 0 );
    boxes.rotation.y = -Math.PI / 2;
    scene.add( boxes );
});
//椅子模型
gltfLoader.load( 'models/chair/scene.gltf', ( gltf ) => {
    const chair = gltf.scene;
    const chair1 = chair.clone();
    const chair2 = chair.clone();
    const chair3 = chair.clone();
    const chair4 = chair.clone();
    const chair5 = chair.clone();
    const chair6 = chair.clone();
    chair6.scale.set( 4, 4, 4 );
    chair6.rotation.y = -Math.PI ;
    chair6.position.set( -10, 0, 14 );
    scene.add( chair6 );
    chair5.position.set( 10, 0, 14 );
    chair5.scale.set( 4, 4, 4 );
    chair5.rotation.y = -Math.PI ;
    scene.add( chair5 );
    chair4.position.set( -10, 0, -15 );
    chair4.scale.set( 4, 4, 4 );
    scene.add( chair4 );
    chair3.scale.set( 4, 4, 4 );
    chair3.position.set( -10, 0, -4 );
    chair3.rotation.y = -Math.PI ;
    scene.add( chair3 );
    chair2.position.set( 10, 0, -15 );
    chair2.scale.set( 4, 4, 4 );
    scene.add( chair2 );
    chair1.scale.set( 4, 4, 4 );
    chair1.position.set( 0, 0, 4 );
    scene.add( chair1 );
    chair.scale.set( 4, 4, 4 );
    chair.position.set( -10, 0, 4 );
    scene.add( chair );
});
//杯子模型
gltfLoader.load( 'models/starbucks_cup/scene.gltf', ( gltf ) => {
    const cup = gltf.scene;
    cup.scale.set( 10, 10, 10 );
    cup.position.set( -8, 4.7, 8.5 );
    const cup1=cup.clone();
    cup1.position.set( 7, 4.7, -8.5 );
    scene.add( cup1 );
    scene.add( cup );
} );
//胶带模型
gltfLoader.load( 'models/brown_tape/scene.gltf', ( gltf ) => {
    const tape = gltf.scene;
    tape.scale.set( 0.2, 0.2, 0.2 );
    tape.position.set( 5, 4.6, 9 );
    scene.add( tape );
    const tape1=tape.clone();
    tape.scale.set( 0.2, 0.2, 0.2 );
    tape1.position.set( -5, 4.6, -9 );
    scene.add( tape1 );
} );
//手机模型
gltfLoader.load( 'models/iphone_x/scene.gltf', ( gltf ) => {
    const phone = gltf.scene;
    phone.scale.set( 0.004, 0.004, 0.004 );
    phone.position.set( -5, 2.16, 6.5 );
    phone.rotation.y = Math.PI;
    phone.rotation.x = Math.PI/2;
    scene.add( phone );
});
//蓝色盒子模型
gltfLoader.load( 'models/bluebox/scene.gltf', ( gltf ) => {
    const blueBox = gltf.scene;
    blueBox.scale.set( 0.5, 0.5, 0.5 );
    blueBox.position.set( -2, 2.1, 6.7 );
    const bluebox1=blueBox.clone();
    bluebox1.scale.set( 0.5, 0.5, 0.5 );
    bluebox1.position.set( 2, 2.1, -6.7 );
    scene.add( bluebox1 );
    const bluebox2=blueBox.clone();
    bluebox2.scale.set( 0.5, 0.5, 0.5 );
    bluebox2.position.set( 5, 2.1, 6.7 );
    scene.add( bluebox2 );
    const bluebox3=blueBox.clone();
    bluebox3.scale.set( 0.5, 0.5, 0.5 );
    bluebox3.position.set( -5, 2.1, -6.7 );
    scene.add( bluebox3 );
    const bluebox4=blueBox.clone();
    bluebox4.scale.set( 0.5, 0.5, 0.5 );
    bluebox4.position.set( 8.2, 2.1, -11.4 );
    scene.add( bluebox4 );
    const bluebox5=blueBox.clone();
    bluebox5.scale.set( 0.5, 0.5, 0.5 );
    bluebox5.position.set( -9, 2.1, 11.1 );
    scene.add( bluebox5 );
    scene.add( blueBox );
    const bluebox6=blueBox.clone();
    bluebox6.scale.set( 0.5, 0.5, 0.5 );
    bluebox6.position.set( -11, 2.1, -11.4 );
    scene.add( bluebox6 );
    const bluebox7=blueBox.clone();
    bluebox7.scale.set( 0.5, 0.5, 0.5 );
    bluebox7.position.set( 12, 2.1, 11.5 );
    scene.add( bluebox7 );
});
//吊灯
gltfLoader.load( 'models/ceiling_lamp-10mb/scene.gltf', ( gltf ) => {
    const ceilingLight = gltf.scene;
    ceilingLight.scale.set( 9, 10, 10 );
    for(let i=0;i<7;i++){
        const light1=ceilingLight.clone();
        light1.position.set(-3*(i),17.5,10);
        scene.add( light1 );
        const light2=ceilingLight.clone();
        light2.position.set(3*(i),17.5,10);
        scene.add( light2 );
        const light3=ceilingLight.clone();
        light3.position.set(-3*(i),17.5,-10);
        scene.add( light3 );
        const light4=ceilingLight.clone();
        light4.position.set(3*(i),17.5,-10);
        scene.add( light4 );
    }
});
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
    const intersects = raycaster.intersectObjects( tableTops1.concat(tableTops2) );
    if ( intersects.length > 0 ) {
        alert('操作台: 数控设备调试台');
    }
} );

//视角复位
document.getElementById('reset-view').addEventListener('click', () => {
    camera.position.set(0, 15, 30);
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
    document.getElementById('animation-status').textContent = isAnimating ? '传送带1已暂停' : '传送带1运行中';
});

let isAnimating1 = true;
document.getElementById('toggle-animation-1')?.addEventListener('click', () => {
    isAnimating1 = !isAnimating1;
    const btn = document.getElementById('toggle-animation-1');
    btn.textContent = isAnimating1 ? '启动动画' : '暂停动画';
    document.getElementById('animation-status1').textContent = isAnimating1 ? '传送带2已暂停' : '传送带2运行中';
});

//生成物料
const materialArray = [];
const materialArray1 = [];

document.getElementById('spawn-material')?.addEventListener('click', () => {
    gltfLoader.load( 'models/portable_handheld_fan/scene.gltf', ( gltf ) => {
    const initMaterial = gltf.scene;
    initMaterial.scale.set( 5, 5, 5 );
    initMaterial.rotation.x = -Math.PI/2;
    initMaterial.position.set( 19, 2.38, 9.84 );
    initMaterial.progress=0;
    materialArray.push(initMaterial);
    scene.add( initMaterial );
});
});
document.getElementById('spawn-material-1')?.addEventListener('click', () => {
    gltfLoader.load( 'models/portable_handheld_fan/scene.gltf', ( gltf ) => {
    const initMaterial = gltf.scene;
    initMaterial.scale.set( 5, 5, 5 );
    initMaterial.rotation.x = -Math.PI/2;
    initMaterial.position.set( 19, 2.38, -8.5 );
    initMaterial.progress=0;
    materialArray1.push(initMaterial);
    scene.add( initMaterial );
});
});

//动画循环
function animate() {
    requestAnimationFrame(animate);
    if(!isAnimating) {
        beltTexture.offset.x += 0.01; //// 传送带纹理滚动（每帧偏移0.01）
    }
    if(!isAnimating1) {
        beltTexture1.offset.x += 0.01; 
    }
    if(!isAnimating) {
        // 物料移动（X轴19→-19）
        materialArray.forEach((mat) => {
            mat.progress += 0.0005;
            if (mat.progress > 1) mat.progress = 0;//重置循环
            const startX = 19;
            const endX = -19;
            const x = startX + mat.progress * (endX - startX);
            mat.position.set(x, 2.38, 9.84); //// 更新位置
        });
    }
    if(!isAnimating1) {
         //物料移动（X轴19→-19）
        materialArray1.forEach((mat) => {
            mat.progress += 0.0005;
            if (mat.progress > 1) mat.progress = 0;//重置循环
            const startX = 19;
            const endX = -19;
            const x = startX + mat.progress * (endX - startX);
            mat.position.set(x, 2.38, -8.5); //// 更新位置
        });
    }
    const time = Date.now() * 0.001;
    indicatorLight.material.color.setHSL(Math.sin(time), 1, 0.5);
    controls.update();
    composer.render();
}
animate();

//创建墙体函数
function createWall(width, height, depth, x,y,z) {
      const textureLoader = new THREE.TextureLoader();
      const wallTexture = textureLoader.load('textures/wall.jpg'); 
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshLambertMaterial({map: wallTexture,
          roughness: 0.7, 
          metalness: 0.5, 
      });
      const wall = new THREE.Mesh(geometry, material);
      wall.position.set(x, y, z);
      wall.castShadow = true;
      return wall;
}
function createTableTop(width, height, depth, x, y, z) {
      const textureLoader = new THREE.TextureLoader();
      const wallTexture = textureLoader.load('textures/belt.jpg'); 
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshStandardMaterial({ 
            color: 0x295b3f,
            map: wallTexture,
            normalMap: textureLoader.load('textures/belt1.jpg'),
       });
      const tableTop = new THREE.Mesh(geometry, material);
      tableTop.position.set(x, y, z);
      tableTop.castShadow = true;
      return tableTop;
}
function createTableLeg(x, z) {
      const geometry = new THREE.BoxGeometry( 0.15, 5, 0.15 );
      const material = new THREE.MeshStandardMaterial( { color: 0xffffff } );
      const tableLeg = new THREE.Mesh( geometry, material );
      tableLeg.position.set( x, 4.44, z);
      tableLeg.castShadow = true;
      return tableLeg;
}
function createTableCorner(x,y,z){
        const geometry = new THREE.CylinderGeometry( 0.3, 0.3, 2, 32 );
        const material = new THREE.MeshStandardMaterial( { color: 0xffffff } );
        const tableCorner = new THREE.Mesh( geometry, material );
        tableCorner.position.set( x, y, z);
        tableCorner.castShadow = true;
        return tableCorner;
}
function createLight(z){
        const light = new THREE.Mesh(
        new THREE.BoxGeometry( 40, 0.1, 0.1 ),
        new THREE.MeshBasicMaterial( { 
        color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2 } ) );
        light.position.set( 0, 6.88, z );
        return light;
}
function createSpotLight(x,y,z){
        const spotLight = new THREE.SpotLight(0xffeedd, 1); 
        spotLight.position.set(x, y, z);
        spotLight.distance = 10; 
        spotLight.angle = Math.PI; 
        spotLight.penumbra = 0.5; 
        spotLight.decay = 0.2; 
        spotLight.castShadow = true;
        return spotLight;
}