import * as THREE from 'three';

function createTree(x, z, height = 5) {
    const group = new THREE.Group();
    group.name = 'tree';
    group.userData = { type: 'vegetation' };

    // 树干
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, height * 0.4, 8);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = height * 0.2;
    trunk.castShadow = true;
    trunk.userData = group.userData;
    group.add(trunk);

    // 树冠（三层锥体）
    const crownMat = new THREE.MeshLambertMaterial({ color: 0x2d7a2d });
    const layers = [
        { r: height * 0.28, h: height * 0.45, y: height * 0.55 },
        { r: height * 0.22, h: height * 0.38, y: height * 0.78 },
        { r: height * 0.14, h: height * 0.30, y: height * 0.96 }
    ];
    for (const l of layers) {
        const geo = new THREE.ConeGeometry(l.r, l.h, 8);
        const mesh = new THREE.Mesh(geo, crownMat);
        mesh.position.y = l.y;
        mesh.castShadow = true;
        mesh.userData = group.userData;
        group.add(mesh);
    }

    group.position.set(x, 0, z);
    return group;
}

function createBush(x, z) {
    const group = new THREE.Group();
    group.name = 'bush';
    group.userData = { type: 'vegetation' };

    const mat = new THREE.MeshLambertMaterial({ color: 0x3a8a3a });
    const positions = [[0, 0], [0.6, 0.3], [-0.5, 0.2], [0.2, -0.4]];
    for (const [dx, dz] of positions) {
        const r = 0.6 + Math.random() * 0.3;
        const geo = new THREE.SphereGeometry(r, 7, 6);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(dx, r * 0.7, dz);
        mesh.castShadow = true;
        mesh.userData = group.userData;
        group.add(mesh);
    }

    group.position.set(x, 0, z);
    return group;
}

export function createVegetation(scene) {
    const items = [];

    // 主干道两侧行道树
    for (let i = -7; i <= 7; i++) {
        items.push(createTree(-6, i * 10, 6));
        items.push(createTree(6, i * 10, 6));
        items.push(createTree(i * 10, -6, 6));
        items.push(createTree(i * 10, 6, 6));
    }

    // 建筑周围灌木
    const bushPositions = [
        [-18, -12], [18, -12], [-18, 32], [18, 32],
        [-42, 5], [-28, 5], [28, 5], [42, 5],
        [-55, -38], [-45, -38], [48, -30], [62, -30],
        [-8, -28], [8, -28]
    ];
    for (const [x, z] of bushPositions) {
        items.push(createBush(x, z));
    }

    // 草坪区域散树
    const lawnTrees = [
        [-60, 20, 7], [60, 20, 8], [-60, -50, 6],
        [60, -50, 7], [0, -60, 8], [0, 60, 7]
    ];
    for (const [x, z, h] of lawnTrees) {
        items.push(createTree(x, z, h));
    }

    for (const item of items) {
        scene.add(item);
    }
    return items;
}
