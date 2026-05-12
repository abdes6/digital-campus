import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';  
const scene = new THREE.Scene();
//const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const camera = new THREE.OrthographicCamera( -window.innerWidth / 200, window.innerWidth / 200, 
    window.innerHeight / 200, -window.innerHeight / 200, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
// enable shadows with a soft algorithm (minimal change)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

//const geometry = new THREE.BoxGeometry(3,3,3);
const geometry = new THREE.SphereGeometry(1, 32, 32);
//const material = new THREE.MeshBasicMaterial({ color: 0xff0000,transparent:true, opacity:0.5 });
const material = new THREE.MeshLambertMaterial({ color:0xff0000 });

const mesh = new THREE.Mesh(geometry, material);
//mesh.position.x=2;
//mesh.rotation.y=Math.PI/4;
scene.add(mesh);

camera.position.set(5,5,5);
camera.lookAt(0,0,0);


/* 
const DirectionalLight = new THREE.DirectionalLight(0xffffff,0.8);
DirectionalLight.position.set(3,3,0);
scene.add(DirectionalLight);

const spotLight = new THREE.SpotLight(0x00ffff, 1);
spotLight.position.set(0, 5, 0);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 1;
spotLight.distance = 20;
scene.add(spotLight);
spotLight.target = mesh;
*/
// keep ambient low so spotlight contrast is visible




// use white spotlight so it lights the red material effectively
const ambient = new THREE.AmbientLight(0xffffff, 0.08);
scene.add(ambient);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 3, 0);
pointLight.distance=10;
pointLight.decay = 2;
scene.add(pointLight);



renderer.shadowMap.enabled = true;
//spotLight.castShadow = true;
//DirectionalLight.castShadow = true;
pointLight.castShadow = true;
mesh.castShadow = true;
mesh.receiveShadow = true;
const PlaneGeometry=new THREE.PlaneGeometry(10,10);
const PlaneMaterial=new THREE.MeshLambertMaterial({ color:0xffffff });
const plane=new THREE.Mesh(PlaneGeometry,PlaneMaterial);
plane.rotation.x=-Math.PI/2;
plane.position.y=-1;
plane.receiveShadow=true;
scene.add(plane);


// minimal animate loop so shadows render properly
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

//const spotLightHelper = new THREE.SpotLightHelper( spotLight );
//scene.add( spotLightHelper );

//const helper = new THREE.DirectionalLightHelper( DirectionalLight, 5 );
//scene.add( helper );

const helper = new THREE.PointLightHelper( pointLight, 1 );
scene.add( helper );

//const axesHelper = new THREE.AxesHelper( 5 );
//scene.add( axesHelper );
//const helper = new THREE.CameraHelper( camera );
//scene.add( helper );

renderer.setClearColor(0x000000);
renderer.render(scene, camera);


/*
let xSpeed=0.01;
function animate() {
    requestAnimationFrame(animate);
    if(mesh.rotation.x>Math.PI || mesh.rotation.x<-Math.PI) xSpeed=-xSpeed;
        mesh.rotation.x += xSpeed;
        mesh.rotation.y += 0.02;
    //mesh.rotation.z += 0.08;
        renderer.render(scene, camera);
}
animate();

 */



