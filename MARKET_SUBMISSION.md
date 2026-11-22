# DSH 插件市场收录提交材料

## 一、基本信息

| 项 | 内容 |
|---|---|
| 插件名称 | davinci-console（dsh-davinci-console-demo） |
| npm 包名 | `davinci-console-demo` |
| 版本 | 0.14.1（DEMO） |
| 类型 | DSH Web 插件（bundle + client panel） |
| 平台 | macOS（`os: darwin`） |
| 许可证 | MIT |
| 仓库 | https://github.com/JiangXingchen4210/dsh-davinci-console-demo |
| npm | https://www.npmjs.com/package/davinci-console-demo |
| 体积 | 498 KB（89 files，解包 1.7 MB） |

### 一句话简介
在 DSH Web 面板里驱动本机 DaVinci Resolve Studio，完成「素材 → 灰片还原 → 三层 15 节点调色 → 风格 → 交付审批」的完整调色流程。

### 详细描述
插件通过 **Resolve MCP** 调用 DaVinci Resolve 的脚本 API，提供以下能力：工程预检、灰片（LOG）判定与官方 LUT 自动匹配/下载、三层 15 节点调色图（每节点单工具）、10 个带出处的一键风格、黑白柔质感、遮罩/跟踪/抠像、剧本导入与剧情剪辑、带用户确认的交付渲染，以及面板内实时中文调试日志。

> 当前为 **DEMO 版**：核心调色/还原/风格/交付链路可用；擦除（erase）等实验能力明确标注 DEMO 或禁用。

## 二、功能清单

| 模块 | 能力 |
|---|---|
| 工程预检 | 项目设置、色彩科学、离线素材一次体检；缺素材阻断风格与交付 |
| 还原 | 灰片判定（统计阈值）→ 元数据识别机型/曲线 → DaVinci 自带/官方 LUT 按曲线匹配；库中无 LUT 时给官方页面，支持官方直链下载安装（OPPO O-Log 已验证）或上传 `.cube`；D-Log 与 D-Log M 严格区分 |
| 调色 | 三层 15 节点（输入/白平衡/曝光/对比/曲线/色相/饱和/分离色调×2/肤色键/背景键/肤色提亮/背景冷色/风格 LUT/质感），`grade.nodeReport` 逐节点说明作用 |
| Vibe Color | `vibe.apply` 单入口：一句话目标 → 片段级 Input Color Space 审计/修正 → 基础三层校正 → 独立风格 LUT 节点 → 镜头亮度匹配；LUT 输入域先校验 |
| 风格库 | 10 个风格（青橙、漂白旁路、矩阵绿、银翼杀手 2049、夜魔侠暗黑、韦斯·安德森粉彩、月光蓝、疯狂麦克斯·铬版、教父琥珀、柯达 2383），每个带出处链接与手法清单；配方逐组写入并 `drx.parse` 读回校验（11/12 通过，色相字段解析器不暴露，如实标注） |
| 质感 | 黑柔/白柔（Fusion Glow）、颗粒意图、可选胶片模拟 LUT |
| 局部 | 抠像、面部跟踪、遮罩校验、透视跟踪；擦除 **DEMO/禁用** |
| 剪辑 | 场景扫描、剧情转写、按剧情剪辑、自动剪辑 |
| 交付 | 选择长宽/帧率/码率 → 生成方案 → **用户确认后才渲染** |
| 调试 | 面板「调试日志」+ `debug.log`，逐条中文显示阶段/节点/工具/目的/参数 |
| 依赖自检 | 启动时检测 Resolve MCP / ffmpeg / Resolve.app，缺失时顶部提示 |

## 三、依赖与权限说明

| 依赖 | 必需 | 说明 |
|---|---|---|
| macOS | ✅ | 使用 `osascript`/`sips` 与预编译助手（`bin/davinci-*`） |
| DaVinci Resolve Studio | ✅ | 建议 21.2；需可被 Resolve MCP 连接 |
| Resolve MCP | ✅ | 工具名 `resolve_*`，由 DSH 的 MCP 插件提供 |
| ffmpeg / ffprobe | ✅ | 分析、抽帧、导出 |

权限边界：
- 不监听网络端口，只在用户指令下用 `curl` 下载**厂商官方** LUT；
- 不替换/覆盖用户的原始素材文件；
- 渲染必须经过「交付方案 → 用户确认」两步；
- 不随包分发第三方 LUT（DJI/OPPO 等官方 LUT 由用户或官方直链获取），仅保留清单 `assets/luts/official/library.json`。

## 四、安装与验证

```bash
# 安装（市场或按包名）
plugin_manager install_bundle target=davinci-console-demo@0.14.1
# 或 npm
npm install davinci-console-demo@0.14.1
```

验证步骤：
1. 启动 DSH → 侧边栏打开「dsh-davinci-console-demo」；
2. 顶部应显示依赖自检结果（MCP / ffmpeg / Resolve.app）；
3. 素材交接导入素材 → 运行「工程预检」；
4. 「还原」→「判断/匹配还原 LUT」→ 选官方 LUT；
5. 「一键风格」选一个 → 查看「调试日志」逐条说明；
6. 「交付」生成方案 → 确认 → 渲染。

## 五、已知限制与免责

1. **仅 macOS**，Windows/Linux 调用会返回 `UNSUPPORTED_PLATFORM`；
2. **DEMO**：擦除功能未通过质量验证，源码中标记 DEMO/禁用；
3. 部分项目色彩设置（如 709-A、显示器色彩配置）无法通过脚本 API 写入，只能 GUI/手动；
4. DJI X9 的官方 LUT 无公开静态直链，需用户在官方下载页获取后通过「官方 LUT 直链/上传」导入；
5. 交付渲染耗时取决于素材分辨率/时长（6K 长时线会较慢）。

## 六、质量与测试

- 单元测试：`client_order`、`nodegraph`、`erase_plan`、`story_dialogue`、`camera`、`layers`、`grade3`、`editscore` 等（仓库内可直接跑）；
- 实测记录：ARRI/LogC3 与 DJI D-Log 还原、15 节点建图、风格配方读回校验、交付审批、离线素材阻断等；
- 抽帧验证素材（本地）：`A002_输出/考试三_还原15节点.jpg`、`考试三_青橙_修复后.jpg`、`韦斯粉彩_DJI官方LUT抽帧.jpg`。

## 七、提交清单

- [x] npm 包已发布（0.14.1，latest）
- [x] GitHub 仓库 + tag `v0.14.1`
- [x] README / USER_MANUAL / LICENSE
- [x] 依赖自检与平台守卫
- [x] 市场要求的截图/GIF：
  - `screenshots/panel-top.png`（面板总览：依赖自检/三步/预检）
  - `screenshots/panel-restore-style-delivery.png`（还原、10 个风格、交付参数与确认、调试日志）
  - `screenshots/result-teal-orange.jpg`（青橙效果抽帧）
  - `screenshots/panel-tour.gif`（动态演示）
- [x] 联系人/支持邮箱：2504836725@qq.com
