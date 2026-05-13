import * as THREE from 'three';
import { loadModel } from './loader.js';

// 坐标系：Z+ = 南，Z- = 北，X+ = 东，X- = 西

const BUILDING_DATA = [];

function createBuilding(data) {
    const group = new THREE.Group();
    group.name = data.id;
    group.userData = { type: 'building', name: data.name, info: data.info };

    const [w, h, d] = data.size;

    const bodyGeo = new THREE.BoxGeometry(w, h, d);
    const bodyMat = new THREE.MeshLambertMaterial({ color: data.color });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    body.userData = group.userData;
    group.add(body);

    const roofGeo = new THREE.BoxGeometry(w + 0.5, 1.5, d + 0.5);
    const roofMat = new THREE.MeshLambertMaterial({ color: data.roofColor });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = h + 0.75;
    roof.castShadow = true;
    roof.userData = group.userData;
    group.add(roof);

    addWindows(group, w, h, d);
    group.position.set(...data.position);
    return group;
}

function addWindows(group, w, h, d) {
    const winMat = new THREE.MeshLambertMaterial({ color: 0x88bbdd, transparent: true, opacity: 0.7 });
    const floors = Math.max(2, Math.floor(h / 4));
    const cols = Math.max(2, Math.floor(w / 5));
    const ud = group.userData;

    const colSpacing = w / cols;
    const floorSpacing = h / floors;
    const winW = Math.min(1.8, colSpacing * 0.55);
    const winH = Math.min(1.4, floorSpacing * 0.5);

    for (let f = 0; f < floors; f++) {
        for (let c = 0; c < cols; c++) {
            const winGeo = new THREE.PlaneGeometry(winW, winH);
            const win = new THREE.Mesh(winGeo, winMat);
            const x = -w / 2 + (c + 0.5) * colSpacing;
            const y = floorSpacing * 0.5 + f * floorSpacing;
            win.position.set(x, y, d / 2 + 0.01);
            win.userData = ud;
            group.add(win);
        }
    }
}

function createTrack(scene) {
    const group = new THREE.Group();
    group.name = 'track';
    group.userData = { type: 'building', name: '操场', info: { 类型: '标准400m跑道', 建成年份: '2010年', 简介: '标准田径运动场，配备人工草坪足球场。' } };

    const trackGeo = new THREE.RingGeometry(20, 28, 48);
    const trackMat = new THREE.MeshLambertMaterial({ color: 0xcc4422, side: THREE.DoubleSide });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.rotation.x = -Math.PI / 2;
    track.position.y = 0.05;
    track.userData = group.userData;
    group.add(track);

    const pts = [];
    for (let i = 0; i <= 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        pts.push(new THREE.Vector2(Math.cos(a) * 19, Math.sin(a) * 14));
    }
    const shape = new THREE.Shape(pts);
    const lawnPlane = new THREE.ShapeGeometry(shape);
    const lawnMat = new THREE.MeshLambertMaterial({ color: 0x3a8a3a });
    const lawn = new THREE.Mesh(lawnPlane, lawnMat);
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.y = 0.04;
    lawn.userData = group.userData;
    group.add(lawn);

    group.position.set(120, 0, -200);
    scene.add(group);
    return group;
}

async function createMedicalCollege(scene) {
    const INFO = {
        建筑面积: '15000 m²',
        楼层: '5层',
        建成年份: '2018年',
        简介: '树兰国际医学院，承担医学教育与临床科研。'
    };
    try {
        const gltf = await loadModel('./assets/models/library.glb');
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        model.scale.setScalar(60 / maxDim);
        box.setFromObject(model);
        model.position.set(0, -box.min.y, -20);
        model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.userData = { type: 'building', name: '树兰国际医学院', info: INFO };
            }
        });
        model.userData = { type: 'building', name: '树兰国际医学院', info: INFO };
        model.name = 'medical';
        scene.add(model);
        return model;
    } catch (e) {
        console.warn('medical glb 加载失败，使用几何体替代', e);
        const data = {
            id: 'medical', name: '树兰国际医学院',
            position: [0, 0, -20],
            size: [40, 20, 24],
            color: 0xd8ecd8, roofColor: 0x336633,
            info: INFO
        };
        const b = createBuilding(data);
        scene.add(b);
        return b;
    }
}

