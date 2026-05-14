import * as THREE from 'three';

const ROAD_COLOR    = 0x666677;
const LINE_COLOR    = 0xffffaa;
const PLAZA_COLORS  = {
    main:   0xd4c9b0,  // 主广场（米色）
    campus: 0xc8c0b0,  // 校园通用广场（浅灰米）
    dorm:   0xbcb4a8,  // 宿舍区广场（深灰米）
};

function createRoad(x, z, width, length, rotY = 0, yBase = 0.02, name = '校园道路') {
    const group = new THREE.Group();
    group.name = 'road';
    group.userData = { type: 'road', name };

    const roadGeo = new THREE.PlaneGeometry(width, length);
    const roadMat = new THREE.MeshLambertMaterial({
        color: ROAD_COLOR,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.y = yBase;
    road.receiveShadow = true;
    road.userData = group.userData;
    group.add(road);

    const lineCount = Math.floor(length / 6);
    const lineMat = new THREE.MeshBasicMaterial({ color: LINE_COLOR });
    for (let i = 0; i < lineCount; i++) {
        const lineGeo = new THREE.PlaneGeometry(0.3, 2.5);
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(0, yBase + 0.01, -length / 2 + 3 + i * 6);
        group.add(line);
    }

    group.position.set(x, 0, z);
    group.rotation.y = rotY;
    return group;
}

function createPlaza(x, z, w, d, color = PLAZA_COLORS.campus, yBase = 0.01, name = '广场') {
    const group = new THREE.Group();
    group.name = 'plaza';
    group.userData = { type: 'road', name };

    // 主体铺装
    const geo = new THREE.PlaneGeometry(w, d);
    const mat = new THREE.MeshLambertMaterial({
        color,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = yBase;
    mesh.receiveShadow = true;
    mesh.userData = group.userData;
    group.add(mesh);

    // 边框线（略高于主体）
    const borderMat = new THREE.MeshBasicMaterial({ color: 0x999080 });
    const borders = [
        { bw: w,     bd: 0.5, bx: 0,      bz: -d / 2 },
        { bw: w,     bd: 0.5, bx: 0,      bz:  d / 2 },
        { bw: 0.5,   bd: d,   bx: -w / 2, bz: 0 },
        { bw: 0.5,   bd: d,   bx:  w / 2, bz: 0 },
    ];
    for (const b of borders) {
        const bGeo = new THREE.PlaneGeometry(b.bw, b.bd);
        const bMesh = new THREE.Mesh(bGeo, borderMat);
        bMesh.rotation.x = -Math.PI / 2;
        bMesh.position.set(b.bx, yBase + 0.005, b.bz);
        bMesh.userData = group.userData;
        group.add(bMesh);
    }

    group.position.set(x, 0, z);
    return group;
}

export function createRoads(scene) {
    const roads = [];

    // ── 校园外围边界道路 ──────────────────────────────────────────
    // 树人街：南侧横向主干道 Z=140，避开行道树（树在z=128,150）
    roads.push(createRoad(0, 140, 14, 220, Math.PI / 2, 0.06, '树人街'));
    // 湖州街：西侧纵向 X=-170，远离西侧行道树（x=-108,-122）
    roads.push(createRoad(-170, 0, 10, 300, 0, 0.02, '湖州街'));
    // 日积街：东侧纵向 X=135，远离东侧行道树（x=108,122）
    roads.push(createRoad(140, 25, 20, 280, 0, 0.02, '日积街'));

    // ── 校内南北主干道（X=0，分三段绕开教学楼区 Z=50~130）────────
    // 南段：Z=109~133
    roads.push(createRoad(0, 121, 10, 24, 0, 0.02, '校内南北主干道'));
    // 中段：Z=-5~64
    roads.push(createRoad(0, 30, 10, 160, 0, 0.02, '校内南北主干道'));
    // 北段：Z=-112~-6
    roads.push(createRoad(0, -59, 10, 106, 0, 0.02, '校内南北主干道'));


    // ── 中部核心区横向道路 ────────────────────────────────────────
    roads.push(createRoad(20, 8, 8, 220, Math.PI / 2, 0.06, '核心区横路'));
    roads.push(createRoad(-33, -38, 6, 100, 0, 0.02, '核心区纵路'));

    // ── 北部科研区道路 ────────────────────────────────────────────
    roads.push(createRoad(-78, -28, 7, 86, Math.PI / 2, 0.06, '科研区横路'));
    roads.push(createRoad(-14.5, -100, 30, 300, Math.PI / 2, 0.06, '科研区南横路'));
    roads.push(createRoad(-120, -64, 7, 72, 0, 0.02, '科研区西纵路'));

    // ── 东侧建筑群道路（2-8号楼）────────────────────────────────
    roads.push(createRoad(107, -55, 7, 50, Math.PI / 2, 0.06, '东侧横路'));
    roads.push(createRoad(105, -36, 6, 64, 0, 0.02, '东侧纵路'));

    // ── 校门到体育馆道路 ──────────────────────────────────────────
    // 横向段：从校门(x=48)到体育馆(x=75)，z=-110
    roads.push(createRoad(61.5, -110, 7, 27, Math.PI / 2, 0.04, '校门至体育馆路'));
    // 纵向段：从z=-110到z=-200，x=75
    roads.push(createRoad(75, -155, 7, 90, 0, 0.04, '校门至体育馆路'));

    // ── 9号楼/11号楼 至 致勤西楼 道路 ───────────────────────────
    // 纵向主路：x=48，从9号楼南侧(z=-143)到致勤西楼北侧(z=-227)
    roads.push(createRoad(48, -185, 7, 84, 0, 0.04, '致勤区纵路'));
    // 横向支路：11号楼(x=-1)向东接纵向主路(x=48)，z=-148
    roads.push(createRoad(23.5, -148, 7, 49, Math.PI / 2, 0.04, '11号楼至致勤区横路'));

    // ── 清乐园宿舍区道路（X=-170~-125，Z=-107~-68）───────────────
    roads.push(createRoad(-122, -89, 7, 42, 0, 0.02, '清乐园东纵路'));
    roads.push(createRoad(-148, -68, 6, 54, Math.PI / 2, 0.06, '清乐园南横路'));
    roads.push(createRoad(-148, -110, 6, 54, Math.PI / 2, 0.06, '清乐园北横路'));

    // ── 致和园宿舍区道路（X=-100~-80，Z=166~189）─────────────────
    roads.push(createRoad(-78, 177, 6, 30, 0, 0.02, '致和园东纵路'));
    roads.push(createRoad(-105, 177, 6, 30, 0, 0.02, '致和园西纵路'));
    roads.push(createRoad(-90, 163, 6, 32, Math.PI / 2, 0.06, '致和园南横路'));
    roads.push(createRoad(-90, 192, 6, 32, Math.PI / 2, 0.06, '致和园北横路'));

    // ── 南门广场（树人街北侧，校园主入口）────────────────────────
    roads.push(createPlaza(0, 118, 60, 20, PLAZA_COLORS.main, 0.01, '南门广场'));

    // ── 教学区广场（东西两栋综合教学楼之间）─────────────────────
    roads.push(createPlaza(0, 90, 55, 12, PLAZA_COLORS.campus, 0.01, '教学区广场'));

    // ── 医学院广场（树兰国际医学院南侧入口）─────────────────────
    roads.push(createPlaza(0, -10, 30, 10, PLAZA_COLORS.campus, 0.01, '医学院广场'));

    // ── 致和园连接路 + 主干道北延段 ──────────────────────────────
    // 从致和园南侧(X=-90)向东连接到校内南北主干道(X=0)，Z=160
    roads.push(createRoad(-45, 160, 7, 90, Math.PI / 2, 0.04, '致和园连接路'));
    // 将校内南北主干道从Z=133向北延伸至Z=159，与致和园连接路交汇
    roads.push(createRoad(0, 146, 7, 26, 0, 0.04, '主干道北延段'));

    // ── 东侧连接路 ──────────────────────────────────────────────
    // 从东侧建筑群(8号楼南侧, X=105)向西连接至校内南北主干道(X=0)，Z=-14
    roads.push(createRoad(56, -14, 7, 97, Math.PI / 2, 0.04, '东侧连接路'));

    for (const r of roads) {
        scene.add(r);
    }
    return roads;
}
