# TimerDisplay

TimerDisplay 是一个中文网页倒计时器，面向课堂、公开课、赛课、答辩和会议发言等现场投屏计时场景。应用为纯前端实现，可本地运行，也适合静态部署。

## 在线访问

生产环境：[https://timer-display.vercel.app](https://timer-display.vercel.app)

## 开源许可

本项目使用 MIT License 开源。

## 技术选型

- Vite + React + TypeScript：启动快，结构清晰，适合静态部署。
- 原生 CSS：减少样式运行依赖，便于后续调整大屏字号、颜色和布局。
- lucide-react：提供开始、暂停、重置、全屏、声音、提醒等图标。
- Web Audio API：不依赖音频文件，直接生成提示音。
- localStorage + Service Worker：保存上次设置，并在已访问后增强离线可用性。

## 安装和启动

```bash
npm install
npm run dev
```

构建静态文件：

```bash
npm run build
npm run preview
```

## 项目结构

```text
TimerDisplay/
├── public/
│   ├── favicon.svg
│   └── sw.js
├── src/
│   ├── components/
│   │   ├── FullscreenView.tsx
│   │   ├── ReminderConfig.tsx
│   │   ├── TimerControls.tsx
│   │   ├── TimerDisplay.tsx
│   │   └── TimerSettings.tsx
│   ├── utils/
│   │   ├── sound.ts
│   │   ├── storage.ts
│   │   └── time.ts
│   ├── App.css
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
├── TimerDisplay.md
├── CHANGELOG.md
├── LICENSE
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 主要功能

- 中文界面，第一屏直接进入计时器。
- 支持标题、小时/分钟/秒、自定义提醒节点、常用预设。
- 支持开始、暂停、继续、重置和大屏全屏显示。
- 默认在剩余 3 分钟变为黄色，剩余 1 分钟变为红色。
- 超时后默认继续正计时，并显示“已超时”。
- 提醒节点和超时节点只触发一次提示音，重置后清空触发状态。
- 支持空格开始/暂停/继续，`R` 重置，`F` 进入或退出全屏，`Esc` 退出全屏。
- 自动保存标题、总时长、提醒节点、提示音和超时设置，刷新后不会自动开始计时。

## 后续扩展建议

- 增加手机端远程控制页，用二维码连接大屏。
- 增加多选手/多环节计时模板。
- 增加计时记录导出，方便赛课或答辩留档。
- 增加自定义主题色和学校/活动名称展示。
