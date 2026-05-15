import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
// import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { initScene } from './modules/scene.js';
import { initCamera, switchView } from './modules/camera.js';
import { initControls } from './modules/controls.js';
import { createBuildings } from './modules/buildings.js';
import { createRoads } from './modules/roads.js';
import { createVegetation } from './modules/vegetation.js';
import { startPatrolAnimation, stopPatrolAnimation, pulseObject, setPatrolSpeed } from './modules/animation.js';
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

// CSS2D 标签渲染器
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.left = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
labelRenderer.domElement.style.zIndex = '1';
document.body.appendChild(labelRenderer.domElement);

const controls = initControls(camera, renderer.domElement);

// ── 场景对象 ────────────────────────────────────────────
const buildings = await createBuildings(scene);
const roads = createRoads(scene);
const vegetation = createVegetation(scene);

// ── CSS2D 建筑标签 ──────────────────────────────────────
const buildingLabels = [];
let labelsVisible = true;

function createBuildingLabel(building) {
    const name = building.userData.name;
    if (!name) return null;
    
    // 获取建筑的边界框和世界坐标
    const box = new THREE.Box3().setFromObject(building);
    const worldPos = new THREE.Vector3();
    building.getWorldPosition(worldPos);
    
    // 标签放在建筑上方
    const labelX = worldPos.x;
    const labelY = box.max.y + 5;
    const labelZ = worldPos.z;
    
    const div = document.createElement('div');
    div.textContent = name;
    div.className = 'building-label';
    const label = new CSS2DObject(div);
    label.position.set(labelX, labelY, labelZ);
    label.visible = true;
    
    // 直接添加到场景
    scene.add(label);
    return label;
}

for (const b of buildings) {
    const label = createBuildingLabel(b);
    if (label) buildingLabels.push(label);
}

// 标签显隐切换
document.getElementById('btn-labels').addEventListener('click', () => {
    labelsVisible = !labelsVisible;
    buildingLabels.forEach(l => { l.visible = labelsVisible; });
    document.getElementById('btn-labels').classList.toggle('active');
});

// ── 建筑搜索与飞行定位 ──────────────────────────────────
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

const buildingIndex = buildings
    .map(b => ({ name: b.userData.name || '', object: b }))
    .filter(item => item.name);

searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    if (!query) { searchResults.style.display = 'none'; return; }
    const matches = buildingIndex.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
    );
    if (!matches.length) { searchResults.style.display = 'none'; return; }
    searchResults.innerHTML = matches.map(item =>
        `<div class="search-result-item" data-name="${item.name}">${item.name}</div>`
    ).join('');
    searchResults.style.display = 'block';
});

searchResults.addEventListener('click', (e) => {
    const item = e.target.closest('.search-result-item');
    if (!item) return;
    const name = item.dataset.name;
    const entry = buildingIndex.find(b => b.name === name);
    if (entry) flyTo(entry.object);
    searchInput.value = name;
    searchResults.style.display = 'none';
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('#search-container')) {
        searchResults.style.display = 'none';
    }
});

function flyTo(obj) {
    highlightObject(obj);
}

// ── 点击高亮效果 ────────────────────────────────────────
let highlightedObj = null;

function highlightObject(obj) {
    if (highlightedObj && highlightedObj !== obj) {
        resetHighlight(highlightedObj);
    }
    highlightedObj = obj;
    
    obj.traverse(child => {
        if (child.isMesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(m => {
                if (m && m.emissive) {
                    if (!m._origEmissiveSet) {
                        m._origEmissive = m.emissive.getHex();
                        m._origEmissiveSet = true;
                    }
                    m.emissive.setHex(0x4488ff);
                    m.emissiveIntensity = 0.35;
                }
            });
        }
    });
}

function resetHighlight(obj) {
    obj.traverse(child => {
        if (child.isMesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(m => {
                if (m && m._origEmissive !== undefined && m.emissive) {
                    m.emissive.setHex(m._origEmissive);
                    m.emissiveIntensity = 0;
                }
            });
        }
    });
    highlightedObj = null;
}

// 所有可点击对象（展平 group 子网格）
const clickables = [];
[...buildings, ...roads, ...vegetation].forEach(obj => {
    obj.traverse(child => {
        if (child.isMesh) clickables.push(child);
    });
});

