import * as THREE from 'three';

// 建筑信息数据
const BUILDING_DATA = [
    {
        id: 'lib',
        name: '图书馆',
        position: [0, 0, -20],
        size: [20, 18, 16],
        color: 0xd4a96a,
        roofColor: 0x8b4513,
        info: {
            建筑面积: '12000 m²',
            楼层: '5层',
            建成年份: '2005年',
            简介: '馆藏图书80余万册，提供自习、借阅、数字资源等服务。'
        }
    },
    {
        id: 'teach_a',
        name: '教学楼A',
        position: [-35, 0, 10],
        size: [18, 22, 14],
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
        position: [35, 0, 10],
        size: [18, 22, 14],
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
        position: [0, 0, 30],
        size: [24, 14, 12],
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
        position: [-50, 0, -30],
        size: [30, 12, 25],
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
        position: [55, 0, -25],
        size: [16, 28, 12],
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

export function createBuildings(scene) {
    const buildings = [];
    for (const data of BUILDING_DATA) {
        const b = createBuilding(data);
        scene.add(b);
        buildings.push(b);
    }
    return buildings;
}

export { BUILDING_DATA };
