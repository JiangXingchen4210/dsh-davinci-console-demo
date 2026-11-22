# dsh-davinci-console-demo · 使用手册（v0.14.0）

> 显示名：`dsh-davinci-console-demo`（DSH Web 侧边栏「插件 → dsh-davinci-console-demo」）
> npm 包名：`davinci-console-demo`（保持不变）
> 后端：DaVinci Resolve Studio **Patched 21.2**（`/Applications/DaVinci Resolve/DaVinci Resolve.app`）+ Resolve MCP
> 当前规模：**91 个 op**，全部可通过面板或「调试日志」追踪

---

## 一、这个插件能做什么

| 能力 | 说明 |
|---|---|
| 素材导入 | 批量导入桌面/文件夹素材，自动体检色彩管线 |
| 工程预检 | 项目设置、色彩科学、离线素材一次性列出；缺素材会**拦住**风格与渲染 |
| 还原 | 灰片判定 → 机型/曲线识别 → DaVinci 自带/官方 LUT 匹配；缺 LUT 时给官方页面 + 下载/上传 |
| 调色 | 三层 **15 节点**图（每节点一个工具），可逐节点说明作用 |
| 风格 | 10 个蒸馏风格（带出处），一键应用；风格是「还原之后」的处理，不绑死 LUT |
| 质感 | 黑柔/白柔（Fusion Glow）、颗粒记录、胶片模拟 LUT（按风格需要） |
| 剪辑 | 场景扫描、剧情转写（ASR）、按剧情剪辑、自动剪辑 |
| 局部 | 静态抠像（mask.cutout）、视频级抠像（可选，默认关闭）、面部跟踪（face.track）、遮罩校验（mask.verify）、透视跟踪 |
| 交付 | 选长宽/帧率/码率 → 生成方案 → **你点确认** 才渲染 |
| 调试 | 调试日志卡片 + `debug.log`，逐条中文说明「阶段/节点/工具/目的/参数」 |

---

## 二、三步上手

1. **素材交接**：填文件路径（每行一个）或选择 .cube 以外的素材文件 → 点「导入素材」。导入后插件自动做色彩管线体检。
2. **判断/匹配还原 LUT**：
   - 彩色素材 → 提示"已是彩色，无需还原"；
   - 灰片（LOG）→ 读元数据识别机型与曲线（如 `DJI RONIN 4D → DJI D-Log`）；
   - DaVinci LUT 库有同曲线 LUT：全部列出来，**由你选择**（不会替你挑机器）；
   - 库里没有：给厂商官方 LUT 页面，把官方直链粘进「官方 LUT 直链」→ 插件下载并装进 DaVinci；或「安装这个 .cube」上传本地文件。
3. **调色 / 风格 → 交付**：在标签页调色，或在「一键风格」选一个；然后到「交付」选长宽/帧率/码率 → 生成方案 → 确认渲染。

---

## 三、面板结构

顶部卡片（按工作流顺序）：
1. 使用指引（三步走）
2. 模式选择（剪辑 / 调色）
3. 素材交接、制作文档（剪辑模式）
4. 工程预检
5. 标签页内容
6. 还原
7. 一键风格
8. 交付（需你确认）
9. 调试日志

标签页：**调色 → 风格 → 氛围 → 效果 → 场景 → 效果库 → 管线**

---

## 四、还原（色彩管线）规则

判定顺序（不猜）：

1. **是不是灰片**：画面统计（动态范围 < 0.42 且饱和 < 0.22）→ 判定为未还原 LOG；
2. 是灰片才继续；
3. **元数据识别机型**（优先于文件名）：`DJI RONIN 4D`、`SONY`、`ARRI`、`Canon`、`Panasonic`、`Blackmagic`、`RED`；
4. 机型 → **曲线**（Ronin 4D=DJI D-Log、Venice=S-Log3、ALEXA=LogC3…）；
5. 按**曲线名**在 DaVinci LUT 库匹配（排除插件自己生成的 LUT）；
6. 同曲线多条 → 列给你选；库里没有 → 报「缺 LUT」+ 官方页面 + 下载/上传。

> 还原结果挂在 **1 号节点**，先于所有调色节点。

---

## 五、15 节点调色图

| # | 节点 | 工具 | 作用 |
|---|---|---|---|
| 01 | 输入/还原起点 | 输入 | 承接 LOG 还原 |
| 02 | 白平衡 | Gain | 统一偏色基准 |
| 03 | 曝光 | Offset | 统一曝光 |
| 04 | 对比/黑位统一 | 对比+黑位 | 拉齐不同镜头反差 |
| 05 | 曲线 | 自定义曲线 | 影调塑形 |
| 06 | 色相偏移 | 色相 | 整体小幅色相 |
| 07 | 饱和度 | 饱和度 | 整体饱和 |
| 08 | 分离色调·暗部 | 亮度限定器+色轮 | 暗部色彩分离 |
| 09 | 分离色调·高光 | 亮度限定器+色轮 | 高光色彩分离 |
| 10 | 肤色键·保护 | HSL 限定器 | 保护肤色 |
| 11 | 背景键·分离 | HSL 限定器 | 背景单独处理 |
| 12 | 肤色提亮 | HSL 限定器 | 只提肤色 |
| 13 | 背景冷色偏移 | HSL 限定器 | 背景冷色 |
| 14 | 风格 LUT | 风格 LUT | 仅在风格需要时挂官方 LUT |
| 15 | 质感（颗粒/光晕） | 质感记录 | 颗粒/柔光按风格需要 |

