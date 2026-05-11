import TWEEN from '@tweenjs/tween.js';

export function startPatrolAnimation(camera, controls) {
    const waypoints = [
        { pos: { x: 80, y: 50, z: 80 },  target: { x: 0, y: 0, z: 0 } },
        { pos: { x: -80, y: 40, z: 60 }, target: { x: -20, y: 5, z: 0 } },
        { pos: { x: -60, y: 60, z: -60 },target: { x: 0, y: 0, z: -20 } },
        { pos: { x: 60, y: 45, z: -70 }, target: { x: 20, y: 5, z: -20 } },
        { pos: { x: 80, y: 50, z: 80 },  target: { x: 0, y: 0, z: 0 } }
    ];

    let chain = null;
    const tweens = waypoints.slice(1).map((wp, i) => {
        const from = waypoints[i];
        const t = new TWEEN.Tween({
            px: from.pos.x, py: from.pos.y, pz: from.pos.z,
            tx: from.target.x, ty: from.target.y, tz: from.target.z
        })
        .to({
            px: wp.pos.x, py: wp.pos.y, pz: wp.pos.z,
            tx: wp.target.x, ty: wp.target.y, tz: wp.target.z
        }, 3000)
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .onUpdate((obj) => {
            camera.position.set(obj.px, obj.py, obj.pz);
            controls.target.set(obj.tx, obj.ty, obj.tz);
            controls.update();
        });
        return t;
    });

    // 链式连接
    for (let i = 0; i < tweens.length - 1; i++) {
        tweens[i].chain(tweens[i + 1]);
    }

    tweens[0].start();
    return tweens[0];
}

export function pulseObject(mesh) {
    const origin = { s: 1 };
    new TWEEN.Tween(origin)
        .to({ s: 1.15 }, 400)
        .easing(TWEEN.Easing.Quadratic.Out)
        .yoyo(true)
        .repeat(1)
        .onUpdate(({ s }) => mesh.scale.setScalar(s))
        .onComplete(() => mesh.scale.setScalar(1))
        .start();
}
