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

const BUILDING_ZONES = [
    { x: -23, z: -63.5, w: 25, d: 20 },
    { x: -59, z: -67, w: 30, d: 35 },
    { x: -94, z: -80, w: 25, d: 15 },
    { x: -45, z: -20, w: 25, d: 15 },
    { x: -74, z: -3, w: 35, d: 30 },
    { x: -74, z: 20, w: 35, d: 20 },
    { x: -160, z: -87, w: 50, d: 30 },
    { x: -90, z: 177, w: 35, d: 25 },
    { x: 21.5, z: -60, w: 25, d: 25 },
    { x: 46.5, z: -60, w: 30, d: 25 },
    { x: 71.5, z: -47, w: 25, d: 25 },
    { x: 93.5, z: -53, w: 30, d: 25 },
    { x: 116.5, z: -30, w: 30, d: 40 },
    { x: 48, z: -135, w: 30, d: 25 },
    { x: 8, z: -142, w: 30, d: 40 },
    { x: 135, z: -135, w: 30, d: 25 },
    { x: 72, z: -265, w: 50, d: 40 },
    { x: 120, z: -200, w: 60, d: 40 },
    { x: 30.5, z: 90, w: 50, d: 60 },
    { x: -30.5, z: 90, w: 50, d: 60 },
];

const ROAD_ZONES = [
    { x: 0, z: 140, w: 14, d: 220 },
    { x: -170, z: 0, w: 10, d: 300 },
    { x: 140, z: 25, w: 20, d: 280 },
    { x: 0, z: 121, w: 10, d: 24 },
    { x: 0, z: 30, w: 10, d: 160 },
    { x: 0, z: -59, w: 10, d: 106 },
    { x: 20, z: 8, w: 8, d: 220 },
    { x: -33, z: -38, w: 100, d: 6 },
    { x: -78, z: -28, w: 86, d: 7 },
    { x: -14.5, z: -100, w: 300, d: 30 },
    { x: -120, z: -64, w: 72, d: 7 },
    { x: 107, z: -55, w: 50, d: 7 },
    { x: 105, z: -36, w: 64, d: 6 },
    { x: 61.5, z: -110, w: 27, d: 7 },
    { x: 75, z: -155, w: 90, d: 7 },
    { x: 48, z: -185, w: 84, d: 7 },
    { x: 23.5, z: -148, w: 49, d: 7 },
    { x: -122, z: -89, w: 42, d: 7 },
    { x: -148, z: -68, w: 54, d: 6 },
    { x: -148, z: -110, w: 54, d: 6 },
    { x: -78, z: 177, w: 30, d: 6 },
    { x: -105, z: 177, w: 30, d: 6 },
    { x: -90, z: 163, w: 32, d: 6 },
    { x: -90, z: 192, w: 32, d: 6 },
    { x: -45, z: 160, w: 90, d: 7 },
    { x: 0, z: 146, w: 26, d: 7 },
    { x: 56, z: -14, w: 97, d: 7 },
];

const EXCLUDE_ZONES = [
    { x: 0, z: -20, w: 60, d: 40 },
    { x: 75, z: -200, w: 80, d: 70 },
    { x: 120, z: -200, w: 70, d: 50 },
    { x: 0, z: -150, w: 400, d: 100 },
    { x: 72, z: -235, w: 70, d: 30 },
];

function isOnZone(x, z, margin = 2) {
    for (const b of BUILDING_ZONES) {
        if (x >= b.x - b.w / 2 - margin && x <= b.x + b.w / 2 + margin &&
            z >= b.z - b.d / 2 - margin && z <= b.z + b.d / 2 + margin) {
            return true;
        }
    }
    for (const r of ROAD_ZONES) {
        if (x >= r.x - r.w / 2 - margin && x <= r.x + r.w / 2 + margin &&
            z >= r.z - r.d / 2 - margin && z <= r.z + r.d / 2 + margin) {
            return true;
        }
    }
    for (const e of EXCLUDE_ZONES) {
        if (x >= e.x - e.w / 2 && x <= e.x + e.w / 2 &&
            z >= e.z - e.d / 2 && z <= e.z + e.d / 2) {
            return true;
        }
    }
    return false;
}

function placeTreesAlongRect(zone, spacing, offset, trees) {
    const halfW = zone.w / 2;
    const halfD = zone.d / 2;
    const countX = Math.floor(zone.w / spacing);
    const countZ = Math.floor(zone.d / spacing);

    for (let i = 0; i <= countX; i++) {
        const x = zone.x - halfW + i * spacing;
        if (!isOnZone(x, zone.z - halfD - offset)) {
            trees.push(createTree(x, zone.z - halfD - offset, 5));
        }
        if (!isOnZone(x, zone.z + halfD + offset)) {
            trees.push(createTree(x, zone.z + halfD + offset, 5));
        }
    }
    for (let i = 1; i < countZ; i++) {
        const z = zone.z - halfD + i * spacing;
        if (!isOnZone(zone.x - halfW - offset, z)) {
            trees.push(createTree(zone.x - halfW - offset, z, 5));
        }
        if (!isOnZone(zone.x + halfW + offset, z)) {
            trees.push(createTree(zone.x + halfW + offset, z, 5));
        }
    }
}

function placeTreesAlongRoad(zone, spacing, offset, trees) {
    const isHorizontal = zone.d > zone.w;
    const halfW = zone.w / 2;
    const halfD = zone.d / 2;

    if (isHorizontal) {
        const count = Math.floor(zone.d / spacing);
        for (let i = 0; i <= count; i++) {
            const z = zone.z - halfD + i * spacing;
            if (!isOnZone(zone.x - halfW - offset, z)) {
                trees.push(createTree(zone.x - halfW - offset, z, 4));
            }
            if (!isOnZone(zone.x + halfW + offset, z)) {
                trees.push(createTree(zone.x + halfW + offset, z, 4));
            }
        }
    } else {
        const count = Math.floor(zone.w / spacing);
        for (let i = 0; i <= count; i++) {
            const x = zone.x - halfW + i * spacing;
            if (!isOnZone(x, zone.z - halfD - offset)) {
                trees.push(createTree(x, zone.z - halfD - offset, 4));
            }
            if (!isOnZone(x, zone.z + halfD + offset)) {
                trees.push(createTree(x, zone.z + halfD + offset, 4));
            }
        }
    }
}

export function createVegetation(scene) {
    const trees = [];

    for (const b of BUILDING_ZONES) {
        placeTreesAlongRect(b, 8, 6, trees);
    }

    for (const r of ROAD_ZONES) {
        placeTreesAlongRoad(r, 10, 5, trees);
    }

    const campusEdge = [
        { x: -180, z: -160, count: 8 },
        { x: -180, z: 160, count: 8 },
        { x: 180, z: -160, count: 8 },
        { x: 180, z: 160, count: 8 },
    ];
    for (const e of campusEdge) {
        for (let i = 0; i < e.count; i++) {
            const z1 = -160 + i * 40;
            if (!isOnZone(e.x, z1)) {
                trees.push(createTree(e.x, z1, 6));
            }
            const z2 = 160 - i * 40;
            if (!isOnZone(e.x, z2)) {
                trees.push(createTree(e.x, z2, 6));
            }
        }
    }

    for (const t of trees) {
        scene.add(t);
    }

    return trees;
}
