import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
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
// 插入到 body 最前面，确保 canvas 在 DOM 层级低于 HUD 元素
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
        console.log('[view] clicked:', btn.dataset.view);
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        switchView(btn.dataset.view, camera, controls);
        console.log('[view] camera after switchView call:', camera.position);
    });
});

// 调试：暴露到 window
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
