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
    // 按顺时针路线：南门 → 教学区 → 致和园(经新连接路) → 科研区 → 医学院 → 体育馆 → 东侧楼群 → 行政中心 → 返回
    const waypoints = [
        // 起点：南门广场鸟瞰（可俯瞰新建的南门广场与树人街）
        { pos: { x: 0,    y: 55,  z: 155  }, target: { x: 0,   y: 0,  z: 125  }, label: '南门广场 & 树人街' },
        // 综合教学楼 + 教学区广场（两栋教学楼间的新广场）
        { pos: { x: 0,    y: 35,  z: 115  }, target: { x: 0,   y: 8,  z: 90   }, label: '综合教学楼 & 教学区广场' },
        // 致和园（经致和园连接路观赏西南宿舍区）
        { pos: { x: -65,  y: 30,  z: 185  }, target: { x: -90, y: 8,  z: 177  }, label: '致和园宿舍区' },
        // 北部科研区（16-18号楼 + 13-15号楼群）
        { pos: { x: -100, y: 45,  z: -30  }, target: { x: -74, y: 5,  z: -40  }, label: '北部科研区 & 清乐园' },
        // 树兰国际医学院 + 中心绿轴 + 医学院广场
        { pos: { x: 0,    y: 30,  z: 15   }, target: { x: 0,   y: 5,  z: -10  }, label: '树兰国际医学院 & 医学院广场' },
        // 体育馆 + 操场（含校门至体育馆路）
        { pos: { x: 95,   y: 50,  z: -170 }, target: { x: 95,  y: 0,  z: -200 }, label: '体育馆 & 操场' },
        // 东侧教学楼群（2-8号楼，经东侧连接路）
        { pos: { x: 130,  y: 35,  z: -30  }, target: { x: 100, y: 5,  z: -40  }, label: '东侧教学楼群' },
        // 行政中心
        { pos: { x: 70,   y: 35,  z: 40   }, target: { x: 38,  y: 5,  z: 22   }, label: '行政中心' },
        // 返回南门
        { pos: { x: 0,    y: 55,  z: 155  }, target: { x: 0,   y: 0,  z: 125  }, label: '返回南门' },
    ];

    const total = waypoints.length - 1;
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
            if (onLabel) onLabel(`(${i + 1}/${total}) ${wp.label}`);
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
    if (onLabel) onLabel(`(1/${total}) ${waypoints[1].label}`);
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
