# 数字孪生校园交互系统

> 浙江树人学院 · 计算机图形学期中考试项目

基于 Three.js r179 构建的数字孪生校园三维交互系统，在浏览器中还原浙江树人学院校园全貌。场景包含 30+ 栋建筑（教学楼、宿舍、图书馆、体育馆、食堂等）、完整路网及绿化植被，支持视角切换、搜索导航、场景巡游、点击交互与实时编辑。

---

## 功能总览

### 三维场景
| 类别 | 数量 | 说明 |
|------|------|------|
| 建筑 | 30+ | Geometry 程序化生成 + GLB 模型加载（图书馆/体育馆/大门等，失败自动回落） |
| 道路 | 25+ 段 | 沥青路面配中心虚线标线 + 广场铺装带边框 |
| 植被 | 自动排布 | 行道树（沿道路/建筑边缘）、灌木簇、校园边界绿化 |

### 交互功能
- **视角控制** — OrbitControls 拖拽旋转 / 滚轮缩放 / 右键平移（带阻尼）
- **三视角切换** — 透视 / 鸟瞰 / 正面，Tween.js 平滑过渡
- **建筑搜索** — 输入名称实时过滤，点击结果自动飞往目标
- **点击拾取** — Raycaster 点击任意对象，高亮发光 + 脉冲动画 + 信息面板
- **建筑标签** — CSS2D 标签悬浮于建筑上方，一键显隐
- **图层控制** — 独立开关建筑 / 道路 / 植被三层显隐

### 场景巡游
- 15 个航点覆盖全校园，自动循环飞行
- 速度可调（0.5x–2.0x）
- 底部提示栏实时显示当前位置

### 对象编辑面板（lil-gui）
- 选中对象后可实时调整：位置 XYZ、旋转 Y、三轴缩放
- 道路可单独调节宽度 / 长度
- 一键打印坐标到控制台

### 渲染特性
- PCFSoft 软阴影、雾效（Fog）、抗锯齿
- CSS2DRenderer 叠加标签层
- 窗口自适应

---

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Three.js | r179 | 3D 渲染引擎 |
| Tween.js | @tweenjs/tween.js | 视角切换 / 巡游 / 脉冲动画 |
| OrbitControls | Three.js addons | 鼠标轨道控制 |
| GLTFLoader | Three.js addons | GLB 模型加载 |
| CSS2DRenderer | Three.js addons | 建筑文字标签 |
| lil-gui | Three.js addons | 对象位置调整面板 |
| 原生 HTML/CSS/JS | ES2020 | UI 结构与交互逻辑 |

---

## 项目结构

```
three.js/project/
├── index.html                 # 入口页面（import map + UI 结构）
├── index.js                   # 主入口：初始化、事件协调、渲染循环
├── styles/
│   └── main.css               # HUD、信息面板、图层控制样式
├── assets/
│   └── models/                # GLB 模型文件
│       ├── library.glb        # 贺田图书馆
│       ├── building.glb       # 通用建筑模板
│       ├── teaching building.glb
│       ├── mansion.glb        # 查济民大厦
│       ├── gym.glb            # 体育馆
│       ├── gate.glb           # 南门
│       └── school gate.glb    # 校门
└── modules/
    ├── scene.js               # 场景初始化、灯光、地面
    ├── camera.js              # 相机初始化 + 三视角切换
    ├── controls.js            # OrbitControls 配置
    ├── loader.js              # GLTFLoader Promise 封装
    ├── buildings.js           # 建筑生成（程序化 + GLB）
    ├── roads.js               # 道路网格 + 广场
    ├── vegetation.js          # 树木 + 灌木自动排布
    ├── animation.js           # 巡游动画 + 脉冲动画
    └── infoPanel.js           # 信息面板 DOM 操作
```

---

## 运行方式

项目使用 ES6 import map，**必须通过 HTTP 服务器访问**（`file://` 下 CORS 会阻止模块加载）。

```bash
# 在 three.js/ 上级目录（或项目根目录）启动本地服务器
python -m http.server 8080
```

浏览器访问：

```
http://localhost:8080/three.js/project/index.html
```

---

## 操作说明

| 操作 | 作用 |
|------|------|
| 鼠标左键拖拽 | 旋转视角 |
| 滚轮 | 缩放 |
| 鼠标右键拖拽 | 平移 |
| 点击建筑/道路/植被 | 显示信息 + 高亮 + 脉冲反馈 |
| 再次点击同一对象 | 取消高亮 |
| 点击空白处 | 取消高亮 + 关闭信息面板 |

---

## 系统架构

```
index.html
  └── index.js（主入口）
        ├── scene.js          → Scene + 灯光（环境光/方向光）+ 雾 + 地面
        ├── camera.js         → PerspectiveCamera + 三视角预设 + 平滑切换
        ├── controls.js       → OrbitControls（阻尼/缩放/平移/极角限制）
        ├── buildings.js      → 30+ 建筑（BoxGeometry + GLB）+ 用户数据
        ├── roads.js          → 分段路面 + 虚线标线 + 广场
        ├── vegetation.js     → 沿建筑/道路边缘自动排布树木灌木
        ├── animation.js      → 15 航点巡游 + 脉冲缩放 TWEEN 动画
        └── infoPanel.js      → 信息面板显示/隐藏
```

---

## 开发工具

本项目使用 **Claude Code**（Anthropic）辅助代码生成与调试。
