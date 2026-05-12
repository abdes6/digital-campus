import * as THREE from 'three';

function createTree(x, z, height = 5) {
    const group = new THREE.Group();
    group.name = 'tree';
    group.userData = { type: 'vegetation' };

    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, height * 0.4, 8);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = height * 0.2;
    trunk.castShadow = true;
    trunk.userData = group.userData;
    group.add(trunk);

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

    // 树人街（南侧）行道树
    for (let i = -10; i <= 10; i++) {
        items.push(createTree(i * 11, 128, 5));
        items.push(createTree(i * 11, 150, 5));
    }

    // 校内南北主干道两侧行道树
    for (let z = 50; z <= 120; z += 12) {
        items.push(createTree(-7, z, 6));
        items.push(createTree(7, z, 6));
    }

    // 中心绿轴区域散树
    const greenAxisTrees = [
        [-25, -10, 7], [25, -10, 7],
        [-20, -30, 6], [20, -30, 6],
        [-10, -45, 8], [10, -45, 8],
        [0, -50, 7],
        [-30, -5, 6], [30, -5, 6],
    ];
    for (const [x, z, h] of greenAxisTrees) {
        items.push(createTree(x, z, h));
    }

    // 东西环路北侧行道树
    for (let x = -95; x <= 95; x += 14) {
        items.push(createTree(x, -45, 6));
        items.push(createTree(x, -35, 6));
    }

    // 西侧湖州街行道树
    for (let z = -140; z <= 140; z += 12) {
        items.push(createTree(-108, z, 6));
        items.push(createTree(-122, z, 6));
    }

    // 东侧日积街行道树
    for (let z = -140; z <= 140; z += 12) {
        items.push(createTree(108, z, 6));
        items.push(createTree(122, z, 6));
    }

    // 操场周围灌木
    for (let a = 0; a < Math.PI * 2; a += 0.5) {
        const bx = 62 + Math.cos(a) * 32;
        const bz = -132 + Math.sin(a) * 22;
        items.push(createBush(bx, bz));
    }

    // 宿舍区（西北清乐园）周围灌木
    const dormBushes = [
        [-98, -45], [-98, -60], [-98, -75], [-98, -90], [-98, -105],
        [-80, -115], [-70, -115],
    ];
    for (const [x, z] of dormBushes) {
        items.push(createBush(x, z));
    }

    // 西南宿舍区（致和园）周围灌木
    const zhyBushes = [
        [-98, 30], [-98, 45], [-98, 60], [-98, 75],
        [-78, 78], [-78, 28],
    ];
    for (const [x, z] of zhyBushes) {
        items.push(createBush(x, z));
    }

    // 教学楼前广场两侧灌木
    const teachBushes = [
        [-65, 75], [-65, 95], [-65, 110],
        [65, 75], [65, 95], [65, 110],
    ];
    for (const [x, z] of teachBushes) {
        items.push(createBush(x, z));
    }

    // 北部科研区散树
    const northTrees = [
        [-40, -70, 7], [-40, -100, 6],
        [30, -70, 7], [30, -100, 6],
        [0, -75, 8], [0, -110, 7],
    ];
    for (const [x, z, h] of northTrees) {
        items.push(createTree(x, z, h));
    }

    for (const item of items) {
        scene.add(item);
    }
    return items;
}
