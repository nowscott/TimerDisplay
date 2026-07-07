# TimerDisplay

TimerDisplay 是一个中文网页现场计时工具，面向课堂、公开课、赛课、答辩和会议发言等现场投屏场景。应用为纯前端实现，可本地运行，也适合静态部署。

## 在线访问

生产环境：[https://timer-display.vercel.app](https://timer-display.vercel.app)

## 开源许可

本项目使用 MIT License 开源。

## 技术选型

- Vite + React + TypeScript：启动快，结构清晰，适合静态部署。
- 原生 CSS：减少样式运行依赖，便于后续调整大屏字号、颜色和布局。
- lucide-react：提供开始、暂停、重置、全屏、声音、提醒等图标。
- Web Audio API：不依赖音频文件，直接生成提示音。
- Screen Wake Lock API：在支持的浏览器中尽量保持屏幕常亮，降低投屏时自动息屏的风险。
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
│   │   ├── ModeDock.tsx
│   │   ├── ReminderConfig.tsx
│   │   ├── TimerControls.tsx
│   │   ├── TimerDisplay.tsx
│   │   ├── ProjectionChecklist.tsx
│   │   └── settings/
│   ├── hooks/
│   │   ├── useFullscreenMode.ts
│   │   ├── useTimerEngine.ts
│   │   ├── useTimerKeyboardShortcuts.ts
│   │   └── useWakeLock.ts
│   ├── utils/
│   │   ├── sound.ts
│   │   ├── storage.ts
│   │   ├── timerDefaults.ts
│   │   ├── timerPresentation.ts
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
- 普通页面采用顶部模式栏、中间主内容和底部配置栏结构，可在倒计时、正计时和时钟模式之间切换。
- 底部配置栏使用胶囊 dock 展示场景、基础、显示和提醒入口，具体配置通过浮窗调整。
- 默认标题为“现场计时”，支持自定义标题、小时/分钟/秒、自定义提醒节点和快捷时长。
- 支持演讲模式、课堂展示、答辩模式、会议发言、自由计时等场景预设，一次套用时长、提醒、超时和全屏显示设置。
- 倒计时和正计时支持开始、暂停、继续、运行中二次确认重置和大屏展示模式。
- 正计时模式从 `00:00` 开始累计，适合无固定结束时间的展示、讨论和活动记录。
- 时钟模式以当前时间为主视觉，显示日期、星期和标题，适合课间、会议间歇和投屏待机。
- 切换模式时会自动优化系统预设标题，例如“会议发言计时”切到时钟或正计时时会显示为“会议发言”；手动输入的自定义标题会保留。
- 大屏展示模式按模式显示倒计时、正计时或时钟；倒计时可在右上角弱显示真实时间，并可开启类似 iPhone 横屏 StandBy 计时器的全屏进度展示。
- 默认在剩余 3 分钟变为黄色，剩余 1 分钟和超时变为红色；大屏模式使用整屏背景色提醒。
- 普通模式展示剩余时间、已用时和总时长；超时后默认继续正计时，并以 `+00:00` 形式显示超时时长。
- 提醒节点和超时节点只触发一次提示音，重置后清空触发状态。
- 提醒节点支持设置为 `0分0秒`，此时该节点自动视为未启用。
- 提醒时间大于等于总时长时，会在设置区提示该节点不会触发。
- 支持空格开始/暂停/继续，`R` 重置，`F` 进入或退出全屏，`Esc` 退出全屏。
- 默认开启屏幕常亮请求，支持在“显示与计时”中查看状态、手动启用或关闭；浏览器不支持时仍需检查系统电源设置。
- 自动保存标题、总时长、提醒节点、提示音、超时、全屏真实时间、全屏进度条和屏幕常亮设置，刷新后不会自动开始计时。

## 后续扩展建议

- 增加手机端远程控制页，用二维码连接大屏。
- 增加多选手/多环节计时模板。
- 增加计时记录导出，方便赛课或答辩留档。
- 增加自定义主题色和学校/活动名称展示。
