# 市场收录提交：邮件版 + Issue 版

## 一、邮件版

**收件人**：DSH 插件市场收录（请填官方邮箱）
**主题**：申请收录插件「dsh-davinci-console-demo（davinci-console-demo）v0.13.3」

**正文**：

您好，

我想申请将自研插件「dsh-davinci-console-demo」收录到 DSH 插件市场。

【基本信息】
- 插件名：davinci-console（dsh-davinci-console-demo）
- npm 包：davinci-console-demo@0.13.3（latest）
- 版本形态：0.13.3 DEMO
- 许可证：MIT
- 仓库：https://github.com/JiangXingchen4210/dsh-davinci-console-demo
- npm：https://www.npmjs.com/package/davinci-console-demo
- 平台：macOS
- 包体积：约 499 KB（89 files）

【功能概述】
插件在 DSH Web 面板中通过 Resolve MCP 驱动本机 DaVinci Resolve Studio，覆盖「素材 → 灰片还原 → 三层 15 节点调色 → 风格 → 交付」全流程：
1. 工程预检：项目设置、色彩科学、离线素材体检，缺素材阻断风格与交付；
2. 灰片还原：统计判定 + 元数据识别机型/曲线 + DaVinci 自带/官方 LUT 按曲线匹配；缺 LUT 时提供厂商官方页面并支持官方直链下载安装或本地 .cube 上传；
3. 调色：三层 15 节点（每节点单工具），并提供逐节点作用报告；
4. 风格库：10 个带出处的风格（青橙、漂白旁路、矩阵绿、银翼杀手 2049、夜魔侠、韦斯·安德森、月光蓝、疯狂麦克斯、教父、柯达 2383），配方逐组写入并读回校验；
5. 质感：黑柔/白柔（Fusion Glow）、颗粒意图、可选胶片模拟 LUT；
6. 局部：抠像、面部跟踪、遮罩校验、透视跟踪（擦除为 DEMO/禁用）；
7. 剪辑：场景扫描、剧情转写、按剧情剪辑；
8. 交付：选长宽/帧率/码率 → 生成方案 → 用户确认后才渲染；
9. 调试：面板内实时中文日志（阶段/节点/工具/目的/参数）；
10. 依赖自检：启动时检测 Resolve MCP / ffmpeg / Resolve.app，缺项顶部提示。

【依赖与权限】
- 必需：macOS、DaVinci Resolve Studio（建议 21.2）、Resolve MCP、ffmpeg/ffprobe；
- 插件不监听网络端口；仅在用户指令下用 curl 下载厂商官方 LUT；
- 不覆盖用户原始素材；渲染必须经用户确认；
- 不随包分发第三方 LUT（仅保留清单文件）。

【已知限制（DEMO）】
- 仅支持 macOS（其他平台返回 UNSUPPORTED_PLATFORM）；
- 擦除功能未通过质量验证，标记 DEMO/禁用；
- 部分项目色彩设置（709-A、显示器色彩配置）无法脚本写入，需 GUI 手动；
- DJI X9 官方 LUT 无公开静态直链，需用户从官方下载页获取后导入。

【截图】
- 面板总览：screenshots/panel-top.png
- 还原/风格/交付：screenshots/panel-restore-style-delivery.png
- 效果示例：screenshots/result-teal-orange.jpg
- 动态演示：screenshots/panel-tour.gif

【联系方式】
- 邮箱：2504836725@qq.com
- GitHub：https://github.com/JiangXingchen4210

如需补充材料（安装验证录像、权限说明文档、版本更新计划等），我可以随时提供。期待回复，谢谢！

---

## 二、GitHub Issue 版（可直接粘贴）

**标题**：`[市场收录] davinci-console-demo v0.13.3 — DaVinci Resolve 调色控制台（DEMO）`

**正文**：

### 插件信息
| 项 | 内容 |
|---|---|
| 名称 | davinci-console（dsh-davinci-console-demo） |
| npm | `davinci-console-demo@0.13.3` |
| 许可证 | MIT |
| 平台 | macOS |
| 仓库 | https://github.com/JiangXingchen4210/dsh-davinci-console-demo |
| 形态 | DEMO（擦除等功能标记禁用） |

### 简介
通过 Resolve MCP 驱动本机 DaVinci Resolve Studio，在 DSH 面板完成「素材 → 灰片还原 → 三层 15 节点调色 → 风格 → 交付」全流程。

### 核心能力
- 工程预检（项目设置/色彩科学/离线素材）
- 灰片判定 + 机型曲线识别 + 官方 LUT 匹配/下载/上传
- 三层 15 节点调色图 + 逐节点作用报告
- 10 个带出处的风格库（配方逐组读回校验）
- 黑柔/白柔、抠像、面部跟踪、遮罩校验、透视跟踪
- 场景扫描 / 剧情转写 / 按剧情剪辑
- 交付需用户确认（长宽/帧率/码率）
- 面板内实时中文调试日志 + 依赖自检

### 依赖
`在 macOS 上：DaVinci Resolve Studio + Resolve MCP + ffmpeg/ffprobe`

### 权限说明
不监听端口；只用 curl 下载厂商官方 LUT；不覆盖源素材；渲染需确认；不随包分发第三方 LUT。

### 安装验证
```bash
plugin_manager install_bundle target=davinci-console-demo@0.13.3
```
1. 打开侧边栏「达芬奇」面板
2. 确认顶部依赖自检（MCP/ffmpeg/Resolve.app）
3. 素材交接导入 → 工程预检 → 还原 → 一键风格 → 交付生成方案并确认

### 截图
- `screenshots/panel-top.png`
- `screenshots/panel-restore-style-delivery.png`
- `screenshots/result-teal-orange.jpg`
- `screenshots/panel-tour.gif`

### 已知限制
仅 macOS；擦除 DEMO；709-A/显示器配置需手动；DJI X9 LUT 需用户自行获取。

### 联系方式
邮箱：2504836725@qq.com
