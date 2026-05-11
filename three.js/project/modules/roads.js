import * as THREE from 'three';

const ROAD_COLOR = 0x555566;
const LINE_COLOR = 0xffffaa;

function createRoad(x, z, width, length, rotY = 0) {
    const group = new THREE.Group();
    group.name = 'road';
    group.userData = { type: 'road' };

    // 路面
    const roadGeo = new THREE.PlaneGeometry(width, length);
    const roadMat = new THREE.MeshLambertMaterial({ color: ROAD_COLOR });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.02;
    road.receiveShadow = true;
    group.add(road);

    // 中心虚线
    const lineCount = Math.floor(length / 6);
    const lineMat = new THREE.MeshBasicMaterial({ color: LINE_COLOR });
    for (let i = 0; i < lineCount; i++) {
        const lineGeo = new THREE.PlaneGeometry(0.3, 2.5);
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(0, 0.03, -length / 2 + 3 + i * 6);
        group.add(line);
    }

    group.position.set(x, 0, z);
    group.rotation.y = rotY;
    return group;
}

export function createRoads(scene) {
    const roads = [];

    // 主干道（南北向）
    roads.push(createRoad(0, 0, 10, 280));
    // 主干道（东西向）
    roads.push(createRoad(0, 0, 10, 280, Math.PI / 2));
    // 教学楼区支路
    roads.push(createRoad(-80, -20, 6, 80));
    roads.push(createRoad(80, -20, 6, 80));
    // 行政楼前广场路
    roads.push(createRoad(0, 70, 6, 50, Math.PI / 2));
    // 体育馆/宿舍横向连接路
    roads.push(createRoad(0, 20, 6, 240, Math.PI / 2));

    for (const r of roads) {
        scene.add(r);
    }
    return roads;
}