const GLB_BUILDING_CONFIGS = [
    // ── 中部核心区 ──────────────────────────────────────────
    { id: 'reception', name: '接待中心',                      position: [-23, 0, -63.5], size: [17.6, 11.2, 12.8], info: { 建筑面积: '2800 m²', 楼层: '3层', 建成年份: '2010年', 简介: '学校对外接待与会议中心。' } },
    { id: 'admin2',    name: '行政中心',                      position: [38, 0, 22],     size: [22, 18, 16],       info: { 建筑面积: '4000 m²', 楼层: '4层', 建成年份: '2006年', 简介: '学校行政管理中心。' } },
    // ── 北部科研区 ───────────────────────────────────────────
    { id: 'lab13',     name: '13号楼（第三实验大楼）',         position: [-59, 0, -55],   size: [18, 10, 8],        info: { 建筑面积: '6000 m²', 楼层: '5层', 建成年份: '2014年', 简介: '理工科综合实验楼，配备精密仪器室。' } },
    { id: 'bio14',     name: '14号楼（生物与环境工程学院）',   position: [-59, 0, -80],   size: [18, 10, 8],        info: { 建筑面积: '7200 m²', 楼层: '6层', 建成年份: '2012年', 简介: '生物与环境工程学院科研教学楼。' } },
    { id: 'build15',   name: '15号楼',                        position: [-94, 0, -80],   size: [18, 10, 8],        info: { 建筑面积: '5500 m²', 楼层: '5层', 建成年份: '2015年', 简介: '15号教学科研楼。' } },
    { id: 'build16',   name: '16号楼',                        position: [-45, 0, -20],   size: [18, 10, 8],        info: { 建筑面积: '5500 m²', 楼层: '5层', 建成年份: '2014年', 简介: '16号教学科研楼。' } },
    { id: 'build17',   name: '17号楼',                        position: [-74, 0, -20],   size: [18, 10, 8],        info: { 建筑面积: '5500 m²', 楼层: '5层', 建成年份: '2016年', 简介: '17号教学科研楼。' } },
    { id: 'build18',   name: '18号楼',                        position: [-103, 0, -20],  size: [18, 10, 8],        info: { 建筑面积: '5500 m²', 楼层: '5层', 建成年份: '2017年', 简介: '18号教学科研楼。' } },
    { id: 'build22',   name: '22号楼',                        position: [-74, 0, 8],     size: [18, 10, 8],        info: { 建筑面积: '5500 m²', 楼层: '5500 m²', 建成年份: '2018年', 简介: '22号教学科研楼。' } },
    { id: 'build23',   name: '23号楼',                        position: [-74, 0, 20],    size: [18, 10, 8],        info: { 建筑面积: '5500 m²', 楼层: '5层', 建成年份: '2019年', 简介: '23号教学科研楼。' } },
    // ── 西北宿舍区（清乐园）──────────────────────────────────
    { id: 'qly1',      name: '清乐园1号楼',                   position: [-160, 0, -75],  size: [16, 28, 14],       info: { 建筑面积: '5600 m²', 楼层: '7层', 建成年份: '2006年', 简介: '男生宿舍，可住800人。' } },
    { id: 'qly2',      name: '清乐园2号楼',                   position: [-140, 0, -75],  size: [16, 28, 14],       info: { 建筑面积: '5600 m²', 楼层: '7层', 建成年份: '2008年', 简介: '女生宿舍，可住800人。' } },
    { id: 'qly34',     name: '清乐园3-4号楼',                 position: [-148, 0, -100], size: [45, 28, 14],       info: { 建筑面积: '5600 m²', 楼层: '7层', 建成年份: '2010年', 简介: '研究生宿舍，可住600人。' } },
    // ── 西南宿舍区（致和园）──────────────────────────────────
    { id: 'zhy1',      name: '致和园1号楼',                   position: [-90, 0, 170],   size: [20, 16, 7],        info: { 建筑面积: '6400 m²', 楼层: '8层', 建成年份: '2006年', 简介: '男生宿舍，可住960人。' } },
    { id: 'zhy2',      name: '致和园2号楼',                   position: [-90, 0, 185],   size: [20, 16, 7],        info: { 建筑面积: '6400 m²', 楼层: '8层', 建成年份: '2008年', 简介: '女生宿舍，可住960人。' } },
    // ── 图书馆后方 ───────────────────────────────────────────
    { id: 'build20',   name: '20号楼',                        position: [21.5, 0, -60],  size: [20, 16, 16],    info: { 建筑面积: '5500 m²', 楼层: '5层', 建成年份: '2020年', 简介: '20号教学科研楼。' } },
    { id: 'admin3',    name: '行政中心2',                      position: [46.5, 0, -60],  size: [22, 18, 16],   info: { 建筑面积: '4000 m²', 楼层: '4层', 建成年份: '2010年', 简介: '学校行政管理中心2号楼。' } },
    { id: 'build2',    name: '2号楼',                          position: [71.5, 0, -60],  size: [18, 10, 8],    info: { 建筑面积: '5500 m²', 楼层: '5层', 建成年份: '2010年', 简介: '2号教学楼。' } },
    { id: 'build3',    name: '3号楼',                          position: [93.5, 0, -60],  size: [18, 10, 8],    info: { 建筑面积: '5500 m²', 楼层: '5层', 建成年份: '2010年', 简介: '3号教学楼。' } },
    { id: 'build4',    name: '4号楼',                          position: [93.5, 0, -47],  size: [18, 10, 8],    info: { 建筑面积: '5500 m²', 楼层: '5层', 建成年份: '2010年', 简介: '4号教学楼。' } },
    { id: 'build5',    name: '5号楼',                          position: [116.5, 0, -47], size: [18, 10, 8],    info: { 建筑面积: '5500 m²', 楼层: '5层', 建成年份: '2010年', 简介: '5号教学楼。' } },
    { id: 'build6',    name: '6号楼',                          position: [116.5, 0, -34], size: [18, 10, 8],    info: { 建筑面积: '5500 m²', 楼层: '5层', 建成年份: '2010年', 简介: '6号教学楼。' } },
    { id: 'build7',    name: '7号楼',                          position: [116.5, 0, -21], size: [18, 10, 8],    info: { 建筑面积: '5500 m²', 楼层: '5层', 建成年份: '2010年', 简介: '7号教学楼。' } },
    { id: 'build8',    name: '8号楼',                          position: [116.5, 0, -8],  size: [18, 10, 8],    info: { 建筑面积: '5500 m²', 楼层: '5层', 建成年份: '2010年', 简介: '8号教学楼。' } },
    { id: 'build9',    name: '9号楼',                          position: [48.0, 0, -135],  size: [22, 18, 16],   info: { 建筑面积: '5500 m²', 楼层: '5层', 建成年份: '2012年', 简介: '9号教学科研楼。' } },
    { id: 'build10',   name: '10号楼',                         position: [8.0, 0, -125],   size: [20, 16, 16],   info: { 建筑面积: '5500 m²', 楼层: '5层', 建成年份: '2013年', 简介: '10号教学科研楼。' } },
    { id: 'build11',   name: '11号楼',                         position: [-1.0, 0, -145],  size: [20, 16, 16],   info: { 建筑面积: '5500 m²', 楼层: '5层', 建成年份: '2014年', 简介: '11号教学科研楼。' } },
    { id: 'build12',   name: '12号楼',                         position: [8.0, 0, -160],   size: [20, 16, 16],   info: { 建筑面积: '5500 m²', 楼层: '5层', 建成年份: '2015年', 简介: '12号教学科研楼。' } },
    // ── 操场南侧 ─────────────────────────────────────────────────
    { id: 'build26',   name: '26号楼',                         position: [135, 0, -135],   size: [22, 18, 16],   info: { 建筑面积: '5500 m²', 楼层: '5层', 建成年份: '2016年', 简介: '26号教学科研楼。' } },
    // ── 体育馆后方建筑群 ──────────────────────────────────────────
    { id: 'zhiqinWest', name: '致勤西楼',                      position: [45, 0, -235],    size: [28, 20, 16],   info: { 建筑面积: '6000 m²', 楼层: '5层', 建成年份: '2013年', 简介: '致勤西楼，综合教学科研楼。' } },
    { id: 'zhiqinEast', name: '致勤东楼',                      position: [100, 0, -235],   size: [28, 20, 16],   info: { 建筑面积: '6000 m²', 楼层: '5层', 建成年份: '2013年', 简介: '致勤东楼，综合教学科研楼。' } },
    { id: 'canteen',    name: '食堂',                           position: [72, 0, -265],    size: [40, 14, 18],   info: { 建筑面积: '8000 m²', 楼层: '3层', 建成年份: '2008年', 简介: '学生食堂，可同时容纳2000人就餐。' } },
    { id: 'complex',    name: '综合楼',                         position: [72, 0, -295],    size: [36, 22, 18],   info: { 建筑面积: '9000 m²', 楼层: '6层', 建成年份: '2011年', 简介: '综合服务楼，含超市、银行及学生活动中心。' } },
];

