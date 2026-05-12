import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';  
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
const scene =new THREE.Scene();
scene.background=new THREE.Color(0x000000); 
const camerta=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
camerta.position.set(10,10,15);
const renderer=new THREE.WebGLRenderer({antialias:true});//
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);
//轨道控制器
const controls=new OrbitControls(camerta,renderer.domElement);
//光源
const ambientLight=new THREE.AmbientLight(0xffffff,0.5);
const DirectionalLight=new THREE.DirectionalLight(0xffffff,0.8);
DirectionalLight.position.set(5,10,7);
scene.add(ambientLight,DirectionalLight);
//动画循环
function animate(){
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene,camerta);
}
animate();

/*方法一 生成圆弧顶点
const geometry = new THREE.BufferGeometry(); //创建一个几何体对象
const R = 100; //圆弧半径
const N = 50; //分段数量
const sp = 2 * Math.PI/2 / N;//两个相邻点间隔弧度
// 批量生成圆弧上的顶点数据
const arr = [];
for (let i = 0; i < N; i++) {
    const angle =  sp * i;//当前点弧度
    // 以坐标原点为中心，在XOY平面上生成圆弧上的顶点数据
    const x = R * Math.cos(angle);
    const y = R * Math.sin(angle);
    arr.push(x, y, 0);
}
//类型数组创建顶点数据
const vertices = new Float32Array(arr);

// 创建属性缓冲区对象
//3个为一组，表示一个顶点的xyz坐标
const attribue = new THREE.BufferAttribute(vertices, 3); 
// 设置几何体attributes属性的位置属性
geometry.attributes.position = attribue;

// 线材质
const material = new THREE.LineBasicMaterial({
    color: 0xff0000 //线条颜色
});
// 创建线模型对象   构造函数：Line、LineLoop、LineSegments
// const line = new THREE.Line(geometry, material); 
const line = new THREE.LineLoop(geometry, material);//线条模型对象
scene.add(line);

//方法二、生成圆弧顶点数据
//1、定义半径、分段数、相邻点的弧度、数组
//2、将坐标存放到数组中
const geometry = new THREE.BufferGeometry(); 
const R = 100; //圆弧半径
const N = 50; //分段数量
const sp = 2 * Math.PI / N;//两个相邻点间隔弧度
//const sp = 2 * Math.PI / N;//完整圆弧
//const sp = 1 * Math.PI / N;//半圆弧

//圆心坐标
//const cx = 200;
//const cy = 100;
// 批量生成圆弧上的顶点数据
const arr = [];
// N控制圆弧精度：就是创建多少个顶点
for (let i = 0; i < N; i++) {
    const angle =  sp * i;//当前点弧度
    // 以坐标原点为中心，在XOY平面上生成圆弧上的顶点数据
    //const x = cx+R * Math.cos(angle);
    //const y = cy+R * Math.sin(angle);
    const x = R * Math.cos(angle);
    const y = R * Math.sin(angle);
    arr.push(x, y, 0);//xyz坐标
}
const vertices = new Float32Array(arr);
const attribue = new THREE.BufferAttribute(vertices, 3); 
// 设置几何体attributes属性的位置属性
geometry.attributes.position = attribue;

// 线材质
const material = new THREE.LineBasicMaterial({
    color: 0xff0000 //线条颜色
});
// 创建线模型对象   构造函数：Line、LineLoop、LineSegments
// const line = new THREE.Line(geometry, material); 
const line = new THREE.LineLoop(geometry, material);//线条模型对象
scene.add(line);
*/

/*
setFromPoints方法提取向量坐标
1、定义三维向量
const pointsArr = [
    // 三维向量Vector3表示的坐标值
    new THREE.Vector3(0,0,0),
    new THREE.Vector3(0,100,0),
    new THREE.Vector3(0,100,100),
    new THREE.Vector3(0,0,100),
];
// 2、把数组pointsArr里面的坐标数据提取出来，
// 3、赋值给`geometry.attributes.position`属性
geometry.setFromPoints(pointsArr);
console.log('几何体变化',geometry.attributes.position);

const pointsArr = [
    // 三维向量Vector2表示的坐标值
    new THREE.Vector2(0,0),
    new THREE.Vector2(100,0),
    new THREE.Vector2(100,100),
    new THREE.Vector2(0,100),
];
geometry.setFromPoints(pointsArr);
console.log('几何体变化',geometry.attributes.position);
*/


