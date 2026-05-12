import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { initScene } from './modules/scene.js';
import { initCamera, switchView } from './modules/camera.js';
import { initControls } from './modules/controls.js';
import { createBuildings } from './modules/buildings.js';
import { createRoads } from './modules/roads.js';
import { createVegetation } from './modules/vegetation.js';
import { startPatrolAnimation, pulseObject } from './modules/animation.js';
import { showInfo, hidePanel } from './modules/infoPanel.js';

// ── 初始化 ──────────────────────────────────────────────
const scene = initScene();
const camera = initCamera();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.insertBefore(renderer.domElement, document.body.firstChild);

const controls = initControls(camera, renderer.domElement);

// ── 场景对象 ────────────────────────────────────────────
const buildings = await createBuildings(scene);
const roads = createRoads(scene);
const vegetation = createVegetation(scene);

// 所有可点击对象（展平 group 子网格）
const clickables = [];
[...buildings, ...roads, ...vegetation].forEach(obj => {
    obj.traverse(child => {
        if (child.isMesh) clickables.push(child);
    });
});

// ── 图层控制 ────────────────────────────────────────────
const layers = {
    buildings: { objects: buildings, visible: true },
    roads:     { objects: roads,     visible: true },
    vegetation:{ objects: vegetation,visible: true }
};

document.querySelectorAll('.layer-item input').forEach(cb => {
    cb.addEventListener('change', () => {
        const layer = layers[cb.dataset.layer];
        if (!layer) return;
        layer.visible = cb.checked;
        layer.objects.forEach(o => { o.visible = cb.checked; });
    });
});

// ── 视角切换 ────────────────────────────────────────────
document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        switchView(btn.dataset.view, camera, controls);
    });
});

window.__camera = camera;
window.__controls = controls;

// ── 巡游动画 ────────────────────────────────────────────
let patrolActive = false;
document.getElementById('btn-patrol').addEventListener('click', () => {
    if (!patrolActive) {
        patrolActive = true;
        document.getElementById('btn-patrol').classList.add('active');
        startPatrolAnimation(camera, controls, TWEEN);
        setTimeout(() => {
            patrolActive = false;
            document.getElementById('btn-patrol').classList.remove('active');
        }, 15000);
    }
});

// ── 建筑位置调整 GUI ────────────────────────────────────
const gui = new GUI({ title: '建筑位置调整', width: 260 });
gui.domElement.style.position = 'fixed';
gui.domElement.style.right = '10px';
gui.domElement.style.top = '60px';
gui.close();

const guiState = {
    建筑: '（点击建筑选择）',
    X: 0,
    Y: 0,
    Z: 0,
    旋转Y: 0,
    缩放: 1,
    缩放X: 1,
    缩放Y: 1,
    缩放Z: 1,
    打印坐标: () => {
        if (selectedBuilding) {
            const p = selectedBuilding.position;
            const ry = THREE.MathUtils.radToDeg(selectedBuilding.rotation.y);
            const s = selectedBuilding.scale;
            console.log(`[位置] ${selectedBuilding.name || selectedBuilding.userData.name}: [${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)}] 旋转Y: ${ry.toFixed(1)}° 缩放: ${s.x.toFixed(2)}/${s.y.toFixed(2)}/${s.z.toFixed(2)}`);
        }
    }
};

let selectedBuilding = null;
let xCtrl, yCtrl, zCtrl, ryCtrl, scaleCtrl, scaleXCtrl, scaleYCtrl, scaleZCtrl, nameCtrl;

nameCtrl = gui.add(guiState, '建筑').name('当前建筑').listen();
xCtrl = gui.add(guiState, 'X', -200, 200, 0.5).name('X 位置').onChange(v => {
    if (selectedBuilding) selectedBuilding.position.x = v;
});
yCtrl = gui.add(guiState, 'Y', -10, 50, 0.5).name('Y 位置').onChange(v => {
    if (selectedBuilding) selectedBuilding.position.y = v;
});
zCtrl = gui.add(guiState, 'Z', -200, 200, 0.5).name('Z 位置').onChange(v => {
    if (selectedBuilding) selectedBuilding.position.z = v;
});
ryCtrl = gui.add(guiState, '旋转Y', -180, 180, 1).name('旋转 Y (°)').onChange(v => {
    if (selectedBuilding) selectedBuilding.rotation.y = THREE.MathUtils.degToRad(v);
});
scaleCtrl = gui.add(guiState, '缩放', 0.1, 5, 0.05).name('整体缩放').onChange(v => {
    if (selectedBuilding) {
        selectedBuilding.scale.set(v * guiState['缩放X'], v * guiState['缩放Y'], v * guiState['缩放Z']);
    }
});
scaleXCtrl = gui.add(guiState, '缩放X', 0.1, 5, 0.05).name('X 轴缩放').onChange(v => {
    if (selectedBuilding) selectedBuilding.scale.x = guiState['缩放'] * v;
});
scaleYCtrl = gui.add(guiState, '缩放Y', 0.1, 5, 0.05).name('Y 轴缩放').onChange(v => {
    if (selectedBuilding) selectedBuilding.scale.y = guiState['缩放'] * v;
});
scaleZCtrl = gui.add(guiState, '缩放Z', 0.1, 5, 0.05).name('Z 轴缩放').onChange(v => {
    if (selectedBuilding) selectedBuilding.scale.z = guiState['缩放'] * v;
});
gui.add(guiState, '打印坐标').name('📋 打印当前坐标到控制台');

function selectBuilding(obj) {
    // 找到顶层 group（建筑根节点）
    let root = obj;
    while (root.parent && root.parent !== scene) {
        root = root.parent;
    }
    if (!buildings.includes(root)) return null;
    return root;
}

// ── 点击拾取 ────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('click', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(clickables);

    if (hits.length > 0) {
        const obj = hits[0].object;
        const root = selectBuilding(obj);

        if (root) {
            selectedBuilding = root;
            const name = root.userData.name || root.name;
            guiState['建筑'] = name;
            guiState.X = parseFloat(root.position.x.toFixed(1));
            guiState.Y = parseFloat(root.position.y.toFixed(1));
            guiState.Z = parseFloat(root.position.z.toFixed(1));
            guiState['旋转Y'] = parseFloat(THREE.MathUtils.radToDeg(root.rotation.y).toFixed(1));
            guiState['缩放'] = parseFloat(root.scale.y.toFixed(2));
            guiState['缩放X'] = parseFloat((root.scale.x / root.scale.y).toFixed(2));
            guiState['缩放Y'] = 1;
            guiState['缩放Z'] = parseFloat((root.scale.z / root.scale.y).toFixed(2));
            xCtrl.updateDisplay();
            yCtrl.updateDisplay();
            zCtrl.updateDisplay();
            ryCtrl.updateDisplay();
            scaleCtrl.updateDisplay();
            scaleXCtrl.updateDisplay();
            scaleYCtrl.updateDisplay();
            scaleZCtrl.updateDisplay();
            gui.open();
        }

        if (obj.userData && obj.userData.name) {
            showInfo(obj.userData);
            pulseObject(obj.parent || obj, TWEEN);
        } else if (obj.userData && obj.userData.type) {
            showInfo(obj.userData);
        } else {
            hidePanel();
        }
    } else {
        hidePanel();
    }
});

// ── 窗口自适应 ──────────────────────────────────────────
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── 隐藏加载遮罩 ────────────────────────────────────────
document.getElementById('loading').style.display = 'none';

// ── 渲染循环 ────────────────────────────────────────────
function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();
    renderer.render(scene, camera);
}
animate();
