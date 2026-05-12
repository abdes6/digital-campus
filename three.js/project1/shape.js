import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';  
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
//场景，相机，渲染器
const scene =new THREE.Scene();
scene.background=new THREE.Color(0x000000); 
const camerta=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
camerta.position.set(10,10,15);
const renderer=new THREE.WebGLRenderer({antialias:true});//
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);
//轨道控制器
const controls=new OrbitControls(camerta,renderer.domElement);
//光源
const ambientLight=new THREE.AmbientLight(0xffffff,0.5);
const DirectionalLight=new THREE.DirectionalLight(0xffffff,0.8);
DirectionalLight.position.set(5,10,7);
scene.add(ambientLight,DirectionalLight);
//动画循环
function animate(){
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene,camerta);
}
animate();

//创建点
const pointsGemometry=new THREE.BufferGeometry();//空的缓冲体对象
const count=1000;
const positions=new Float32Array(count*3);
for(let i=0;i<count*3;i++){
    //随机分布在[-15,15]之内
    positions[i]=(Math.random()-0.5)*30;
}
pointsGemometry.setAttribute('position',new THREE.BufferAttribute(positions,3));

//点材质
const pointsMaterial=new THREE.PointsMaterial({
    color:0xffffff,
    size:0.05,
    sizeAttenuation:true, //透视效果，远处的点更小
    transparent:true,//启用透明度
    opacity:0.8
})
const stars=new THREE.Points(pointsGemometry,pointsMaterial);
scene.add(stars);

//精灵材质
const spriteMaterial=new THREE.SpriteMaterial({
    color:0xff00ff,
    transparent:true,
    opacity:0.8
})
//创建精灵
const sprite=new THREE.Sprite(spriteMaterial);
sprite.position.set(0,5,0);
sprite.scale.set(2,1,1);
scene.add(sprite);
//精灵纹理
const loader=new THREE.TextureLoader();
loader.load('https://threejs.org/examples/textures/sprites/disc.png',(texture) => {
    spriteMaterial.map=texture;
    spriteMaterial.needsUpdate=true;//更新材质
})

/*/立方体
const cubeGeometry=new THREE.BoxGeometry(2,2,2);
//基础材质(不受光照影响，表现为纯色)
const basicMaterial=new THREE.MeshBasicMaterial({
    color:0x00ff00,
    wireframe:false
});
const cube=new THREE.Mesh(cubeGeometry,basicMaterial);
cube.position.set(-8,1,0);
scene.add(cube);

//球体
const sphereGeometry=new THREE.SphereGeometry(1.5,32,32);
//漫反射材质(受光照影响，哑光效果)
const lambertMaterial=new THREE.MeshLambertMaterial({
    color:0x00ff00,
    side:THREE.DoubleSide
});
const sphere=new THREE.Mesh(sphereGeometry,lambertMaterial);
sphere.position.set(-4,1.5,0);
scene.add(sphere);

//圆柱体
const cylinderGeometry=new THREE.CylinderGeometry(1,1,3,32);
//高光材质(受光照影响，有高光效果)
const phongMaterial=new THREE.MeshPhongMaterial({
    color:0x0000ff,
    shininess:100,//高光强度
    specular:0xffffff
});
const cylinder=new THREE.Mesh(cylinderGeometry,phongMaterial);
cylinder.position.set(0,1.5,0);
scene.add(cylinder);

//平面几何体
const planeGeometry=new THREE.PlaneGeometry(4,4);
//标准材质(基于物理的渲染，表现更真实)
const standardMaterial=new THREE.MeshStandardMaterial({
    color:0xffff00,
    metalness:0.8,
    roughness:0.2
});
const plane=new THREE.Mesh(planeGeometry,standardMaterial);
plane.position.set(5,2,0);
scene.add(plane);

//创建2D路径
const points=5;
const radius=3;
const shape=new THREE.Shape();
for(let i=0;i<points*2;i++){
    const angle=i*Math.PI/points;
    const r=i%2===0?radius:radius/2;
    const x=r*Math.cos(angle);
    const y=r*Math.sin(angle);
    if(i===0){
        shape.moveTo(x,y);
    }
    else shape.lineTo(x,y);
}
//将shape转换为几何体
const shapeGeometry=new THREE.ShapeGeometry(shape);
//定义材质
const shapeMaterial=new THREE.MeshBasicMaterial({
    color:0xff0000,
    wireframe:true,
    side:THREE.DoubleSide
});
//创建网格并添加到场景中去
const shapeMesh=new THREE.Mesh(shapeGeometry,shapeMaterial);
shapeMesh.position.set(4,-4,0);
scene.add(shapeMesh);

//定义拉伸参数
const extrudeSettings={
    depth:0.8,
    bevelEnabled:false,
    bevelThickness:0.2,//倒角厚度
    bevelSize:0.2,//倒角大小
};
//拉伸几何体
const extrudeGeometry=new THREE.ExtrudeGeometry(shape,extrudeSettings);
const extrudeMaterial=new THREE.MeshBasicMaterial({
    color:0xff6600,
});
const star=new THREE.Mesh(extrudeGeometry,extrudeMaterial);
star.position.set(-4,-4,0);
scene.add(star);

//设置几何体的位置
const gui=new GUI();
const extrudeFolder=gui.addFolder('五角星位置');

extrudeFolder.add(star.position, 'x', -5, 5).name('X轴');//gui.add(cube.position, 'x', -5, 5).name('立方体X轴');
extrudeFolder.add(star.position, 'y', -5, 5).name('Y轴');
extrudeFolder.add(star.position, 'z', -5, 5).name('Z轴');

const shapeFolder=gui.addFolder('星形位置');

shapeFolder.add(shapeMesh.position, 'x', -5, 5).name('X轴');//gui.add(cube.position, 'x', -5, 5).name('立方体X轴');
shapeFolder.add(shapeMesh.position, 'y', -5, 5).name('Y轴');
shapeFolder.add(shapeMesh.position, 'z', -5, 5).name('Z轴');

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );
*/