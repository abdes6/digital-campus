import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';  
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

//创意一个gui对象
const gui=new GUI();
const gui1=new GUI();

//改变交互界面style属性
gui.domElement.style.width = '250px';
gui1.domElement.style.right = '300px';

/*创建一个对象，对象属性的值可以被GUI库创建的交互界面改变
const obj = {
    x: 30,
};
// gui增加交互界面，用来改变obj对应属性
gui.add(obj, 'x', 0, 100);

//定时打印obj.x的值
setInterval(function () {
    console.log('x', obj.x);
}, 10)

const obj = {
    x: 30,
    y: 60,
    z: 300,
};
// gui界面上增加交互界面，改变obj对应属性
gui.add(obj, 'x', 0, 100);
gui.add(obj, 'y', 0, 50);
gui.add(obj, 'z', 0, 60);

const obj = {
    x: 30,
};
// 当obj的x属性变化的时候，就把此时obj.x的值value赋值给mesh的x坐标
gui.add(obj, 'x', 0, 180).onChange(function(value){
    camera.position.x = value;
	// 你可以写任何你想跟着obj.x同步变化的代码
	// 比如mesh.position.y = value;
});
*/


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
//创建渲染器,开启抗锯齿
camera.position.set(0,10,5);
camera.lookAt(0,0,0);

const renderer = new THREE.WebGLRenderer({
    antialias:true 
});
//大小为窗口尺寸
renderer.setSize(window.innerWidth, window.innerHeight);
// enable shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//将渲染器的画布添加到body中
document.body.appendChild(renderer.domElement);

//添加平面
const plane=new THREE.Mesh(
    new THREE.PlaneGeometry(15, 15),
    new THREE.MeshStandardMaterial({color:0x333333})
);
plane.rotation.x=-Math.PI/2;
plane.position.y=-2;
plane.receiveShadow=true;
scene.add(plane);

/* 
const obj1 = {
    scale: 0,
};
// 参数3数据类型：数组(下拉菜单)
gui.add(obj1, 'scale', [-5, 0, 5]).name('y坐标').onChange(function (value) {
    plane.position.y = value;
});
*/


//立方体
const cube=new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshPhongMaterial({color:0xff3300,
        shininess:80}
    )
);
cube.position.set(-3,0,0);
cube.castShadow=true;
scene.add(cube);

//球体
const sphere=new THREE.Mesh(
    new THREE.SphereGeometry(0.8,32,32),
    new THREE.MeshStandardMaterial({color:0x0099ff,
        roughness:0.3,
        metalness:0.5})
);
sphere.position.set(0,0,0);
sphere.castShadow=true;
scene.add(sphere);

//圆柱体
const cylinder=new THREE.Mesh(
    new THREE.CylinderGeometry(0.5,0.5,1.5),
    new THREE.MeshPhongMaterial({color:0x33cc33,
        transparent:true,
        opacity:0.8
    })
);
cylinder.position.set(3,0,0);
cylinder.castShadow=true;
scene.add(cylinder);

const cubeFolder=gui.addFolder('立方体位置');

cubeFolder.add(cube.position, 'x', -5, 5).name('立方体X轴');//gui.add(cube.position, 'x', -5, 5).name('立方体X轴');
cubeFolder.add(cube.position, 'y', -5, 5).name('立方体Y轴');
cubeFolder.add(cube.position, 'z', -5, 5).name('立方体Z轴');

const sphereFolder=gui.addFolder('球体位置');

sphereFolder.add(sphere.position, 'x', -5, 5).name('球体X轴');
sphereFolder.add(sphere.position, 'y', -5, 5).name('球体Y轴');
sphereFolder.add(sphere.position, 'z', -5, 5).name('球体Z轴');

const cylinderFolder=gui.addFolder('圆柱体位置');

cylinderFolder.add(cylinder.position, 'x', -5, 5).name('圆柱体X轴');
cylinderFolder.add(cylinder.position, 'y', -5, 5).name('圆柱体Y轴');
cylinderFolder.add(cylinder.position, 'z', -5, 5).name('圆柱体Z轴');


//环境光
//const ambient=new THREE.AmbientLight(0xffffff,0.3);
const ambientFolder=gui1.addFolder('环境光属性');
const ambient=new THREE.AmbientLight(0xffffff,0.3);
ambientFolder.add(ambient,'intensity',0,2);
scene.add(ambient);