/*椭圆 
// 1、创建一个形状为椭圆的曲线
// 参数1和2表示椭圆中心坐标  
// 参数3和4表示x和y方向半径
const arc = new THREE.EllipseCurve(0, 0, 100, 50);
//参数1和2表示椭圆中心坐标  参数3和4表示x和y方向半径
//const arc = new THREE.EllipseCurve(0, 0, 100, 50);

//参数1和2表示椭圆中心坐标  参数3和4表示x和y方向半径
//const arc = new THREE.EllipseCurve(0, 0, 50, 50);

//2、pointsArr存储椭圆上的坐标
//getPoints是基类Curve的方法，
// 平面曲线会返回一个vector2对象作为元素组成的数组，将椭圆细分为51个顶点
const pointsArr = arc.getPoints(50); //分段数50，返回51个顶点
console.log('曲线上获取坐标',pointsArr);

//3、创建一个空几何体，通过setFromPoints方法将坐标添加到空几何体的位置属性中
const geometry = new THREE.BufferGeometry();
geometry.setFromPoints(pointsArr);
//等间距取点
// geometry.getSpacedPoints(pointsArr);
console.log('geometry.attributes',geometry.attributes);

// 点模型查看顶点上的坐标
 点材质
const pointsmaterial = new THREE.PointsMaterial({
    color: 0xffff00,
    size: 10.0 //点对象像素尺寸
}); 
// 点模型
const points = new THREE.Points(geometry, pointsmaterial);
scene.add(points);

// 线材质
const linematerial = new THREE.LineBasicMaterial({
    color: 0x00fffff
});
// 线模型
const line = new THREE.Line(geometry, linematerial);
scene.add(line);


//圆弧线
//1、定义一条圆弧线
//参数：0, 0圆弧坐标原点x，y  100：圆弧半径    
// 0, 2 * Math.PI：圆弧起始角度
const arc = new THREE.ArcCurve(0, 0, 100, 0, 2 * Math.PI);
//默认false逆时针，true顺时针
//const arc = new THREE.ArcCurve(0, 0, 100, 0, Math.PI/2,false);

//2、曲线上取点，参数表示取点细分精度
const pointsArr = arc.getPoints(50); //分段数50，返回51个顶点
// const pointsArr = arc.getPoints(10);//取点数比较少，圆弧线不那么光滑

//3、空几何体的坐标属性
const geometry = new THREE.BufferGeometry();
geometry.setFromPoints(pointsArr);

//4、曲线与材质结合
// 线材质
const linematerial = new THREE.LineBasicMaterial({
    color: 0x00fffff
});
// 线模型
const line = new THREE.Line(geometry, linematerial);
scene.add(line);


//三维样条曲线
// 1、三维向量Vector3创建一组顶点坐标
const arr = [
    new THREE.Vector3(-50, 20, 90),
    new THREE.Vector3(-10, 40, 40),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(60, -60, 0),
    new THREE.Vector3(70, 0, 80)
]
// 2、利用数组中的三维向量创建三维样条曲线
const curve = new THREE.CatmullRomCurve3(arr);

//3、曲线上获取点
const pointsArr = curve.getPoints(100); 
const geometry = new THREE.BufferGeometry();

//4、读取坐标数据赋值给几何体顶点
geometry.setFromPoints(pointsArr); 

//5、线材质
const material = new THREE.LineBasicMaterial({
    color: 0x00fffff
});
// 线模型
const line = new THREE.Line(geometry, material);
scene.add(line);

// 用点模型可视化样条曲线经过的顶点位置
const geometry2 = new THREE.BufferGeometry();
geometry2.setFromPoints(arr);
const material2 = new THREE.PointsMaterial({
    color: 0xff00ff,
    size: 10,
});
//点模型对象
const points = new THREE.Points(geometry2, material2);
scene.add(points);

// 用点模型可视化样条曲线经过的顶点位置
const geometry2 = new THREE.BufferGeometry();
geometry2.setFromPoints(arr);
const material2 = new THREE.PointsMaterial({
    color: 0xff00ff,
    size: 10,
});
//点模型对象
const points = new THREE.Points(geometry2, material2);
scene.add(points);



//2D样条曲线
// 1、二维向量Vector2创建一组顶点坐标
const arr = [
    new THREE.Vector2(-100, 0),
    new THREE.Vector2(0, 30),
    new THREE.Vector2(100, 0),
];
// 2、二维样条曲线
const curve = new THREE.SplineCurve(arr);

//3、曲线上获取点
const pointsArr = curve.getPoints(100); 

//4、读取坐标数据赋值给几何体顶点
const geometry = new THREE.BufferGeometry();
geometry.setFromPoints(pointsArr); 

//5、线材质
const material = new THREE.LineBasicMaterial({
    color: 0x00fffff
});
// 线模型
const line = new THREE.Line(geometry, material);
scene.add(line);


//二维二次贝塞尔曲线
//1、创建点
// p1、p2、p3表示三个点坐标
// p1、p3是曲线起始点，p2是曲线的控制点
const p1 = new THREE.Vector2(-80, 0);
const p2 = new THREE.Vector2(20, 100);
const p3 = new THREE.Vector2(80, 0);

// 2、创建二维二次贝赛尔曲线
const curve = new THREE.QuadraticBezierCurve(p1, p2, p3);

//3、曲线上获取点
const pointsArr = curve.getPoints(100); 

//4、读取坐标数据赋值给几何体顶点
const geometry = new THREE.BufferGeometry();
geometry.setFromPoints(pointsArr); 

//5、线模型
const material = new THREE.LineBasicMaterial({color: 0x00fffff});
const line = new THREE.Line(geometry, material);
scene.add(line);

//查看顶点
const geometry2 = new THREE.BufferGeometry();
geometry2.setFromPoints([p1,p2,p3]);
const material2 = new THREE.PointsMaterial({
    color: 0xff00ff,
    size: 10,
});
//点模型对象
const points = new THREE.Points(geometry2, material2);
// 三个点构成的线条
const line2 = new THREE.Line(geometry2, new THREE.LineBasicMaterial());

const group = new THREE.Group(); // 创建一个组对象
group.add(line,points,line2); // 将线对象添加到组对象中
scene.add(points);
scene.add(line2);


//三维二次贝塞尔曲线
//1、创建点
const p1 = new THREE.Vector3(-80, 0, 0);
const p2 = new THREE.Vector3(20, 100, 0);
const p3 = new THREE.Vector3(80, 0, 100);

//2、创建线
const curve = new THREE.QuadraticBezierCurve3(p1, p2, p3);

//3、曲线上获取点
const pointsArr = curve.getPoints(100); 

//4、读取坐标数据赋值给几何体顶点
const geometry = new THREE.BufferGeometry();
geometry.setFromPoints(pointsArr); 

//5、线模型
const material = new THREE.LineBasicMaterial({color: 0x00fffff});
const line = new THREE.Line(geometry, material);
scene.add(line);
/* 二维三次贝赛尔曲线
// p1、p2、p3、p4表示4个点坐标
// p1、p4是曲线起始点，p2、p3是曲线的控制点
const p1 = new THREE.Vector2(-80, 0);
const p2 = new THREE.Vector2(-40, 50);
const p3 = new THREE.Vector2(50, 50);
const p4 = new THREE.Vector2(80, 0);

const curve = new THREE.CubicBezierCurve(p1, p2, p3, p4);

// 三维三次贝赛尔曲线
const p1 = new THREE.Vector3(-80, 0, 0);
const p2 = new THREE.Vector3(-40, 50, 0);
const p3 = new THREE.Vector3(50, 50, 0);
const p4 = new THREE.Vector3(80, 0, 100);

const curve = new THREE.CubicBezierCurve3(p1, p2, p3, p4);



//组合曲线CurvePath拼接曲线
//1、设定圆弧半径和直线高度
const R = 80;//圆弧半径
const H = 200;//直线部分高度

//2、创建直线和圆弧
// 直线1 参数是表示x,y坐标的二维向量
const line1 = new THREE.LineCurve(new THREE.Vector2(R, H), new THREE.Vector2(R, 0));
// 圆弧
const arc = new THREE.ArcCurve(0, 0, R, 0, Math.PI, true);
// 直线2 
const line2 = new THREE.LineCurve(new THREE.Vector2(-R, 0), new THREE.Vector2(-R, H));

//3、 CurvePath创建一个组合曲线对象
const CurvePath = new THREE.CurvePath();

//4、line1, arc, line2拼接出来一个U型轮廓曲线，注意顺序
CurvePath.curves.push(line1, arc, line2);

//5、组合曲线上获取点
//const pointsArr = CurvePath.getPoints(16); 
const pointsArr = CurvePath.getSpacedPoints(16); 

//6、读取坐标数据赋值给几何体顶点
const geometry = new THREE.BufferGeometry();
geometry.setFromPoints(pointsArr); 

//7、点模型
const material2 = new THREE.PointsMaterial({
    color: 0xff00ff,
    size: 10,
});
const points = new THREE.Points(geometry, material2);
scene.add(points);



// 曲线路径管道TubeGeometry
// 1、创建三维样条曲线
const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-50, 20, 90),
    new THREE.Vector3(-10, 40, 40),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(60, -60, 0),
    new THREE.Vector3(70, 0, 80)
]);

// LineCurve3创建直线段路径
const path = new THREE.LineCurve3(new THREE.Vector3(0, 100, 0), new THREE.Vector3(0, 0, 0));

// 1、p1、p2、p3表示三个点坐标
const p2 = new THREE.Vector3(-80, 0, 0);
const p3 = new THREE.Vector3(20, 100, 0);
const p4 = new THREE.Vector3(80, 0, 100);

//2、创建路径
//三维二次贝塞尔曲线
const curve = new THREE.QuadraticBezierCurve3(p2, p3, p4);

// 2、创建管道对象
// path:路径   40：沿着轨迹细分数  2：管道半径   25：管道截面圆细分数
const geometry = new THREE.TubeGeometry(curve, 40, 2, 25);

//3、管道模型
const material = new THREE.MeshLambertMaterial({
    side:THREE.DoubleSide,//双面显示看到管道内壁
});
const catmullRomCurve3=new THREE.Mesh(geometry,material);
scene.add(catmullRomCurve3);


//旋转成型LatheGeometry
// 1、Vector2表示的三个点坐标，三个点构成的轮廓相当于两端直线相连接
const pointsArr = [
    new THREE.Vector2(50, 60),
    new THREE.Vector2(25, 0),
    new THREE.Vector2(50, -60)
];

//2、创建一个LathGeometry对象
// LatheGeometry：pointsArr轮廓绕y轴旋转生成几何体曲面
// pointsArr：旋转几何体的旋转轮廓形状
// 30 旋转圆周方向几何体细分精度
//0, Math.PI：旋转的开始角度和结束角度
const geometry = new THREE.LatheGeometry(pointsArr, 30,0, Math.PI);

const material = new THREE.MeshBasicMaterial({color: 0x00fffff});
const latheGeometry=new THREE.Mesh(geometry,material);
scene.add(latheGeometry);
*/
// 通过三个点定义一个二维样条曲线
const curve = new THREE.SplineCurve([
    new THREE.Vector2(50, 60),
    new THREE.Vector2(25, 0),
    new THREE.Vector2(50, -60)
]);
//曲线上获取点,作为旋转几何体的旋转轮廓
const pointsArr = curve.getPoints(50); 
console.log('旋转轮廓数据',pointsArr);
// LatheGeometry：pointsArr轮廓绕y轴旋转生成几何体曲面
const geometry = new THREE.LatheGeometry(pointsArr, 30);
const material = new THREE.MeshBasicMaterial({color: 0x00fffff});
const latheGeometry=new THREE.Mesh(geometry,material);
scene.add(latheGeometry);