async function createGlbBuildings(scene) {
    const results = [];
    let gltf;
    try {
        gltf = await loadModel('./assets/models/building.glb');
    } catch (e) {
        console.warn('building.glb 加载失败，使用几何体替代', e);
        for (const cfg of GLB_BUILDING_CONFIGS) {
            const b = createBuilding({ ...cfg, color: 0xc8d4e0, roofColor: 0x4466aa });
            scene.add(b);
            results.push(b);
        }
        return results;
    }

    // 预先计算原始模型的 bounding box 尺寸
    const refBox = new THREE.Box3().setFromObject(gltf.scene);
    const refSize = refBox.getSize(new THREE.Vector3());

    for (const cfg of GLB_BUILDING_CONFIGS) {
        const model = gltf.scene.clone();
        const [tw, th, td] = cfg.size;

        // 按目标尺寸独立缩放三轴
        model.scale.set(tw / refSize.x, th / refSize.y, td / refSize.z);

        const box = new THREE.Box3().setFromObject(model);
        const [px, , pz] = cfg.position;
        model.position.set(px, -box.min.y, pz);
        model.rotation.y = Math.PI;
        model.name = cfg.id;

        model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.userData = { type: 'building', name: cfg.name, info: cfg.info };
            }
        });
        model.userData = { type: 'building', name: cfg.name, info: cfg.info };

        scene.add(model);
        results.push(model);
    }
    return results;
}

