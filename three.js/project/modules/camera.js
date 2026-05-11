import * as THREE from 'three';

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
    const toPos = view.position.clone();
    const toTarget = view.target.clone();

    const duration = 1200;
    const start = performance.now();

    // 鸟瞰需要临时放开极角限制
    const prevMaxPolar = controls.maxPolarAngle;
    if (viewName === 'birdseye') controls.maxPolarAngle = Math.PI;

    function easeInOut(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function tick(now) {
        const elapsed = now - start;
        const t = easeInOut(Math.min(elapsed / duration, 1));

        camera.position.lerpVectors(fromPos, toPos, t);
        controls.target.lerpVectors(fromTarget, toTarget, t);
        controls.update();

        if (elapsed < duration) {
            requestAnimationFrame(tick);
        } else {
            camera.position.copy(toPos);
            controls.target.copy(toTarget);
            controls.update();
            if (viewName !== 'birdseye') controls.maxPolarAngle = prevMaxPolar;
        }
    }

    requestAnimationFrame(tick);
}

export { VIEWS };
