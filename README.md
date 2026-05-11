# 数字孪生校园交互系统

> 本项目是浙江树人学院期中作业

基于 HTML + JavaScript + Three.js 构建的可在浏览器中运行的数字孪生校园三维交互系统，场景还原浙江树人学院校园主要建筑、道路与植被，支持多视角浏览、对象点击信息展示、图层切换与场景巡游动画。

---

## 功能介绍

### 三维场景对象（3类）
| 类型 | 内容 |
|------|------|
| 建筑 | 图书馆、教学楼A/B、行政楼、体育馆、学生宿舍（共6栋） |
| 道路 | 主干道（南北/东西）+ 支路，含中心虚线标线 |
| 植被 | 行道树、灌木丛、草坪散树 |

### 核心功能（3个）
1. **图文信息面板** — 点击任意建筑弹出右侧信息面板，展示建筑面积、楼层、建成年份及简介
2. **图层显示切换** — 左侧面板可独立控制建筑/道路/植被三类图层的显示与隐藏
3. **视角变换动画** — 透视、鸟瞰、正面三种预设视角，切换时带 Tween.js 平滑过渡动画

### 交互控制（3类）
- 鼠标左键拖拽旋转视角
- 滚轮缩放 / 右键平移
- 点击对象显示信息面板

### 加分功能
- **场景巡游**：点击"场景巡游"按钮，相机自动沿预设路径环绕校园飞行
- 点击建筑时触发脉冲缩放动画反馈
- 雾效 + 软阴影渲染，提升场景真实感

---

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Three.js | r179 | 3D 渲染引擎 |
| Tween.js | latest | 视角切换 / 巡游动画 |
| OrbitControls | Three.js addons | 鼠标交互控制 |
| GLTFLoader | Three.js addons | GLB/GLTF 模型加载 |
| 原生 HTML/CSS/JS | ES2020 | UI 面板与交互逻辑 |

---

## 项目结构

```
three.js/project/
├── index.html              # 入口页面（import map + UI 结构）
├── index.js                # 主场景：初始化、渲染循环、事件协调
├── styles/
│   └── main.css            # HUD、信息面板、图层控制样式
└── modules/
    ├── scene.js            # 场景、灯光、地面
    ├── camera.js           # 三视角定义 + Tween 切换
    ├── controls.js         # OrbitControls 配置
    ├── loader.js           # GLTFLoader 封装
    ├── buildings.js        # 建筑几何体 + 信息数据
    ├── roads.js            # 道路网格 + 标线
    ├── vegetation.js       # 树木 + 灌木
    ├── animation.js        # 巡游动画 + 脉冲动画
    └── infoPanel.js        # 信息面板 DOM 操作
```

---

## 运行方式

项目使用 ES6 import map，**必须通过 HTTP 服务器访问**，不能直接双击 HTML 文件。

```bash
# 在项目根目录启动本地服务器
python -m http.server 8080
```

然后在浏览器访问：

```
http://localhost:8080/three.js/project/index.html
```

---

## 系统架构

```
index.html
  └── index.js（主入口）
        ├── scene.js        → Three.js Scene + 灯光 + 地面
        ├── camera.js       → PerspectiveCamera + 视角预设
        ├── controls.js     → OrbitControls
        ├── buildings.js    → 建筑 Mesh + userData 信息
        ├── roads.js        → 道路 Mesh
        ├── vegetation.js   → 植被 Mesh
        ├── animation.js    → TWEEN 动画
        └── infoPanel.js    → DOM 信息面板
```

---

## 开发工具

本项目使用以下 AI 工具辅助开发：

- **Claude Code**（Anthropic）— 代码生成、模块设计、调试
- **Kiro**（AI 开发环境）— 项目结构规划、文件创建

---

## 分工情况

| 成员 | 负责内容 |
|------|----------|
| 成员一 | 场景搭建（建筑、道路、植被）、视角切换、README |
| 成员二 | 交互控制（点击拾取、信息面板）、图层切换、动画 |

> 每人至少 1 次 Git 提交，全组不少于 5 次提交记录。