// ── 图层控制 ────────────────────────────────────────────
const layers = {
    buildings: { objects: buildings, labels: buildingLabels, visible: true },
    roads:     { objects: roads,     visible: true },
    vegetation:{ objects: vegetation,visible: true }
};

document.querySelectorAll('.layer-item input').forEach(cb => {
    cb.addEventListener('change', () => {
        const layer = layers[cb.dataset.layer];
        if (!layer) return;
        layer.visible = cb.checked;
        layer.objects.forEach(o => { o.visible = cb.checked; });
        // 同时控制标签显示
        if (layer.labels) {
            layer.labels.forEach(l => { l.visible = cb.checked && labelsVisible; });
        }
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
const btnPatrol = document.getElementById('btn-patrol');
const tooltip = document.getElementById('tooltip');
const defaultTooltip = '鼠标左键旋转 · 滚轮缩放 · 右键平移 · 点击对象查看信息';

btnPatrol.addEventListener('click', () => {
    if (!patrolActive) {
        patrolActive = true;
        btnPatrol.textContent = '停止巡游';
        btnPatrol.classList.add('active');
        startPatrolAnimation(camera, controls, TWEEN,
            (label) => { tooltip.textContent = `巡游中：${label}`; },
            () => {
                patrolActive = false;
                btnPatrol.textContent = '场景巡游';
                btnPatrol.classList.remove('active');
                tooltip.textContent = defaultTooltip;
            }
        );
    } else {
        patrolActive = false;
        stopPatrolAnimation();
        btnPatrol.textContent = '场景巡游';
        btnPatrol.classList.remove('active');
        tooltip.textContent = defaultTooltip;
    }
});

// 巡游速度控制
const speedSlider = document.getElementById('patrol-speed');
const speedValue = document.getElementById('speed-value');
if (speedSlider && speedValue) {
    speedSlider.addEventListener('input', () => {
        const speed = parseFloat(speedSlider.value);
        speedValue.textContent = speed.toFixed(1) + 'x';
        setPatrolSpeed(speed);
    });
}

// ── 位置调整 GUI ────────────────────────────────────────
// const gui = new GUI({ title: '对象位置调整', width: 260 });
// gui.domElement.style.position = 'fixed';
// gui.domElement.style.right = '10px';
// gui.domElement.style.top = '60px';
// gui.close();

// const guiState = {
//     对象: '（点击对象选择）',
//     X: 0,
//     Y: 0,
//     Z: 0,
//     旋转Y: 0,
//     缩放: 1,
//     缩放X: 1,
//     缩放Y: 1,
//     缩放Z: 1,
//     宽度: 1,
//     长度: 1,
//     打印坐标: () => {
//         if (selectedBuilding) {
//             const p = selectedBuilding.position;
//             const ry = THREE.MathUtils.radToDeg(selectedBuilding.rotation.y);
//             const s = selectedBuilding.scale;
//             console.log(`[位置] ${selectedBuilding.name || selectedBuilding.userData.name}: [${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)}] 旋转Y: ${ry.toFixed(1)}° 缩放: ${s.x.toFixed(2)}/${s.y.toFixed(2)}/${s.z.toFixed(2)}`);
//         }
//     }
// };

// let selectedBuilding = null;
// let xCtrl, yCtrl, zCtrl, ryCtrl, scaleCtrl, scaleXCtrl, scaleYCtrl, scaleZCtrl, nameCtrl, widthCtrl, lengthCtrl;

// nameCtrl = gui.add(guiState, '对象').name('当前对象').listen();
// xCtrl = gui.add(guiState, 'X', -200, 200, 0.5).name('X 位置').onChange(v => {
//     if (selectedBuilding) selectedBuilding.position.x = v;
// });
// yCtrl = gui.add(guiState, 'Y', -10, 50, 0.5).name('Y 位置').onChange(v => {
//     if (selectedBuilding) selectedBuilding.position.y = v;
// });
// zCtrl = gui.add(guiState, 'Z', -200, 200, 0.5).name('Z 位置').onChange(v => {
//     if (selectedBuilding) selectedBuilding.position.z = v;
// });
// ryCtrl = gui.add(guiState, '旋转Y', -180, 180, 1).name('旋转 Y (°)').onChange(v => {
//     if (selectedBuilding) selectedBuilding.rotation.y = THREE.MathUtils.degToRad(v);
// });
// scaleCtrl = gui.add(guiState, '缩放', 0.1, 5, 0.05).name('整体缩放').onChange(v => {
//     if (selectedBuilding) {
//         selectedBuilding.scale.set(v * guiState['缩放X'], v * guiState['缩放Y'], v * guiState['缩放Z']);
//     }
// });
// scaleXCtrl = gui.add(guiState, '缩放X', 0.1, 5, 0.05).name('X 轴缩放').onChange(v => {
//     if (selectedBuilding) selectedBuilding.scale.x = guiState['缩放'] * v;
// });
// scaleYCtrl = gui.add(guiState, '缩放Y', 0.1, 5, 0.05).name('Y 轴缩放').onChange(v => {
//     if (selectedBuilding) selectedBuilding.scale.y = guiState['缩放'] * v;
// });
// scaleZCtrl = gui.add(guiState, '缩放Z', 0.1, 5, 0.05).name('Z 轴缩放').onChange(v => {
//     if (selectedBuilding) selectedBuilding.scale.z = guiState['缩放'] * v;
// });
// widthCtrl = gui.add(guiState, '宽度', 0.5, 30, 0.5).name('宽度（道路）').onChange(v => {
//     if (selectedBuilding && selectedBuilding.userData.type === 'road') {
//         const ry = Math.abs(selectedBuilding.rotation.y % Math.PI);
//         if (ry < 0.1) selectedBuilding.scale.x = v;
//         else selectedBuilding.scale.z = v;
//     }
// });
// lengthCtrl = gui.add(guiState, '长度', 1, 400, 1).name('长度（道路）').onChange(v => {
//     if (selectedBuilding && selectedBuilding.userData.type === 'road') {
//         const ry = Math.abs(selectedBuilding.rotation.y % Math.PI);
//         if (ry < 0.1) selectedBuilding.scale.z = v;
//         else selectedBuilding.scale.x = v;
//     }
// });
// gui.add(guiState, '打印坐标').name('📋 打印当前坐标到控制台');

function selectObject(obj) {
    let current = obj;
    while (current) {
        if (buildings.includes(current) || roads.includes(current)) {
            return current;
        }
        current = current.parent;
    }
    return null;
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
        const root = selectObject(obj);

        if (root) {
            // if (selectedBuilding === root && highlightedObj === root) {
            //     resetHighlight(root);
            //     selectedBuilding = null;
            //     hidePanel();
            //     return;
            // }
            // selectedBuilding = root;
            if (highlightedObj === root) {
                resetHighlight(root);
                highlightedObj = null;
                hidePanel();
                return;
            }
            highlightObject(root);
            // const name = root.userData.name || root.name || '道路';
            // guiState['对象'] = name;
            // guiState.X = parseFloat(root.position.x.toFixed(1));
            // guiState.Y = parseFloat(root.position.y.toFixed(1));
            // guiState.Z = parseFloat(root.position.z.toFixed(1));
            // guiState['旋转Y'] = parseFloat(THREE.MathUtils.radToDeg(root.rotation.y).toFixed(1));
            // guiState['缩放'] = parseFloat(root.scale.y.toFixed(2));
            // guiState['缩放X'] = parseFloat((root.scale.x / Math.max(root.scale.y, 0.001)).toFixed(2));
            // guiState['缩放Y'] = 1;
            // guiState['缩放Z'] = parseFloat((root.scale.z / Math.max(root.scale.y, 0.001)).toFixed(2));
            // guiState['宽度'] = parseFloat(root.scale.x.toFixed(1));
            // guiState['长度'] = parseFloat(root.scale.z.toFixed(1));
            // xCtrl.updateDisplay();
            // yCtrl.updateDisplay();
            // zCtrl.updateDisplay();
            // ryCtrl.updateDisplay();
            // scaleCtrl.updateDisplay();
            // scaleXCtrl.updateDisplay();
            // scaleYCtrl.updateDisplay();
            // scaleZCtrl.updateDisplay();
            // widthCtrl.updateDisplay();
            // lengthCtrl.updateDisplay();
            // gui.open();
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
        // 点击空白处取消高亮
        if (highlightedObj) {
            resetHighlight(highlightedObj);
            highlightedObj = null;
        }
        // selectedBuilding = null;
        hidePanel();
    }
});

// ── 窗口自适应 ──────────────────────────────────────────
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// ── 隐藏加载遮罩 ────────────────────────────────────────
document.getElementById('loading').style.display = 'none';

// ── 渲染循环 ────────────────────────────────────────────
function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}
animate();
