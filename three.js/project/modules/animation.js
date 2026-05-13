let activeTween = null;
let patrolStopped = false;

export function stopPatrolAnimation() {
    patrolStopped = true;
    if (activeTween) {
        activeTween.stop();
        activeTween = null;
    }
}

export function startPatrolAnimation(camera, controls, TWEEN, onLabel, onDone) {
    patrolStopped = false;

    // 覆盖全校园的航点：位置 + 朝向目标 + 区域标签
    // 坐标系：Z+=南 Z-=北 X+=东 X-=西
    const waypoints = [
        // 起点：南门鸟瞰
        { pos: { x: 0,    y: 70,  z: 170  }, target: { x: 0,   y: 0,  z: 130  }, label: '南门入口' },
        // 综合教学楼（东西各在 x=±30.5, z=90）
        { pos: { x: 0,    y: 45,  z: 140  }, target: { x: 0,   y: 8,  z: 90   }, label: '综合教学楼' },
        // 致和园（x=-90, z=170~185）
        { pos: { x: -60,  y: 35,  z: 195  }, target: { x: -90, y: 8,  z: 177  }, label: '致和园宿舍区' },
        // 行政中心（x=38, z=22）
        { pos: { x: 80,   y: 40,  z: 60   }, target: { x: 38,  y: 8,  z: 22   }, label: '行政中心' },
        // 树兰国际医学院（x=0, z=-20）
        { pos: { x: 50,   y: 35,  z: 30   }, target: { x: 0,   y: 8,  z: -20  }, label: '树兰国际医学院' },
        // 接待中心（x=-23, z=-63.5）
        { pos: { x: 20,   y: 30,  z: -30  }, target: { x: -23, y: 5,  z: -63  }, label: '接待中心' },
        // 16/17/18号楼（x=-45~-103, z=-20）
        { pos: { x: -50,  y: 35,  z: 20   }, target: { x: -74, y: 5,  z: -20  }, label: '16-18号楼' },
        // 13/14/15号楼（x=-59~-94, z=-80）
        { pos: { x: -40,  y: 35,  z: -50  }, target: { x: -70, y: 5,  z: -80  }, label: '13-15号楼' },
        // 清乐园（x=-140~-160, z=-75~-100）
        { pos: { x: -110, y: 40,  z: -50  }, target: { x: -148,y: 8,  z: -87  }, label: '清乐园宿舍区' },
        // 9-12号楼（x=8~48, z=-120~-160）
        { pos: { x: 70,   y: 40,  z: -100 }, target: { x: 25,  y: 8,  z: -135 }, label: '9-12号楼' },
        // 2-3号楼 + mansion（x=71~93, z=-60~-23）
        { pos: { x: 110,  y: 35,  z: -20  }, target: { x: 80,  y: 5,  z: -50  }, label: '东侧教学楼群' },
        // 5-8号楼（x=116.5, z=-47~-8）
        { pos: { x: 150,  y: 35,  z: -30  }, target: { x: 116, y: 5,  z: -28  }, label: '5-8号楼' },
        // 返回南门鸟瞰
        { pos: { x: 0,    y: 70,  z: 170  }, target: { x: 0,   y: 0,  z: 130  }, label: '返回南门' },
    ];

    const DURATION = 3500;

    const tweens = waypoints.slice(1).map((wp, i) => {
        const from = waypoints[i];
        const t = new TWEEN.Tween({
            px: from.pos.x, py: from.pos.y, pz: from.pos.z,
            tx: from.target.x, ty: from.target.y, tz: from.target.z
        }, TWEEN)
        .to({
            px: wp.pos.x, py: wp.pos.y, pz: wp.pos.z,
            tx: wp.target.x, ty: wp.target.y, tz: wp.target.z
        }, DURATION)
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .onStart(() => {
            if (onLabel) onLabel(wp.label);
        })
        .onUpdate((obj) => {
            if (patrolStopped) return;
            camera.position.set(obj.px, obj.py, obj.pz);
            controls.target.set(obj.tx, obj.ty, obj.tz);
            controls.update();
        });
        return t;
    });

    for (let i = 0; i < tweens.length - 1; i++) {
        tweens[i].chain(tweens[i + 1]);
    }
    tweens[tweens.length - 1].onComplete(() => {
        if (onDone) onDone();
    });

    activeTween = tweens[0];
    tweens[0].start();
    if (onLabel) onLabel(waypoints[1].label);
    return tweens[0];
}

export function pulseObject(mesh, TWEEN) {
    const sx = mesh.scale.x, sy = mesh.scale.y, sz = mesh.scale.z;
    const origin = { s: 1 };
    new TWEEN.Tween(origin, TWEEN)
        .to({ s: 1.15 }, 400)
        .easing(TWEEN.Easing.Quadratic.Out)
        .yoyo(true)
        .repeat(1)
        .onUpdate(({ s }) => mesh.scale.set(sx * s, sy * s, sz * s))
        .onComplete(() => mesh.scale.set(sx, sy, sz))
        .start();
}
