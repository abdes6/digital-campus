import * as THREE from 'three';
import { loadModel } from './loader.js';

const LIB_INFO = {
    建筑面积: '12000 m²',
    楼层: '5层',
    建成年份: '2005年',
    简介: '馆藏图书80余万册，提供自习、借阅、数字资源等服务。'
};

async function createLibrary(scene) {
    try {
        const gltf = await loadModel('./assets/models/library.glb');
        const model = gltf.scene;

        // 计算模型包围盒，自动缩放到合适大小
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 80;
        const scale = targetSize / maxDim;
        model.scale.setScalar(scale);

        // 贴地放置到场景中央
        box.setFromObject(model);
        const minY = box.min.y;
        model.position.set(0, -minY, 0);

        model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.userData = { type: 'building', name: '图书馆', info: LIB_INFO };
            }
        });

        model.userData = { type: 'building', name: '图书馆', info: LIB_INFO };
        model.name = 'lib';
        scene.add(model);
        return model;
    } catch (e) {
        console.warn('library.glb 加载失败，使用几何体替代', e);
        return null;
    }
}

// 建筑信息数据（图书馆在中央，其余建筑分布四周，间距充足）
const BUILDING_DATA = [
    {
        id: 'teach_a',
        name: '教学楼A',
        position: [-80, 0, -60],
        size: [22, 24, 16],
        color: 0xc8d8e8,
        roofColor: 0x5577aa,
        info: {
            建筑面积: '8500 m²',
            楼层: '6层',
            建成年份: '2010年',
            简介: '主要承担理工科专业课程教学，配备多媒体教室。'
        }
    },
    {
        id: 'teach_b',
        name: '教学楼B',
        position: [80, 0, -60],
        size: [22, 24, 16],
        color: 0xc8d8e8,
        roofColor: 0x5577aa,
        info: {
            建筑面积: '8500 m²',
            楼层: '6层',
            建成年份: '2012年',
            简介: '主要承担文科专业课程教学，配备语音实验室。'
        }
    },
    {
        id: 'admin',
        name: '行政楼',
        position: [0, 0, 90],
        size: [28, 16, 14],
        color: 0xe8dcc8,
        roofColor: 0x996633,
        info: {
            建筑面积: '5000 m²',
            楼层: '4层',
            建成年份: '2000年',
            简介: '学校行政管理中心，设有各职能部门办公室。'
        }
    },
    {
        id: 'gym',
        name: '体育馆',
        position: [-100, 0, 20],
        size: [35, 14, 28],
        color: 0xd0e8d0,
        roofColor: 0x336633,
        info: {
            建筑面积: '6000 m²',
            楼层: '2层',
            建成年份: '2015年',
            简介: '设有篮球场、羽毛球场、乒乓球室等运动设施。'
        }
    },
    {
        id: 'dorm',
        name: '学生宿舍',
        position: [100, 0, 20],
        size: [20, 32, 14],
        color: 0xf0e0c8,
        roofColor: 0xaa6633,
        info: {
            建筑面积: '9000 m²',
            楼层: '8层',
            建成年份: '2018年',
            简介: '可容纳学生1200人，配备空调、热水等生活设施。'
        }
    }
];

function createBuilding(data) {
    const group = new THREE.Group();
    group.name = data.id;
    group.userData = { type: 'building', name: data.name, info: data.info };

    const [w, h, d] = data.size;

    // 主体
    const bodyGeo = new THREE.BoxGeometry(w, h, d);
    const bodyMat = new THREE.MeshLambertMaterial({ color: data.color });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    body.userData = group.userData;
    group.add(body);

    // 屋顶
    const roofGeo = new THREE.BoxGeometry(w + 0.5, 1.5, d + 0.5);
    const roofMat = new THREE.MeshLambertMaterial({ color: data.roofColor });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = h + 0.75;
    roof.castShadow = true;
    roof.userData = group.userData;
    group.add(roof);

    // 窗户（简单贴面）
    addWindows(group, w, h, d, data.color);

    group.position.set(...data.position);
    return group;
}

function addWindows(group, w, h, d, baseColor) {
    const winMat = new THREE.MeshLambertMaterial({ color: 0x88bbdd, transparent: true, opacity: 0.7 });
    const floors = Math.max(2, Math.floor(h / 4));
    const cols = Math.max(2, Math.floor(w / 5));

    for (let f = 0; f < floors; f++) {
        for (let c = 0; c < cols; c++) {
            const winGeo = new THREE.PlaneGeometry(1.8, 1.4);
            const win = new THREE.Mesh(winGeo, winMat);
            const x = -w / 2 + (c + 0.5) * (w / cols) + w / cols / 2 - w / cols;
            const y = 2 + f * (h / floors);
            win.position.set(x, y, d / 2 + 0.01);
            win.userData = group.userData;
            group.add(win);
        }
    }
}

export async function createBuildings(scene) {
    const buildings = [];

    // 其余建筑用几何体（跳过 lib，由 GLB 替代）
    for (const data of BUILDING_DATA) {
        if (data.id === 'lib') continue;
        const b = createBuilding(data);
        scene.add(b);
        buildings.push(b);
    }

    // 异步加载图书馆 GLB
    const lib = await createLibrary(scene);
    if (lib) buildings.push(lib);

    return buildings;
}

export { BUILDING_DATA };
