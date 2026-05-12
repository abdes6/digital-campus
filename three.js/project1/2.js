import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';  
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const scene =new THREE.Scene();
scene.background=new THREE.Color(0x000000); 

const camerta=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,500);
camerta.position.set(20,15,30);

const renderer=new THREE.WebGLRenderer({antialias:true});//
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);
//轨道控制器
const controls=new OrbitControls(camerta,renderer.domElement);

//恒星光源
const starLight=new THREE.DirectionalLight(0xffffff,2);
starLight.position.set(50,30,40);
scene.add(starLight);
//动画循环
function animate(){
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene,camerta);
}
animate();
//创建地球
const textureLoader=new THREE.TextureLoader();
const earthColorMap=textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
const earthNormalMap=textureLoader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg');
const earthGeometrty=new THREE.SphereGeometry(5,64,64);
const earthMaterial=new THREE.MeshStandardMaterial({
    map:earthColorMap,
    normalMap:earthNormalMap,
    metalness:0,
    roughness:0.8
})
const earth=new THREE.Mesh(earthGeometrty,earthMaterial);
scene.add(earth);
function animateEarth(){
    earth.rotation.y+=0.001;
    requestAnimationFrame(animateEarth);
}
animateEarth();

//创建月球
const moonGeometry=new THREE.SphereGeometry(1.5,32,32);
const moonMaterial=new THREE.MeshLambertMaterial({
    color:0xdddddd,
    wireframe:false
})
const moon=new THREE.Mesh(moonGeometry,moonMaterial);
moon.position.set(12,3,0);
scene.add(moon);
function animateMoon(){
    //moon orbit around earth
    moon.position.x=12*Math.cos(Date.now()*0.001);
    moon.position.z=12*Math.sin(Date.now()*0.001);
    requestAnimationFrame(animateMoon);
}
animateMoon();

//创建空间站
const stationShape=new THREE.Shape();
const stationRadius=2;
const sides=6;
for(let i=0;i<=sides;i++){
    const angle=(i*2*Math.PI)/sides;//计算每个点的角度
    const x=stationRadius*Math.cos(angle);
    const y=stationRadius*Math.sin(angle);
    if(i==0) stationShape.moveTo(x,y);
    else stationShape.lineTo(x,y);
}
//拉伸参数
const extrudeSettings={
    depth:0.5,//挤出厚度
    bevelEnabled:true,//是否倒角
    bevelThickness:0.2,//倒角厚度
    bevelSize:0.1//倒角大小
}
//拉伸六边形
const stationGeometry=new THREE.ExtrudeGeometry(stationShape,extrudeSettings);
const stationMaterial=new THREE.MeshPhongMaterial({
    color:0x888ff,
    shininess:100,//高光强度

})
const station=new THREE.Mesh(stationGeometry,stationMaterial);
station.position.set(20,5,0);
scene.add(station);

//对接舱
const dockGeometry=new THREE.CylinderGeometry(0.8,0.8,2,16);
const dock=new THREE.Mesh(dockGeometry,stationMaterial);
dock.position.set(23,5,0);
scene.add(dock);

//太阳能板
const panelGeometry=new THREE.PlaneGeometry(4,2);
const panelMaterial=new THREE.MeshBasicMaterial({color:0xffff00});
const panelLeft=new THREE.Mesh(panelGeometry,panelMaterial);
panelLeft.position.set(20,5,-3);
panelLeft.rotation.y=Math.PI/2;
scene.add(panelLeft);

const panelright=panelLeft.clone();
panelright.position.set(20,5,3);
scene.add(panelright);

//创建星空背景
const starsGeometry=new THREE.BufferGeometry();
const starCount=10000;
const positions=new Float32Array(starCount*3);
for(let i=0;i<starCount*3;i++){
    positions[i]=(Math.random()-0.5)*400;//随机分布在[-200,200]的立方体空间内
}
starsGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));

//点材质
const starsMaterial=new THREE.PointsMaterial({
    size:0.1,
    sizeAttenuation:true,
    transparent:true,
    opacity:0.8
})

//随机颜色
const colors=new Float32Array(starCount*3);
for(let i=0;i<starCount*3;i++){
    const brightness=Math.random();//0-1亮度 RGB
    colors[i]=brightness;
}
starsGeometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
starsMaterial.vertexColors=true;//启用顶点颜色而不是材质颜色
const stars=new THREE.Points(starsGeometry,starsMaterial);
scene.add(stars);

//飞船图标
const spriteLoader=new THREE.TextureLoader();
spriteLoader.load('./rocket.png', (texture) => {
    const shipSpriteMaterial = new THREE.SpriteMaterial({
        map: texture,        // 使用加载好的纹理
        transparent: true,
        opacity: 0.9
    });

//飞船标签
const shipSprite=new THREE.Sprite(shipSpriteMaterial);
shipSprite.position.set(-15,8,-10);
shipSprite.scale.set(3,3,1);
scene.add(shipSprite);

function animateSprite(){
    shipSprite.position.y=8+Math.sin(Date.now()*0.001)*2;
    requestAnimationFrame(animateSprite);
}
animateSprite();
});