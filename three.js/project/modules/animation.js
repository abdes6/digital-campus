let activeTween = null;
let patrolStopped = false;
let patrolPaused = false;
let patrolSpeed = 1; // 速度倍率

export function setPatrolSpeed(speed) {
    patrolSpeed = speed;
}

export function stopPatrolAnimation() {
    patrolStopped = true;
    patrolPaused = false;
    if (activeTween) {
        activeTween.stop();
        activeTween = null;
    }
}

export function pausePatrolAnimation() {
    patrolPaused = true;
}

export function resumePatrolAnimation() {
    if (patrolPaused && activeTween) {
        patrolPaused = false;
    }
}

export function startPatrolAnimation(camera, controls, TWEEN, onLabel, onDone) {
    patrolStopped = false;
    patrolPaused = false;

    // 覆盖全校园的航点：位置 + 朝向目标 + 区域标签
    // 坐标系：Z+=南 Z-=北 X+=东 X-=西
    // 从南门开始向北巡游 - 正面视角，保持安全距离不穿建筑
    const waypoints = [
        // 1. 南门入口 - 俯视
        { pos: { x: -25,  y: 30,  z: 180  }, target: { x: 0,   y: 5,  z: 140 }, label: '南门入口' },
        // 2. 综合教学楼 - 俯视
        { pos: { x: -45,  y: 35,  z: 120  }, target: { x: 0,   y: 10, z: 90   }, label: '综合教学楼' },
        // 3. 致和园宿舍区 - 俯视
        { pos: { x: -130, y: 35,  z: 210  }, target: { x: -90, y: 8,  z: 177  }, label: '致和园宿舍区' },
        // 4. 贺田图书馆 - 俯视
        { pos: { x: -50,  y: 30,  z: 30   }, target: { x: 0,   y: 10, z: -20  }, label: '贺田图书馆' },
        // 5. 查济民大厦 - 俯视
        { pos: { x: 60,   y: 25,  z: 20   }, target: { x: 71,  y: 8,  z: -23  }, label: '查济民大厦' },
        // 6. 东侧教学楼群 - 俯视
        { pos: { x: 140,  y: 35,  z: -10  }, target: { x: 93,  y: 5,  z: -47  }, label: '东侧教学楼群' },
        // 7. 9-12号楼 - 俯视
        { pos: { x: -30,  y: 30,  z: -100 }, target: { x: 8,   y: 5,  z: -152 }, label: '9-12号楼' },
        // 8. 体育馆 & 操场 - 俯视
        { pos: { x: 60,   y: 40,  z: -165 }, target: { x: 95,  y: 0,  z: -200 }, label: '体育馆 & 操场' },
        // 9. 食堂 & 综合楼 - 俯视
        { pos: { x: 40,   y: 30,  z: -265 }, target: { x: 72,  y: 8,  z: -295 }, label: '食堂 & 综合楼' },
        // 10. 致勤楼群 - 俯视
        { pos: { x: 50,   y: 30,  z: -220 }, target: { x: 72,  y: 8,  z: -235 }, label: '致勤楼群' },
        // 11. 北部科研区 - 俯视
        { pos: { x: -130, y: 40,  z: -35  }, target: { x: -59, y: 5,  z: -67  }, label: '北部科研区' },
        // 12. 22-23号楼 - 俯视
        { pos: { x: -110, y: 30,  z: 35   }, target: { x: -74, y: 5,  z: 14   }, label: '22-23号楼' },
        // 13. 清乐园宿舍区 - 俯视
        { pos: { x: -190, y: 40,  z: -65  }, target: { x: -148, y: 10, z: -90 }, label: '清乐园宿舍区' },
        // 14. 校门 - 俯视
        { pos: { x: 90,   y: 25,  z: -55  }, target: { x: 48,  y: 3,  z: -110 }, label: '校门' },
        // 15. 返回南门 - 俯视
        { pos: { x: -25,  y: 30,  z: 180  }, target: { x: 0,   y: 5,  z: 140 }, label: '返回南门' },
    ];

    const total = waypoints.length - 1;
    const BASE_DURATION = 3000;

    // 创建每段动画
    const tweens = waypoints.slice(1).map((wp, i) => {
        const from = waypoints[i];
        
        // 根据距离计算时长
        const dist = Math.sqrt(
            Math.pow(wp.pos.x - from.pos.x, 2) +
            Math.pow(wp.pos.z - from.pos.z, 2)
        );
        const duration = Math.max(1500, Math.min(5000, dist * 20)) / patrolSpeed;
        
        const t = new TWEEN.Tween({
            px: from.pos.x, py: from.pos.y, pz: from.pos.z,
            tx: from.target.x, ty: from.target.y, tz: from.target.z
        }, TWEEN)
        .to({
            px: wp.pos.x, py: wp.pos.y, pz: wp.pos.z,
            tx: wp.target.x, ty: wp.target.y, tz: wp.target.z
        }, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onStart(() => {
            if (onLabel) onLabel(`(${i + 1}/${total}) ${wp.label}`);
        })
        .onUpdate((obj) => {
            if (patrolStopped || patrolPaused) return;
            camera.position.set(obj.px, obj.py, obj.pz);
            controls.target.set(obj.tx, obj.ty, obj.tz);
            controls.update();
        });
        return t;
    });

    // 连接所有动画
    for (let i = 0; i < tweens.length - 1; i++) {
        tweens[i].chain(tweens[i + 1]);
    }
    
    // 循环播放
    tweens[tweens.length - 1].onComplete(() => {
        if (!patrolStopped) {
            // 重新开始
            startPatrolAnimation(camera, controls, TWEEN, onLabel, onDone);
        } else if (onDone) {
            onDone();
        }
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
