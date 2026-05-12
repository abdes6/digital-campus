import * as THREE from 'three';

const ROAD_COLOR    = 0x666677;
const LINE_COLOR    = 0xffffaa;
const PLAZA_COLORS  = {
    main:   0xd4c9b0,  // 主广场（米色）
    campus: 0xc8c0b0,  // 校园通用广场（浅灰米）
    dorm:   0xbcb4a8,  // 宿舍区广场（深灰米）
};

function createRoad(x, z, width, length, rotY = 0, yBase = 0.02) {
    const group = new THREE.Group();
    group.name = 'road';
    group.userData = { type: 'road' };

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

function createPlaza(x, z, w, d, color = PLAZA_COLORS.campus, yBase = 0.01) {
    const group = new THREE.Group();
    group.name = 'plaza';
    group.userData = { type: 'road' };

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
    roads.push(createRoad(0, 140, 14, 220, Math.PI / 2, 0.06));
    // 湖州街：西侧纵向 X=-170，远离西侧行道树（x=-108,-122）
    roads.push(createRoad(-170, 0, 10, 300, 0, 0.02));
    // 日积街：东侧纵向 X=135，远离东侧行道树（x=108,122）
    roads.push(createRoad(135, 0, 10, 300, 0, 0.02));

    // ── 校内南北主干道（X=0，分三段绕开教学楼区 Z=50~130）────────
    // 南段：Z=109~133
    roads.push(createRoad(0, 121, 10, 24, 0, 0.02));
    // 中段：Z=-5~64
    roads.push(createRoad(0, 30, 10, 68, 0, 0.02));
    // 北段：Z=-112~-6
    roads.push(createRoad(0, -59, 10, 106, 0, 0.02));

    // ── 教学区横向道路 ────────────────────────────────────────────
    // 教学楼南侧横路 Z=109，西段 X=-130~-72（教学楼西边界约X=-70）
    roads.push(createRoad(-101, 109, 8, 60, Math.PI / 2, 0.06));
    // 教学楼南侧横路 Z=109，东段 X=72~130
    roads.push(createRoad(101, 109, 8, 60, Math.PI / 2, 0.06));
    // 教学楼北侧横路 Z=64，贯通东西（教学楼北边界约Z=50）
    roads.push(createRoad(0, 64, 8, 220, Math.PI / 2, 0.06));
    // 教学楼西侧纵路 X=-72，Z=64~109
    roads.push(createRoad(-72, 87, 6, 46, 0, 0.02));
    // 教学楼东侧纵路 X=72，Z=64~109
    roads.push(createRoad(72, 87, 6, 46, 0, 0.02));

    // ── 中部核心区横向道路 ────────────────────────────────────────
    // 医学院南侧横路 Z=-5，贯通东西（医学院南边界约Z=10）
    roads.push(createRoad(0, -5, 8, 220, Math.PI / 2, 0.06));
    // 接待中心/20号楼/行政中心2南侧横路 Z=-72，X=-35~130
    roads.push(createRoad(47, -72, 8, 168, Math.PI / 2, 0.06));
    // 接待中心西侧纵路 X=-35，Z=-72~-5（接待中心xMin=-31.8，留3单位）
    roads.push(createRoad(-35, -38, 6, 68, 0, 0.02));

    // ── 北部科研区道路 ────────────────────────────────────────────
    // 16/17/18号楼南侧横路 Z=-28，X=-120~-35（楼南边界Z=-24）
    roads.push(createRoad(-78, -28, 7, 86, Math.PI / 2, 0.06));
    // 13/14/15号楼北侧横路 Z=-100，X=-110~-45（楼北边界Z=-88）
    roads.push(createRoad(-76, -100, 7, 66, Math.PI / 2, 0.06));
    // 科研区西纵路 X=-120，Z=-100~-28
    roads.push(createRoad(-120, -64, 7, 72, 0, 0.02));

    // ── 东侧建筑群道路（2-8号楼）────────────────────────────────
    // 4/5号楼南侧横路 Z=-55，X=82~130（楼南边界Z=-51）
    roads.push(createRoad(107, -55, 7, 50, Math.PI / 2, 0.06));
    // 东侧纵路 X=105，Z=-68~-4（5-8号楼西侧xMin=107.5）
    roads.push(createRoad(105, -36, 6, 64, 0, 0.02));

    // ── 操场区道路 ───────────────────────────────────────────────
    // 操场西侧纵路 X=30，Z=-162~-100（操场xMin=34）
    roads.push(createRoad(30, -131, 6, 62, 0, 0.02));
    // 操场南侧横路 Z=-163，X=28~95（操场zMin=-160）
    roads.push(createRoad(62, -163, 7, 67, Math.PI / 2, 0.06));

    // ── 清乐园宿舍区道路（X=-170~-125，Z=-107~-68）───────────────
    // 清乐园东侧纵路 X=-122，Z=-110~-68
    roads.push(createRoad(-122, -89, 7, 42, 0, 0.02));
    // 清乐园南侧横路 Z=-68，X=-172~-120
    roads.push(createRoad(-148, -68, 6, 54, Math.PI / 2, 0.06));
    // 清乐园北侧横路 Z=-110，X=-172~-120（3-4号楼北边界Z=-107）
    roads.push(createRoad(-148, -110, 6, 54, Math.PI / 2, 0.06));

    // ── 致和园宿舍区道路（X=-100~-80，Z=166~189）─────────────────
    // 致和园东侧纵路 X=-78，Z=163~192（楼xMax=-80）
    roads.push(createRoad(-78, 177, 6, 30, 0, 0.02));
    // 致和园西侧纵路 X=-105，Z=163~192（楼xMin=-100）
    roads.push(createRoad(-105, 177, 6, 30, 0, 0.02));
    // 致和园南侧横路 Z=163，X=-107~-76（楼南边界Z=166.5）
    roads.push(createRoad(-90, 163, 6, 32, Math.PI / 2, 0.06));
    // 致和园北侧横路 Z=192，X=-107~-76（楼北边界Z=188.5）
    roads.push(createRoad(-90, 192, 6, 32, Math.PI / 2, 0.06));

    for (const r of roads) {
        scene.add(r);
    }
    return roads;
}