async function loadTeachingModel(x, z, rotY, name, INFO) {
    const gltf = await loadModel('./assets/models/teaching building.glb');
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.z);
    model.scale.setScalar(80 / maxDim);
    box.setFromObject(model);
    model.position.set(x, -box.min.y, z);
    model.rotation.y = rotY;
    model.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.userData = { type: 'building', name, info: INFO };
        }
    });
    model.userData = { type: 'building', name, info: INFO };
    return model;
}

async function createTeachingBuildings(scene) {
    const INFO = {
        建筑面积: '18000 m²',
        楼层: '6层',
        建成年份: '2015年',
        简介: '综合教学楼群，含多媒体教室、实验室及研讨室。'
    };
    const results = [];
    const configs = [
        { x: 30.5,  z: 90, rotY:  Math.PI / 2, name: '综合教学楼（东）' },
        { x: -30.5, z: 90, rotY:  Math.PI / 2, name: '综合教学楼（西）' },
    ];
    for (const cfg of configs) {
        try {
            const model = await loadTeachingModel(cfg.x, cfg.z, cfg.rotY, cfg.name, INFO);
            model.name = 'teaching';
            scene.add(model);
            results.push(model);
        } catch (e) {
            console.warn(`${cfg.name} glb 加载失败，使用几何体替代`, e);
            const data = {
                id: 'teaching', name: cfg.name,
                position: [cfg.x, 0, cfg.z],
                size: [40, 20, 50],
                color: 0xd0d8e8, roofColor: 0x445566,
                info: INFO
            };
            const b = createBuilding(data);
            scene.add(b);
            results.push(b);
        }
    }
    return results;
}