//聚光灯
const spotlight=new THREE.SpotLight(0xffffdd,0.8);
spotlight.position.set(8,10,5);
spotlight.angle=Math.PI/6;
spotlight.penumbra=0.2;
spotlight.castShadow=true;
spotlight.shadow.mapSize.set(1024,1024);
spotlight.decay=0;
scene.add(spotlight);

//点光源
const pointLight=new THREE.PointLight(0x99ccff,0.5);
pointLight.position.set(0,3,0);
pointLight.distance=10;
scene.add(pointLight);

//平行光
const directionalLighttFolder=gui1.addFolder('平行光属性');
const directionalLight=new THREE.DirectionalLight(0x99ccdd,0.5);
directionalLight.position.set(1,5,1);
directionalLight.castShadow=true;
directionalLighttFolder.add(directionalLight,'intensity',0,2);
scene.add(directionalLight);

gui1.add(ambient, 'intensity', 0, 2.0).name('环境光强度').step(0.1);
gui1.add(directionalLight, 'intensity', 0, 2.0).name('平行光强度').step(0.1);
gui.add(directionalLight.position, 'x', -10,10).name('平行光X轴');
gui.add(directionalLight.position, 'y', -10,10).name('平行光Y轴');
gui.add(directionalLight.position, 'z', -10,10).name('平行光Z轴');
gui1.add(spotlight, 'intensity', 0, 2.0).name('聚光灯强度').step(0.1);
gui1.add(pointLight, 'intensity', 0, 2.0).name('点光源强度').step(0.1);

const obj = {
    color:0x00ffff,
    specular:0x111111,
};
const material = new THREE.MeshStandardMaterial({color:0x00ffff,
    roughness:0.5,
    metalness:0.5
});
const matFolder = gui.addFolder('材质属性');
matFolder.close();

matFolder.addColor(obj, 'color').onChange(function(value){
    plane.material.color.set(value);
});
//材质高光颜色
matFolder.addColor(obj,'specular').onChange(function(value){
    plane.material.specular.set(value);
});

/*
gui.addColor(obj, 'color').onChange(function(value){
    plane.material.color.set(value);
});
//材质高光颜色
gui.addColor(obj,'specular').onChange(function(value){
    plane.material.specular.set(value);
});

// 修改材质颜色的交互界面
gui.addColor(material, 'color').onChange(function(value){      
    material.color.set(value);
});
const sphere2=new THREE.Mesh(
    new THREE.SphereGeometry(0.6,32,32),
    material
);
sphere2.position.set(0,1.5,-4);
sphere2.castShadow=true;
scene.add(sphere2);

// 下拉菜单改变位置
const obj1 = {
    scale: 0,
};
// 参数3数据类型：对象(下拉菜单)
gui.add(obj, 'scale', {
    left: -100,
    center: 0,
    right: 100
    // 左: -100,//可以用中文
    // 中: 0,
    // 右: 100
}).name('位置选择').onChange(function (value) {
    cube.position.x = value;
});

const obj1 = {
    bool: false,
};
// 改变的obj属性数据类型是布尔值，交互界面是单选框
//gui.add(obj1, 'bool').name('是否旋转');
gui.add(obj1, 'bool').onChange(function (value) {
    // 点击单选框，控制台打印obj.bool变化
    console.log('obj1.bool',value);
});
*/
const obj1 = {
    bool: false,
};
gui.add(obj1,'bool').name('旋转动画');
//自动动画
let time=0;
function animate(){
    requestAnimationFrame(animate);
    time+=0.01;
    if(obj1.bool){
    cube.rotation.y+=0.02;
    }
    sphere.position.x=Math.sin(time)*2;
    const scale = 1+Math.sin(time)*0.3;
    cylinder.scale.set(1,scale,1);
    renderer.render(scene,camera);
}
animate();

//添加鼠标交互
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.dampingFactor=0.05;
controls.enalbleZoom=true;
controls.zoomSpeed=0.5;

//窗口自适应
window.addEventListener('resize',()=>{
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
});

;
//const helper = new THREE.CameraHelper( camera );
//scene.add( helper );
//const lightHelper=new THREE.SpotLightHelper(spotlight);
//scene.add(lightHelper);

