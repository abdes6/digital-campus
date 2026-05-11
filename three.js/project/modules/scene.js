import * as THREE from 'three';

export function initScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 80, 300);

    // 环境光
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    // 主方向光（模拟太阳）
    const sun = new THREE.DirectionalLight(0xfff5e0, 1.2);
    sun.position.set(60, 100, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 400;
    sun.shadow.camera.left = -120;
    sun.shadow.camera.right = 120;
    sun.shadow.camera.top = 120;
    sun.shadow.camera.bottom = -120;
    sun.shadow.bias = -0.001;
    scene.add(sun);

    // 补光
    const fill = new THREE.DirectionalLight(0xc8e8ff, 0.4);
    fill.position.set(-40, 30, -40);
    scene.add(fill);

    // 地面
    const groundGeo = new THREE.PlaneGeometry(400, 400);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x4a7c3f });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = 'ground';
    scene.add(ground);

    return scene;
}