async function createMansion(scene) {
    const INFO = {
        建筑面积: '8000 m²',
        楼层: '4层',
        建成年份: '2016年',
        简介: '综合楼，位于2号楼南侧。'
    };
    try {
        const gltf = await loadModel('./assets/models/mansion.glb');
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.z);
        model.scale.setScalar(40 / maxDim);
        box.setFromObject(model);
        model.position.set(71.5, -box.min.y, -23);
        model.rotation.y = Math.PI / 2;
        model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.userData = { type: 'building', name: 'Mansion', info: INFO };
            }
        });
        model.userData = { type: 'building', name: 'Mansion', info: INFO };
        model.name = 'mansion';
        scene.add(model);
        return model;
    } catch (e) {
        console.warn('mansion.glb 加载失败，使用几何体替代', e);
        const data = {
            id: 'mansion', name: 'Mansion',
            position: [71.5, 0, -47],
            size: [20, 16, 16],
            color: 0xd0c8b8, roofColor: 0x665544,
            info: INFO
        };
        const b = createBuilding(data);
        scene.add(b);
        return b;
    }
}

async function createGym(scene) {
    const INFO = {
        建筑面积: '6000 m²',
        楼层: '3层',
        建成年份: '2014年',
        简介: '综合体育馆，含篮球场、游泳池及健身区。'
    };
    try {
        const gltf = await loadModel('./assets/models/gym.glb');
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.z);
        model.scale.setScalar(40 / maxDim);
        model.rotation.y = Math.PI / 2;
        box.setFromObject(model);
        model.position.set(75, -box.min.y, -200);
        model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.userData = { type: 'building', name: '体育馆', info: INFO };
            }
        });
        model.userData = { type: 'building', name: '体育馆', info: INFO };
        model.name = 'gym';
        scene.add(model);
        return model;
    } catch (e) {
        console.warn('gym.glb 加载失败，使用几何体替代', e);
        const data = {
            id: 'gym', name: '体育馆',
            position: [75, 0, -155],
            size: [40, 18, 30],
            color: 0xd4ccc0, roofColor: 0x665544,
            info: INFO
        };
        const b = createBuilding(data);
        scene.add(b);
        return b;
    }
}

async function createSchoolGate(scene) {
    const INFO = {
        建筑面积: '500 m²',
        建成年份: '2005年',
        简介: '校园正门，标志性入口建筑。'
    };
    try {
        const gltf = await loadModel('./assets/models/school gate.glb');
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.z);
        model.scale.setScalar(30 / maxDim);
        box.setFromObject(model);
        model.position.set(48, -box.min.y, -110);
        model.rotation.y = Math.PI / 2;
        model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.userData = { type: 'building', name: '校门', info: INFO };
            }
        });
        model.userData = { type: 'building', name: '校门', info: INFO };
        model.name = 'schoolGate';
        scene.add(model);
        return model;
    } catch (e) {
        console.warn('school gate.glb 加载失败，使用几何体替代', e);
        const data = {
            id: 'schoolGate', name: '校门',
            position: [48, 0, -110],
            size: [30, 10, 8],
            color: 0xe8e0d0, roofColor: 0x886644,
            info: INFO
        };
        const b = createBuilding(data);
        scene.add(b);
        return b;
    }
}

export async function createBuildings(scene) {
    const buildings = [];
    for (const data of BUILDING_DATA) {
        const b = createBuilding(data);
        scene.add(b);
        buildings.push(b);
    }
    const medical = await createMedicalCollege(scene);
    if (medical) buildings.push(medical);
    const glbBuildings = await createGlbBuildings(scene);
    for (const b of glbBuildings) buildings.push(b);
    const teachings = await createTeachingBuildings(scene);
    for (const t of teachings) buildings.push(t);
    const mansion = await createMansion(scene);
    if (mansion) buildings.push(mansion);
    const gym = await createGym(scene);
    if (gym) buildings.push(gym);
    const track = createTrack(scene);
    if (track) buildings.push(track);
    const schoolGate = await createSchoolGate(scene);
    if (schoolGate) buildings.push(schoolGate);
    return buildings;
}

export { BUILDING_DATA };