`grade.nodeReport` 会输出逐节点报告；未挂 LUT 的 14 号节点会被**明确标为无效**，不充数。

---

## 六、风格库（10 个，带出处）

青橙 / 漂白旁路 / 矩阵绿 / 银翼杀手 2049 / 夜魔侠暗黑 / 韦斯·安德森粉彩 / 月光蓝 / 疯狂麦克斯·铬版 / 教父琥珀 / 柯达 2383 胶片模拟。
每个风格记录：出处链接、使用的手法（分离色调/肤色键/颗粒/柔光/胶片 LUT）、配方参数。风格里**只有需要的才用 LUT/柔光**。

---

## 七、交付（必须你确认）

- 可填：宽、高、帧率、码率；
- 点「生成交付方案」→ 只返回方案，不渲染；
- 点「确认渲染」→ 才提交 Resolve 渲染；
- 预检不过（素材离线）会直接拒绝。

---

## 八、调试日志

- 面板底部「调试日志（插件正在做什么）」逐条显示：阶段 / 节点 / 工具 / 目的 / 参数；
- 与对话里我说的话一致；
- 可「清空日志」。

---

## 九、常见问题

| 现象 | 处理 |
|---|---|
| 面板白屏 | 先刷新；若仍白屏，把浏览器 Console 第一条报错发我 |
| 预检报离线素材 | 把丢失文件放回原位或告知新路径，重链后再渲染 |
| 还原后画面仍灰 | 检查是否点过「判断/匹配还原 LUT」并套用；调试日志会显示用了哪条 LUT |
| 没有对应曲线 LUT | 用官方页面下载后「安装这个 .cube」，或粘官方直链下载 |
| 风格点了没反应 | 预检未通过（离线素材）时会拦；或未选片段 |
| 渲染很慢 | 6K 素材 + 长时线属正常；可在交付里降低分辨率 |

---

## 十、op 速查（按类别）

- 工程：`preflight.check`、`pipeline.snapshot/diagnose/fix/oneClickFix`、`env.status/install/selftest`
- 素材：`media.import`、`docs.import/list/get`
- 还原：`restore.resolve`、`restore.apply`、`restore.download`、`camera.detect/list/fix`、`raw.apply`
- 调色：`grade.build3`、`grade.rebuildAll`、`grade.nodeReport`、`grade.tiers`、`cdl`、`look.*`
- 风格：`style.catalog`、`style.oneClick`、`style.list/apply`
- 质感：`texture.mist`
- 局部：`mask.cutout`、`mask.verify`、`face.track`、`face.grade`、`overlay.*`、`erase.*`
- 剪辑：`scenes.scan/group/unify`、`story.transcribe/plan`、`edit.story`、`edit.auto`
- 交付：`render.deliver`、`render.deliver`(confirm)、`preview.render/live/compare`
- 调试：`debug.log`、`debug.clear`、`ops.list`

---

## 十一、内置官方 LUT 支持库（v11 新增）

- **随插件打包**：`assets/luts/official/dji/`（14 个 DJI 官方 `.cube`）+ `assets/luts/official/library.json`（记录每个文件的 LOG 曲线与输出目标）。
- **安装到 DaVinci**：`lut.installBundle`（首次使用点一次即可，会把 14 条装进 DaVinci 的 LUT 库）。
- **查看清单**：`lut.library`（返回目录、注册数量、每个文件的 `log` 与 `target`）。
- **参与还原匹配**：还原判定时，内置库与 DaVinci 自带库、用户下载库一起按「曲线」匹配；`D-Log` 与 `D-Log M` 严格区分，不会互相顶替。
- **离线可用**：源文件在插件里，换机器不需要重新下载。

当前内置清单（DJI）：
| 文件 | 曲线 | 输出目标 |
|---|---|---|
| DJI Mavic 3 D-Log to Rec.709 V1 | D-Log | SDR (Rec.709) |
| DJI Mavic 3 D-Log to Rec.709 vivid V1 | D-Log | SDR (Rec.709) |
| DJI Mavic 4 Pro D-Log to Rec.709 V1 / vivid | D-Log | SDR (Rec.709) |
| DJI Mavic 3/4 Pro、Avata 2/360、Flip、Lito X1、Mini 4/5 Pro、O4 Air Unit 的 D-Log M 版 | D-Log M | SDR (Rec.709) |
| DJI_ZENMUSE_X9_DLog_To_Rec2020HLG | D-Log | **HDR (Rec.2020 HLG)**，SDR 交付不会默认选它 |

> 需要 X9 的 **SDR（Rec.709）** 版本时：把对应 `.cube` 放进 `assets/luts/official/dji/`（或用户 LUT 目录），重跑 `lut.installBundle` 即可。
