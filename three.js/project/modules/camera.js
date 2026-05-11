import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

// 预设视角
const VIEWS = {
    perspective: {
        position: new THREE.Vector3(80, 60, 80),
        target: new THREE.Vector3(0, 0, 0),
        label: '透视视角'
    },
    birdseye: {
        position: new THREE.Vector3(0, 180, 0.1),
        target: new THREE.Vector3(0, 0, 0),
        label: '鸟瞰视角'
    },
    front: {
        position: new THREE.Vector3(0, 30, 120),
        target: new THREE.Vector3(0, 10, 0),
        label: '正面视角'
    }
};

export function initCamera() {
    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.5,
        1000
    );
    const v = VIEWS.perspective;
    camera.position.copy(v.position);
    camera.lookAt(v.target);
    return camera;
}

export function switchView(viewName, camera, controls) {
    const view = VIEWS[viewName];
    if (!view) return;

    const fromPos = camera.position.clone();
    const fromTarget = controls.target.clone();

    new TWEEN.Tween({ t: 0 })
        .to({ t: 1 }, 1200)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate(({ t }) => {
            camera.position.lerpVectors(fromPos, view.position, t);
            controls.target.lerpVectors(fromTarget, view.target, t);
            controls.update();
        })
        .start();
}

export { VIEWS };
