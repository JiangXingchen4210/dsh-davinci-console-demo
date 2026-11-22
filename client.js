/**
 * DaVinci 控制面板 — 浏览器半边。
 *
 * 侧边栏一个入口 + 中央一块面板：调色（CDL / look / 版本 / 复制 / 清空）与
 * 效果（变换 / 裁剪 / 不透明度 / Fusion 模糊）。所有动作都通过 Host 的
 * POST /davinci-panel/action 转发到已配置的 Resolve MCP，这里不直接调用 Resolve。
 */

window.__ModuleLoader__.load({
  id: 'davinci-console-demo',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'davinci-panel'
    const PANEL_ID = 'davinci'

    const DICTIONARIES = {
      zh: {
        'panel': 'dsh-davinci-console-demo',
        'media.title': '素材交接（剪辑入口）',
        'media.hint': '把桌面/文件夹里的素材拖进来或填路径，插件会批量导入并自动体检色彩管线',
        'media.import': '导入素材',
        'preflight.title': '工程预检（项目设置 / 色彩管线 / 丢失素材）',
        'preflight.hint': '每次接活先跑预检：项目设置、色彩管线、离线素材都会列出来',
        'preflight.run': '运行预检',
        'restore.title': '还原（灰片 → 曲线 → 官方 LUT）',
        'restore.hint': '先判断是否灰片；是灰片才查机型/曲线；库里没有对应曲线就给出官方页面，由你决定下载/上传',
        'restore.resolve': '判断/匹配还原 LUT',
        'restore.apply': '套用还原 LUT',
        'restore.installLocal': '安装这个 .cube',
        'restore.download': '下载官方 LUT',
        'restore.ensure': '一键下载并安装官方 LUT',
        'restore.pathPlaceholder': '本机 .cube 路径（官方下载的 LUT）',
        'restore.urlPlaceholder': '官方 LUT 直链（.cube 或 .zip）',
        'track.title': '遮罩 / 跟踪',
        'track.hint': '面部跟踪（face.track）与遮罩校验（mask.verify）；抠像在上传 overlay 图时自动执行',
        'track.face': '面部跟踪',
        'track.verify': '遮罩校验',
        'adv.title': '高级工具（原有能力入口）',
        'adv.hint': '透视跟踪 / 场景分组统一 / 风格方案 / 三层图信息 / 柔光 / 自动剪辑——都在这里，没有被删',
        'debug.title': '调试日志（插件正在做什么）',
        'debug.hint': '逐条显示：阶段 / 节点 / 用了什么工具 / 目的 / 参数；与对话里的说明一致',
        'debug.clear': '清空日志',
        'deliver.title': '交付（需你确认）',
        'deliver.hint': '先选长宽/帧率/码率并生成方案；只有点「确认渲染」才会真正渲染',
        'deliver.plan': '生成交付方案',
        'deliver.confirm': '确认渲染',
        'pipeline.fixOneClick': '一键修复色彩管线',
        'help.title': '怎么用（三步走）',
        'help.open': '展开使用说明',
        'help.step1': '① 素材：在「素材交接」导入素材（或直接把文件路径填进去）。',
        'help.step2': '② 还原：点「判断/匹配还原 LUT」。是灰片才需要还原；库里有多条同曲线 LUT 时由你选；没有对应曲线时按提示去官网下载或上传。',
        'help.step3': '③ 调色/风格：在标签页做调色，或点「一键风格」；完成后到「交付」选长宽/帧率/码率 → 确认渲染。',
        panel: '达芬奇调色',
        'panel.short': '达芬奇',
        'header.hint': '通过已配置的 Resolve MCP 控制调色与效果',
        'runtime.running': 'Resolve 已连接',
        'runtime.stopped': 'Resolve 未运行',
        'runtime.unknown': '状态未知',
        'action.connect': '连接 / 刷新',
        'action.refresh': '刷新片段',
        'action.busy': '执行中…',
        'action.cancel': '取消',
        'tab.grade': '调色',
        'tab.effects': '效果',
        'label.project': '项目',
        'label.timeline': '时间线',
        'label.item': '片段',
        'label.nodes': '节点',
        'label.comps': 'Fusion',
        'label.version': '当前版本',
        'label.group': '调色组',
        'label.versions': '版本列表',
        'label.none': '—',
        'card.current': '当前片段',
        'card.current.empty': '把播放头停在时间线的片段上，然后点“刷新片段”。',
        'card.cdl': 'CDL 调色',
        'card.cdl.hint':
          '一组 CDL 写入 1 号节点（Lift=Offset、Gamma=Power、Gain=Slope）。应用会整体替换该节点的 CDL，面板不读取节点里已有的值。',
        'cdl.lift': '暗部 Lift',
        'cdl.gamma': '中间调 Gamma',
        'cdl.gain': '亮部 Gain',
        'cdl.saturation': '饱和度',
        'cdl.apply': '应用 CDL',
        'cdl.neutral': '恢复中性值',
        'card.looks': '调色预设',
        'card.looks.hint': '预设同样写入 1 号节点的 CDL；点一下立即套用。',
        'look.neutral': '还原中性',
        'look.warm': '暖阳',
        'look.cool': '冷调',
        'look.film': '胶片',
        'look.contrast': '高对比',
        'look.fade': '褪色',
        'look.bw': '黑白',
        'look.teal': '青橙',
        'card.versions': '调色版本',
        'version.name': '新版本名称',
        'version.save': '保存为版本',
        'version.load': '载入版本',
        'version.none': '暂无自定义版本',
        'card.copy': '复制调色',
        'card.copy.hint': '把当前片段的调色复制到目标片段，目标原有调色会被覆盖。',
        'copy.load': '读取 V1 片段',
        'copy.apply': '复制到目标',
        'copy.target': '目标片段',
        'copy.empty': '先点“读取 V1 片段”，再选一个目标片段。',
        'card.danger': '清空调色',
        'card.danger.hint': '清空该片段的全部节点调色，无法局部撤销。',
        'danger.apply': '清空调色',
        'danger.confirm': '确认清空（再次点击）',
        'card.transform': '变换',
        'card.transform.hint': 'Pan/Tilt 为画面平移，Zoom 为缩放倍数，Rotation 为角度。',
        'transform.pan': '水平 Pan',
        'transform.tilt': '垂直 Tilt',
        'transform.zoomx': '缩放 X',
        'transform.zoomy': '缩放 Y',
        'transform.rotation': '旋转',
        'transform.apply': '应用变换',
        'transform.reset': '归位',
        'card.crop': '裁剪',
        'crop.left': '左',
        'crop.right': '右',
        'crop.top': '上',
        'crop.bottom': '下',
        'crop.apply': '应用裁剪',
        'card.opacity': '不透明度',
        'opacity.value': '不透明度',
        'opacity.apply': '应用不透明度',
        'card.blur': 'Fusion 模糊',
        'card.blur.hint':
          '在片段上建一层 Fusion Blur（XBlurSize / YBlurSize）并接好 MediaIn → Blur → MediaOut。Fusion 的渲染结果随 Resolve 版本不同，请以成片帧为准。',
        'blur.size': '模糊强度',
        'blur.apply': '添加 / 更新模糊',
        'log.title': '最近操作',
        'log.empty': '还没有操作记录。',
        'log.raw': '查看最近一次返回',
        'state.error': '失败：',
        'tab.look': '深度匹配',
        'tab.pipeline': '色彩管线',
        'ref.title': '参考静帧',
        'ref.import': '导入参考',
        'ref.load': '读取参考列表',
        'ref.saved': '已存参考',
        'ref.none': '还没有参考静帧：导入一张你想匹配的画面（PNG/JPEG）。',
        'ref.hint': '参考静帧只在本地 ~/Documents/resolve-console/refs 保存，用于分析。',
        'look.target': '目标片段',
        'look.capture': '抓当前帧',
        'look.captureSource': '抓源帧（未调色）',
        'look.captureHint': '抓取播放头画面。源帧用于从零建立 look；源帧不可用时会自动降级为当前渲染帧。',
        'look.layersFound': '分层结果',
        'look.plan': '生成匹配方案',
        'look.planHint': '把参考静帧与目标帧逐层比较：全局 / 肤色 / 高光 / 背景 / 暗部 / 中性面（玻璃）。',
        'look.apply': '保存版本并应用分层调色',
        'look.resetFirst': '先清空该片段旧调色（旧调色已另存为版本）',
        'look.applied': '应用结果',
        'look.nodes': '节点数',
        'look.version': '新版本',
        'look.residual': '应用后残差（越小越接近参考）',
        'look.confidence': '置信',
        'look.noPlan': '还没有方案。',
        'look.layer.global': '全局',
        'look.layer.skin': '肤色',
        'look.layer.highlight': '高光/炫光',
        'look.layer.background': '背景',
        'look.layer.shadow': '暗部',
        'look.layer.neutral': '中性/玻璃',
        'look.mode': '落方式',
        'look.mode.drx': '多层 .drx（键控分层）',
        'look.mode.cdl': '降级：全局 CDL',
        'look.mode.failed': '失败',
        'look.fallback': '本机 Resolve 不渲染生成式 .drx，已自动降级为全局 CDL；分层方案仍在下方方案里。',
        'docs.title': '制作文档（剧本 / 分镜表 / 场记单）',
        'docs.hint': '粘贴文本，或贴文件路径，或选择文件（图片会 OCR、Excel 会读表）；导入后可在剪辑方案里作为依据。',
        'docs.pasteHint': '直接粘贴剧本/分镜/场记文本（支持“角色：台词”和场次标题）',
        'docs.pickFile': '选择文件…',
        'docs.script': '剧本',
        'docs.shotlist': '分镜表',
        'docs.continuity': '场记单',
        'docs.import': '导入文档',
        'docs.imported': '已导入',
        'docs.recent': '最近文档',
        'mode.title': '开始',
        'mode.hint': '先选一个方向：我要剪辑（丢素材给我）或 我要调色（成片已剪好）。选完再看下面的面板。',
        'mode.edit': '我要剪辑（丢素材给我）',
        'mode.grade': '我要调色（成片已剪好）',
        'mode.current': '当前模式',
        'mode.switch': '重新选择',
        'live.title': '实时预览（达芬奇当前画面）',
        'live.hint': '不离开面板直接看 Resolve 画面；分屏可对比「原素材 / 一级 / 二级 / 三级」。',
        'live.on': '实时预览',
        'live.compare': '分屏对比',
        'live.off': '停止',
        'live.source': '原素材',
        'live.L1': '一级后',
        'live.L2': '二级后',
        'live.L3': '三级后',
        'live.empty': '点「实时预览」开始取帧（Resolve 需打开且停在一个片段上）。',
        'lut.title': 'LUT 补齐',
        'lut.hint': '这台机器没有对应 LUT 时：内置风格/相机曲线会现场生成；也可给下载地址自动下载。',
        'lut.name': 'LUT 名称',
        'lut.ensure': '确保/下载',
        'lut.acquire': '安装并套用',
        'grade.rebuildAll': '按新想法重建整条调色图',
        'tex.mist': '黑白柔',
        'tex.blackMist': '黑柔',
        'tex.whiteMist': '白柔',
        'lut.pickFile': '选择 .cube',
        'lut.urlHint': '或粘贴下载地址（.cube）',
        'erase.lockTitle': '擦除（DEMO）',
        'erase.lockHint': '【DEMO · 未通过质量验证】大/小物体与干净板/遮罩跟随两套流程已搭好，但成片质量不达标（鬼影/伪影），正式交付请不要使用。',
        'erase.still': '取当前帧',
        'erase.stillHint': '先在 Resolve 里把播放头停到那一帧，再点「取当前帧」，在图上拖拽框选异物。',
        'erase.size': '大小',
        'erase.sizeAuto': '自动判断',
        'erase.sizeLarge': '大块物体（人/车/大件）',
        'erase.sizeSmall': '小型物体（钢丝/细线/小道具）',
        'erase.method': '擦除方式',
        'erase.methodAuto': '自动推荐',
        'erase.methodPlate': '干净板（plate）',
        'erase.methodFollow': '遮罩跟随（follow）',
        'erase.plan': '生成擦除方案',
        'erase.build': '按方案擦除',
        'erase.lock': '锁定异物',
        'cmd.title': '一句话控制台',
        'cmd.placeholder': '例如：这场戏太绿了 / 这素材是 S-Log3 吗，套上 LUT / 一共有几场戏 / 帮我把钢丝擦掉',
        'cmd.run': '理解',
        'cmd.runExecute': '理解并执行',
        'cmd.plan': '执行计划',
        'cmd.needs': '还需要',
        'cmd.executed': '已执行',
        'cmd.executedHint': '这是计划（未写入任何东西）。点“理解并执行”才会执行非破坏性动作。',
        'env.title': '环境自检 / 一键安装',
        'env.hint': '插件需要的工具都装在插件目录内（lib/.build），不污染系统。缺什么点一次就补。',
        'env.check': '检查环境',
        'env.install': '一键安装缺失项',
        'env.selftest': '语音识别自检',
        'env.ok': '全部就绪',
        'story.title': '剧情剪辑（台词 + 动作）',
        'story.hint': '先转写台词（离线 Vosk），再做运动分析，按「整句台词 + 动作停稳点」出剪辑方案，避免人物走到一半就切、台词前言不搭后语。',
        'story.transcribe': '转写台词',
        'story.plan': '出剪辑方案',
        'story.apply': '落地成时间线',
        'story.target': '目标时长(秒)',
        'story.empty': '还没有方案。先转写台词再出方案。',
        'story.script': '剧本（谁说了什么）',
        'story.edits': '剪辑点',
        'story.diag': '校验',
        'preview.title': '内嵌预览（不用切到 DaVinci）',
        'preview.render': '生成预览片',
        'preview.hint': '低码率 H.264 预览，直接在面板里播放；渲染完成后自动加载。',
        'preview.empty': '还没有预览片。',
        'export.title': '导出前检查（画幅/黑边）',
        'export.check': '检查画幅',
        'export.hint': '导出前必须先确认黑边处理方式：保留黑边 / 裁掉填满 / 做宽银幕遮幅。',
        'style.title': '风格 LUT（整条时间线统一 look）',
        'style.hint': '强颜色设计走 LUT（实测可靠）：赛博朋克=压黑+暗部青蓝+高光品红；青橙=商业片；漂白=低饱和高对比。整条时间线逐片段挂同一 LUT。',
        'style.apply': '套用',
        'style.allHint': '按当前时间线 V1 所有片段逐个套用（SetLUT 实测成功并可读回）',
        'cam.title': 'Camera Raw / 相机识别',
        'cam.detect': '识别相机',
        'cam.apply': '科学套用（自动选路径）',
        'cam.applyHint': '先识别机型与是否 LOG；是 LOG 且有内置曲线才套 LUT，否则改用 Resolve 的 CST/色彩管理。非 LOG 素材会拒绝套用。',
        'cam.log': '是否 LOG',
        'cam.conf': '置信度',
        'cam.path': '建议路径',
        'cam.unknown': '还没识别。',
        'tab.vibe': 'Vibe 三级',
        'tab.scenes': '场景/剪辑',
        'tab.fx': '静态抠像演示',
        'tab.videoAlpha': '视频抠像/合成',
        'vibe.title': 'Vibe 调色（三级 + 意图）',
        'vibe.hint': '用一句话说感觉，例如“我感觉有点太绿了”或“这个绿幕的绿色溢出好明显”。前者走一级去偏色，后者走二级绿色 qualifier 键控——面板会分别处理。',
        'vibe.placeholder': '例如：整体有点绿，肤色想更干净一点；高光别那么爆',
        'vibe.style': '风格',
        'vibe.build': '生成三级方案',
        'vibe.apply': '保存版本并应用三级调色',
        'vibe.plan': '方案（节点顺序 = 串联顺序）',
        'vibe.intents': '识别到的意图',
        'vibe.tiers': '层级说明',
        'vibe.empty': '还没有方案：先写一句话，再点“生成三级方案”。',
        'scenes.title': '场景识别',
        'scenes.hint': '自动读整条时间线（不需要移动播放头）：用 ffmpeg 检测镜头切点、抽取代表帧与客观指标。代表帧可直接给 AI 看图描述“这场在干什么”。',
        'scenes.scan': '扫描场景',
        'scenes.empty': '还没有扫描结果。',
        'scenes.count': '镜头数',
        'scenes.edit': '自动剪辑（按目标时长出 selects 时间线）',
        'scenes.editRun': '生成剪辑时间线',
        'scenes.target': '目标时长(秒)',
        'fx.title': '静态图片抠像 → 贴图（演示，非视频抠像）',
        'fx.hint': '静态单帧演示：上传一张图片做前景分割，输出 alpha PNG 再贴到片段；不做视频逐帧抠像，不代表视频级能力。视频级请用右侧「视频抠像/合成」页。',
        'fx.upload': '上传图片',
        'fx.cutout': '自动抠图',
        'fx.fromPlayhead': '抓播放头源帧',
        'fx.alphaPreview': '透明底预览（棋盘格 = 透明）',
        'fx.alphaPng': 'alpha PNG',
        'fx.overlayApply': '叠加到当前片段',
        'fx.overlayHint': '叠加使用当前播放头所在片段；先在时间线把播放头放到目标片段，再点此按钮。',
        'alpha.videoTitle': '① 带 alpha 通道的视频 → 合成',
        'alpha.videoHint': '导入 ProRes 4444 / PNG 序列等本身带 alpha 的视频，作为随时间播放的前景，叠到显式选中的 V1 目标片段同一时间点；保持时长/帧率/透明。',
        'alpha.composite': '导入并叠加',
        'alpha.upload': '上传 alpha 视频（≤20MB；大文件未完成，请用本机路径/媒体池）',
        'alpha.uploaded': '已上传：',
        'alpha.uploadTooBig': '文件超过 20MB 上传上限；请用媒体池或本机路径：',
        'alpha.cutoutTitle': '② 普通视频 → RVM 时域抠像 / 跟踪（深度遮挡暂不可用）',
        'alpha.cutoutHint': '从媒体池选源视频：RVM 时域抠像 + 跟踪框门限，生成 1920×1080 / 16-bit alpha / ProRes 4444 再叠到 V2。跟踪框用于 mask 空间门限，不是多目标实例分割；深度遮挡当前不可用（任何 depthOcclusion 请求会被拒绝），不要再按深度遮挡验收。',
        'alpha.sources': '读取媒体池',
        'alpha.refreshSources': '刷新源列表',
        'alpha.pickSource': '选择源视频',
        'alpha.pickAlphaClip': '从媒体池选择带 alpha 的视频（或填本机路径，不是上传）',
        'alpha.target': '目标片段（V1 显式选择）',
        'alpha.targetCard': '目标：显式选择 V1 片段（不跟播放头走）',
        'alpha.targetHint': '目标从 V1 片段列表选择，不会因为播放头停在 V2 alpha 上而变成 alpha.mov。',
        'alpha.targetPick': '选择 V1 目标片段',
        'alpha.targetsRefresh': '刷新目标列表',
        'alpha.targetsLoad': '读取 V1 目标',
        'alpha.visualLimits': '视觉边界：当前只是 2D 合成，没有接触阴影、没有光色匹配、没有真实前后遮挡；不能当电影视效成片。',
        'alpha.duration': '时长(s)',
        'alpha.fps': '采样fps',
        'alpha.cutout': '生成并叠加',
        'alpha.mode': '模式',
        'alpha.frames': '帧数',
        'alpha.noTracking': 'RVM 时域抠像 + 跟踪框门限；深度遮挡当前不可用（逐帧深度归一化不可比较）。',
        'alpha.previewAt': '预览帧',
        'alpha.previewSource': '预览源首帧',
        'feature.title': '功能开关：视频级抠像（可选）',
        'feature.hint': '默认关闭，关闭时「视频抠像/合成」界面完全隐藏。启用会创建本地 Python venv，安装 onnxruntime/numpy/opencv，并下载 RVM 时域抠像模型（深度遮挡当前不启用，不下载 Depth 模型）。',
        'feature.enable': '启用并自动安装',
        'feature.disable': '关闭并隐藏界面',
        'feature.status': '重新检测',
        'feature.on': '视频抠像已启用',
        'feature.off': '视频抠像未启用',
        'feature.hidden': '未启用：不显示视频抠像相关界面；不影响调色、剪辑和其他功能。',
        'alpha.boxHint': '在首帧上拖出一个框，框住要保留的主体；不拖框则自动取显著主体。',
        'alpha.boxReady': '主体框已选：生成时只保留框内跟踪主体。',
        'fx.eraseTitle': '擦除（钢丝/威亚/细异物）',
        'fx.eraseHint': '自动检测“细且位置稳定”的异常线并给出 delogo 矩形；渲染会生成一条干净片段并叠到 V2，原片段不动。',
        'fx.detect': '检测细线',
        'fx.render': '擦除并叠到 V2',
        'fx.candidates': '候选线',
        'fx.empty': '还没有结果。',
        'look.auto': '整条轨道自动匹配（同一参考）',
        'look.autoHint': '把播放头逐段定位、抓帧、与同一张参考静帧比较并应用；每个片段都会先存版本。多场戏用同一个参考，镜头之间才一致。',
        'look.autoArm': '确认：对整条轨道应用',
        'look.autoDone': '结果',
        'look.autoMatched': '成功',
        'look.autoFailed': '失败',
        'look.spread': '全局增益离散度',
        'pipe.title': '色彩管线体检',
        'pipe.diagnose': '体检',
        'pipe.fixAll': '修复全部可自动项',
        'pipe.fixOne': '修复此条',
        'pipe.hint': '读取系统 / Resolve 版本 / 项目色彩管理设置，诊断会导致预览与交付不一致的配置（含 macOS 709-A）。',
        'pipe.snapshot': '当前快照',
        'pipe.empty': '还没有体检结果，点“体检”。',
        'pipe.manual': '需人工处理',
        'pipe.auto': '可自动修复',
        'pipe.ok': '正常',
        'pipe.applied': '已写入',
        'pipe.failed': '写入失败',
        'pipe.severity.error': '错误',
        'pipe.severity.warn': '警告',
        'pipe.severity.info': '提示',
        'pipe.severity.ok': '正常',
        'pipe.platform': '平台',
        'pipe.resolve': 'Resolve',
        'pipe.science': '色彩科学',
        'pipe.timeline': '时间线空间',
        'pipe.output': '输出空间',
        'pipe.gamma': '输出 gamma',
        'pipe.current': '当前',
        'pipe.recommended': '建议',
      },
      en: {
        'panel': 'DaVinci Color Console',
        'media.title': 'Media hand-off',
        'media.hint': 'Drop files or paste paths; the plugin imports them and checks the color pipeline',
        'media.import': 'Import media',
        'preflight.title': 'Project preflight (settings / pipeline / missing media)',
        'preflight.hint': 'Run preflight first: project settings, color pipeline and offline media are listed',
        'preflight.run': 'Run preflight',
        'restore.title': 'Restore (flat → curve → official LUT)',
        'restore.hint': 'Checks whether the clip is flat, reads camera/curve from metadata, then offers official LUTs; you decide download/upload',
        'restore.resolve': 'Detect / match restore LUT',
        'restore.apply': 'Apply restore LUT',
        'restore.installLocal': 'Install this .cube',
        'restore.download': 'Download official LUT',
        'restore.ensure': 'Download & install official LUT',
        'restore.pathPlaceholder': 'Local .cube path (official LUT)',
        'restore.urlPlaceholder': 'Official LUT URL (.cube or .zip)',
        'track.title': 'Mask / tracking',
        'track.hint': 'Face tracking (face.track) and mask verification (mask.verify); cutout runs when you upload an overlay image',
        'track.face': 'Face tracking',
        'track.verify': 'Verify mask',
        'adv.title': 'Advanced tools',
        'adv.hint': 'Perspective tracking / scene grouping / look plans / tier info / diffusion / auto edit — nothing was removed',
        'debug.title': 'Debug log (what the plugin is doing)',
        'debug.hint': 'Stage / node / tool / purpose / params, same wording as the chat',
        'debug.clear': 'Clear log',
        'debug.feedback': 'Report a problem',
        'deliver.title': 'Delivery (needs your approval)',
        'deliver.hint': 'Pick size/fps/bitrate and generate a plan; rendering starts only after you confirm',
        'deliver.plan': 'Generate delivery plan',
        'deliver.confirm': 'Confirm render',
        'pipeline.fixOneClick': 'One-click pipeline fix',
        'help.title': 'How to use (3 steps)',
        'help.open': 'Show instructions',
        'help.step1': '1) Media: import clips in the Media hand-off card.',
        'help.step2': '2) Restore: click Detect / match restore LUT. Only flat clips need restore; you pick among same-curve LUTs; if none exist, use the official page to download/upload.',
        'help.step3': '3) Grade/style: work in the tabs or use one-click styles; then in Delivery pick size/fps/bitrate and confirm.',
        panel: 'DaVinci grading',
        'panel.short': 'DaVinci',
        'header.hint': 'Colour and effects through the configured Resolve MCP server',
        'runtime.running': 'Resolve connected',
        'runtime.stopped': 'Resolve not running',
        'runtime.unknown': 'Unknown',
        'action.connect': 'Connect / refresh',
        'action.refresh': 'Refresh clip',
        'action.busy': 'Working…',
        'action.cancel': 'Cancel',
        'tab.grade': 'Grade',
        'tab.effects': 'Effects',
        'label.project': 'Project',
        'label.timeline': 'Timeline',
        'label.item': 'Clip',
        'label.nodes': 'Nodes',
        'label.comps': 'Fusion',
        'label.version': 'Version',
        'label.group': 'Group',
        'label.versions': 'Versions',
        'label.none': '—',
        'card.current': 'Current clip',
        'card.current.empty': 'Park the playhead on a timeline clip, then press “Refresh clip”.',
        'card.cdl': 'CDL grade',
        'card.cdl.hint':
          'One CDL addressed to node 1 (Lift=Offset, Gamma=Power, Gain=Slope). Applying replaces that node’s CDL; the panel does not read back the existing one.',
        'cdl.lift': 'Lift',
        'cdl.gamma': 'Gamma',
        'cdl.gain': 'Gain',
        'cdl.saturation': 'Saturation',
        'cdl.apply': 'Apply CDL',
        'cdl.neutral': 'Back to neutral',
        'card.looks': 'Look presets',
        'card.looks.hint': 'Presets also write node 1’s CDL; one click applies.',
        'look.neutral': 'Neutral',
        'look.warm': 'Warm sun',
        'look.cool': 'Cool',
        'look.film': 'Film',
        'look.contrast': 'High contrast',
        'look.fade': 'Faded',
        'look.bw': 'Black and white',
        'look.teal': 'Teal and orange',
        'card.versions': 'Grade versions',
        'version.name': 'New version name',
        'version.save': 'Save as version',
        'version.load': 'Load version',
        'version.none': 'No custom versions yet',
        'card.copy': 'Copy grade',
        'card.copy.hint': 'Copy this clip’s grade onto a target clip; the target grade is replaced.',
        'copy.load': 'List V1 clips',
        'copy.apply': 'Copy to target',
        'copy.target': 'Target clip',
        'copy.empty': 'Press “List V1 clips” first, then pick a target.',
        'card.danger': 'Reset grade',
        'card.danger.hint': 'Wipes every node grade on this clip. Not partially undoable.',
        'danger.apply': 'Reset grade',
        'danger.confirm': 'Confirm reset (click again)',
        'card.transform': 'Transform',
        'card.transform.hint': 'Pan/Tilt move the frame, Zoom is a scale factor, Rotation is degrees.',
        'transform.pan': 'Pan',
        'transform.tilt': 'Tilt',
        'transform.zoomx': 'Zoom X',
        'transform.zoomy': 'Zoom Y',
        'transform.rotation': 'Rotation',
        'transform.apply': 'Apply transform',
        'transform.reset': 'Reset',
        'card.crop': 'Crop',
        'crop.left': 'Left',
        'crop.right': 'Right',
        'crop.top': 'Top',
        'crop.bottom': 'Bottom',
        'crop.apply': 'Apply crop',
        'card.opacity': 'Opacity',
        'opacity.value': 'Opacity',
        'opacity.apply': 'Apply opacity',
        'card.blur': 'Fusion blur',
        'card.blur.hint':
          'Builds a Fusion Blur (XBlurSize / YBlurSize) and wires MediaIn → Blur → MediaOut. Fusion render behaviour varies by Resolve build — judge by a rendered frame.',
        'blur.size': 'Blur size',
        'blur.apply': 'Add / update blur',
        'log.title': 'Recent actions',
        'log.empty': 'No actions yet.',
        'log.raw': 'Show last response',
        'state.error': 'Failed: ',
        'tab.look': 'Deep match',
        'tab.pipeline': 'Colour pipeline',
        'ref.title': 'Reference still',
        'ref.import': 'Import reference',
        'ref.load': 'List references',
        'ref.saved': 'Saved references',
        'ref.none': 'No reference yet — import the still you want to match (PNG/JPEG).',
        'ref.hint': 'References are stored locally under ~/Documents/resolve-console/refs for analysis only.',
        'look.target': 'Target clip',
        'look.capture': 'Capture current frame',
        'look.captureSource': 'Capture source frame (ungraded)',
        'look.captureHint': 'Grabs the playhead frame. The source frame builds a look from scratch; it falls back to the graded frame when unavailable.',
        'look.layersFound': 'Layered analysis',
        'look.plan': 'Build match plan',
        'look.planHint': 'Compares reference and target layer by layer: global / skin / highlight / background / shadow / neutral (glass).',
        'look.apply': 'Save version and apply layered grade',
        'look.resetFirst': 'Reset the clip grade first (old grade is kept as a version)',
        'look.applied': 'Apply result',
        'look.nodes': 'Nodes',
        'look.version': 'New version',
        'look.residual': 'Residual after apply (lower is closer)',
        'look.confidence': 'Confidence',
        'look.noPlan': 'No plan yet.',
        'look.layer.global': 'Global',
        'look.layer.skin': 'Skin',
        'look.layer.highlight': 'Highlights / glare',
        'look.layer.background': 'Background',
        'look.layer.shadow': 'Shadows',
        'look.layer.neutral': 'Neutral / glass',
        'look.mode': 'Apply mode',
        'look.mode.drx': 'Layered .drx (keyed)',
        'look.mode.cdl': 'Fallback: global CDL',
        'look.mode.failed': 'Failed',
        'look.fallback': 'This Resolve build ignores generated .drx, so the global CDL was applied instead; the layered plan is still shown above.',
        'docs.title': 'Production docs (script / shot list / continuity)',
        'docs.hint': 'Paste text, give a file path, or pick a file (images are OCRed, Excel sheets are parsed).',
        'docs.pasteHint': 'Paste script / shot list / continuity text',
        'docs.pickFile': 'Choose file…',
        'docs.script': 'Script',
        'docs.shotlist': 'Shot list',
        'docs.continuity': 'Continuity',
        'docs.import': 'Import doc',
        'docs.imported': 'Imported',
        'docs.recent': 'Recent docs',
        'mode.title': 'Start',
        'mode.hint': 'Pick one: I want to EDIT (hand me footage) or GRADE (the cut is done).',
        'mode.edit': 'I want to edit (hand me footage)',
        'mode.grade': 'I want to grade (cut is done)',
        'mode.current': 'Current mode',
        'mode.switch': 'Change',
        'live.title': 'Live preview (Resolve frame)',
        'live.hint': 'See Resolve without leaving the panel; split-compare source / L1 / L2 / L3.',
        'live.on': 'Live preview',
        'live.compare': 'Split compare',
        'live.off': 'Stop',
        'live.source': 'Source',
        'live.L1': 'After L1',
        'live.L2': 'After L2',
        'live.L3': 'After L3',
        'live.empty': 'Press Live preview to fetch frames (Resolve open on a clip).',
        'lut.title': 'LUT fill-in',
        'lut.hint': 'If the machine lacks the LUT: builtin looks/camera curves are generated locally, or give a URL to download.',
        'lut.name': 'LUT name',
        'lut.ensure': 'Ensure / download',
        'lut.acquire': 'Install & apply',
        'grade.rebuildAll': 'Rebuild whole grade',
        'tex.mist': 'Diffusion',
        'tex.blackMist': 'Black mist',
        'tex.whiteMist': 'White mist',
        'lut.pickFile': 'Pick .cube',
        'lut.urlHint': 'or paste a .cube URL',
        'erase.lockTitle': 'Erase (DEMO)',
        'erase.lockHint': 'Give a box (or point+size) to lock the anomaly; the plugin tracks it and decides static vs dynamic.',
        'erase.still': 'Capture frame',
        'erase.stillHint': 'Park the playhead on the frame in Resolve, press Capture frame, then drag a box on the image.',
        'erase.size': 'Size',
        'erase.sizeAuto': 'Auto',
        'erase.sizeLarge': 'Large (person/car/prop)',
        'erase.sizeSmall': 'Small (wire/string/small item)',
        'erase.method': 'Method',
        'erase.methodAuto': 'Auto',
        'erase.methodPlate': 'Clean plate',
        'erase.methodFollow': 'Mask follow',
        'erase.plan': 'Plan erase',
        'erase.build': 'Run erase',
        'erase.lock': 'Lock object',
        'cmd.title': 'One-line console',
        'cmd.placeholder': 'e.g. this scene is too green / is this S-Log3? apply the LUT / how many scenes are there / erase the wire',
        'cmd.run': 'Understand',
        'cmd.runExecute': 'Understand and run',
        'cmd.plan': 'Plan',
        'cmd.needs': 'Still needed',
        'cmd.executed': 'Executed',
        'cmd.executedHint': 'This is a plan — nothing written. “Understand and run” executes non-destructive steps.',
        'env.title': 'Environment',
        'env.hint': 'Tooling lives inside the plugin folder (lib/.build), never polluting the system.',
        'env.check': 'Check',
        'env.install': 'Install missing',
        'env.selftest': 'ASR self-test',
        'env.ok': 'all ready',
        'story.title': 'Story edit (dialogue + action)',
        'story.hint': 'Transcribe dialogue offline, analyse motion, then cut on whole sentences and settled action.',
        'story.transcribe': 'Transcribe',
        'story.plan': 'Plan',
        'story.apply': 'Build timeline',
        'story.target': 'Target (s)',
        'story.empty': 'No plan yet.',
        'story.script': 'Script',
        'story.edits': 'Cuts',
        'story.diag': 'Validation',
        'preview.title': 'Embedded preview',
        'preview.render': 'Render preview',
        'preview.hint': 'Low-bitrate H.264 played inside the panel.',
        'preview.empty': 'No preview yet.',
        'export.title': 'Export preflight (aspect)',
        'export.check': 'Check aspect',
        'export.hint': 'Decide black-bar handling before export: keep / crop / mask 2.39.',
        'style.title': 'Look LUT (whole timeline)',
        'style.hint': 'Strong colour design goes through a LUT (verified reliable): cyberpunk = crushed blacks + cyan shadows + magenta highlights.',
        'style.apply': 'Apply',
        'style.allHint': 'Applies to every clip on V1 of the current timeline',
        'cam.title': 'Camera Raw',
        'cam.detect': 'Detect camera',
        'cam.apply': 'Apply (auto path)',
        'cam.applyHint': 'Detect body and whether it is LOG; only LOG with a built-in curve gets a LUT, otherwise Resolve CST/colour management. Non-LOG media is refused.',
        'cam.log': 'Is LOG',
        'cam.conf': 'Confidence',
        'cam.path': 'Suggested path',
        'cam.unknown': 'Not detected yet.',
        'tab.vibe': 'Vibe tiers',
        'tab.scenes': 'Scenes/edit',
        'tab.fx': 'Static cutout demo',
        'tab.videoAlpha': 'Video alpha',
        'vibe.title': 'Vibe grading (three tiers + intent)',
        'vibe.hint': 'Say it in words, e.g. “it feels too green” or “the green spill from the screen is obvious”. The first is a primary cast fix; the second is a keyed green qualifier — handled differently.',
        'vibe.placeholder': 'e.g. overall a bit green, cleaner skin, less blown highlights',
        'vibe.style': 'Style',
        'vibe.build': 'Build three-tier plan',
        'vibe.apply': 'Save version and apply',
        'vibe.plan': 'Plan (node order = serial order)',
        'vibe.intents': 'Intents',
        'vibe.tiers': 'Tier notes',
        'vibe.empty': 'No plan yet — type a sentence, then build.',
        'scenes.title': 'Scene detection',
        'scenes.hint': 'Reads the whole timeline without moving the playhead: ffmpeg shot detection plus representative frames and objective metrics, ready for the model or your eyes.',
        'scenes.scan': 'Scan scenes',
        'scenes.empty': 'No scan yet.',
        'scenes.count': 'Shots',
        'scenes.edit': 'Auto edit (selects timeline by target duration)',
        'scenes.editRun': 'Build edit timeline',
        'scenes.target': 'Target seconds',
        'adv.title': '高级工具（原有能力入口）',
        'adv.hint': '透视跟踪 / 场景分组统一 / 风格方案 / 三层图信息 / 柔光 / 自动剪辑——都在这里，没有被删',
        'track.title': '遮罩 / 跟踪',
        'track.hint': '面部跟踪（face.track）与遮罩校验（mask.verify）；抠像在「上传 overlay」时自动执行',
        'track.face': '面部跟踪',
        'track.verify': '遮罩校验',
        'fx.title': 'Static image cutout → overlay (demo, NOT video compositing)',
        'fx.hint': 'Single still-image demo: one PNG/JPG/WebP → RGBA cutout, pasted as a still. This is NOT per-frame video compositing; use the Video alpha tab for video-level work.',
        'fx.upload': 'Upload image',
        'fx.cutout': '抠像',
        'fx.fromPlayhead': 'Cut out current source frame',
        'fx.alphaPreview': 'Alpha preview (checkerboard = transparent)',
        'fx.alphaPng': 'alpha PNG',
        'fx.overlayApply': 'Overlay on current clip',
        'fx.overlayHint': 'Overlays on the clip under the playhead; put the playhead on the target clip first.',
        'alpha.videoTitle': '① Alpha-channel video → composite',
        'alpha.videoHint': 'Imports a video that already has alpha (ProRes 4444 / PNG sequence) and lays it over the explicitly selected V1 target clip, preserving duration, fps and transparency.',
        'alpha.composite': 'Import and overlay',
        'alpha.upload': 'Upload alpha video (≤20MB; large upload not implemented, use local path/Media Pool)',
        'alpha.uploaded': 'Uploaded:',
        'alpha.uploadTooBig': 'File exceeds the 20MB upload limit; use Media Pool or a local path:',
        'alpha.cutoutTitle': '② Ordinary video → RVM temporal matte / tracking (depth occlusion unavailable)',
        'alpha.cutoutHint': 'RVM temporal matte + tracked box gate; writes 1920x1080 16-bit alpha ProRes 4444 to V2. The tracked box gates the mask, not a multi-instance subject segmentation. Depth occlusion is currently unavailable: any depthOcclusion request is rejected, so do not accept it by depth ordering.',
        'alpha.sources': 'Load Media Pool',
        'alpha.refreshSources': 'Refresh sources',
        'alpha.pickSource': 'Pick source clip',
        'alpha.pickAlphaClip': 'Pick an alpha video from the Media Pool (or type a path)',
        'alpha.target': 'Target (explicit V1 selection)',
        'alpha.targetCard': 'Target: explicit V1 clip (not playhead-driven)',
        'alpha.targetHint': 'Pick the target from V1; the playhead sitting on a V2 alpha clip cannot turn the target into alpha.mov.',
        'alpha.targetPick': 'Pick V1 target clip',
        'alpha.targetsRefresh': 'Refresh targets',
        'alpha.targetsLoad': 'Load V1 targets',
        'alpha.visualLimits': 'Visual limits: 2D composite only; no contact shadows, no light/color matching, no true occlusion. Not cinematic VFX delivery.',
        'alpha.duration': 'Duration (s)',
        'alpha.fps': 'Sample fps',
        'alpha.cutout': 'Generate and overlay',
        'alpha.mode': 'Mode',
        'alpha.frames': 'Frames',
        'alpha.noTracking': 'RVM temporal matte + tracked box gate; depth occlusion is unavailable.',
        'alpha.previewAt': 'Preview frame',
        'alpha.previewSource': 'Preview source frame',
        'feature.title': 'Optional feature: video matting',
        'feature.hint': 'Off by default; the Video alpha UI is hidden while off. Enabling creates a local Python venv, installs onnxruntime/numpy/opencv and downloads the RVM temporal matte model (depth model not downloaded; depth occlusion unavailable).',
        'feature.enable': 'Enable and auto-install',
        'feature.disable': 'Disable and hide UI',
        'feature.status': 'Re-check',
        'feature.on': 'Video matting enabled',
        'feature.off': 'Video matting disabled',
        'feature.hidden': 'Disabled: video-matting UI is hidden; grading, editing and other features are unaffected.',
        'alpha.boxHint': 'Drag a box around the subject on the first frame; without a box the salient subject is used.',
        'alpha.boxReady': 'Subject box selected: only the tracked subject inside it is kept.',
        'fx.eraseTitle': 'Erase (wires / rigging)',
        'fx.eraseHint': 'Detects thin, position-stable lines and returns delogo rectangles; rendering builds a clean clip and lays it on V2, leaving the original untouched.',
        'fx.detect': 'Detect lines',
        'fx.render': 'Erase to V2',
        'fx.candidates': 'Candidates',
        'fx.empty': 'No result yet.',
        'look.auto': 'Match the whole track (one reference)',
        'look.autoHint': 'Seeks each clip, captures, matches against the same reference and applies; every clip gets a version first. One reference keeps shots consistent.',
        'look.autoArm': 'Confirm: apply to the whole track',
        'look.autoDone': 'Result',
        'look.autoMatched': 'matched',
        'look.autoFailed': 'failed',
        'look.spread': 'Global gain spread',
        'pipe.title': 'Colour pipeline check',
        'pipe.diagnose': 'Run check',
        'pipe.fixAll': 'Fix all auto-fixable',
        'pipe.fixOne': 'Fix this',
        'pipe.hint': 'Reads platform, Resolve version and project colour management settings, and diagnoses the mismatches behind wrong previews and deliveries (including macOS 709-A).',
        'pipe.snapshot': 'Snapshot',
        'pipe.empty': 'No check yet — press “Run check”.',
        'pipe.manual': 'Needs a human',
        'pipe.auto': 'Auto-fixable',
        'pipe.ok': 'OK',
        'pipe.applied': 'Written',
        'pipe.failed': 'Write failed',
        'pipe.severity.error': 'Error',
        'pipe.severity.warn': 'Warning',
        'pipe.severity.info': 'Info',
        'pipe.severity.ok': 'OK',
        'pipe.platform': 'Platform',
        'pipe.resolve': 'Resolve',
        'pipe.science': 'Colour science',
        'pipe.timeline': 'Timeline space',
        'pipe.output': 'Output space',
        'pipe.gamma': 'Output gamma',
        'pipe.current': 'Current',
        'pipe.recommended': 'Recommended',
      },
    }

    // ------------------------------------------------------------------
    // 与 Host 通话
    // ------------------------------------------------------------------

    /** 相对路径按页面 baseURI 解析，宿主挂在子路径下也能命中。 */
    function apiPath(path) {
      const relative = path.replace(/^\/+/, '')
      if (typeof document === 'undefined') return `/${relative}`
      return new URL(relative, document.baseURI).pathname
    }

    const ENDPOINT = 'davinci-panel/action'

    async function request(op, args) {
      const response = await fetch(apiPath(ENDPOINT), {
        method: 'POST',
        cache: 'no-store',
        headers: { 'content-type': 'application/json', 'x-davinci-panel': '1' },
        body: JSON.stringify({ op, args: args ?? {} }),
      })
      const text = await response.text()
      let body
      try {
        body = text ? JSON.parse(text) : {}
      } catch {
        throw new Error(text || `HTTP ${response.status}`)
      }
      if (!response.ok) throw new Error(body?.error?.message ?? `HTTP ${response.status}`)
      if (body?.ok !== true) throw new Error(body?.error?.message ?? '面板调用失败')
      return body.value
    }

    // ------------------------------------------------------------------
    // 数值与状态小工具
    // ------------------------------------------------------------------

    function toNumber(raw, fallback) {
      const value = Number(raw)
      return Number.isFinite(value) ? value : fallback
    }

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value))
    }

    function firstNumber(value, fallback) {
      if (typeof value === 'number' && Number.isFinite(value)) return value
      if (typeof value === 'string') return toNumber(value, fallback)
      return fallback
    }

    /** 从 {ok, value} / {ok:false, error} 里取成功值。 */
    function okOf(section) {
      return section && section.ok ? section.value : null
    }

    /** Resolve 的零值有时是 0.0 有时是 1.0 的字符串，统一成数字。 */
    function num(value, fallback) {
      const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''))
      return Number.isFinite(parsed) ? parsed : fallback
    }

    function nowLabel() {
      const date = new Date()
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(
        date.getSeconds(),
      ).padStart(2, '0')}`
    }

    /**
     * MCP 的失败会带一整段 “Error: {…json…}” 文本；面板只显示里面的人话部分，
     * 完整返回仍可在“最近操作 → 查看最近一次返回”里展开。
     */
    function cleanMessage(input) {
      const text = typeof input === 'string' ? input : String(input ?? '')
      const trimmed = text.replace(/^Error:\s*/i, '').trim()
      if (!trimmed.startsWith('{')) return trimmed || text
      try {
        const parsed = JSON.parse(trimmed)
        const message = parsed?.error?.message ?? parsed?.message
        if (typeof message === 'string' && message) return message
        return trimmed
      } catch {
        return trimmed
      }
    }

    // ------------------------------------------------------------------
    // 样式：只用宿主主题 token
    // ------------------------------------------------------------------

    const S = {
      page: {
        height: '100%',
        overflowY: 'auto',
        background: 'var(--dsw-alias-bg-base)',
        color: 'var(--dsw-alias-label-primary)',
      },
      inner: {
        maxWidth: 960,
        margin: '0 auto',
        padding: '26px 28px 64px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      },
      header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 },
      title: { margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: 0.2 },
      subtitle: { marginTop: 5, fontSize: 12, color: 'var(--dsw-alias-label-secondary)' },
      toolbar: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
      pill: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        padding: '4px 10px',
        borderRadius: 999,
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-layer-1)',
        color: 'var(--dsw-alias-label-secondary)',
      },
      dot: (live) => ({
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: live ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-state-idle-primary)',
      }),
      tabs: { display: 'flex', gap: 4, borderBottom: '1px solid var(--dsw-alias-border-l1)' },
      tab: (active) => ({
        padding: '9px 16px',
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        fontFamily: 'inherit',
        color: active ? 'var(--dsw-alias-label-primary)' : 'var(--dsw-alias-label-secondary)',
        background: 'transparent',
        border: 'none',
        borderBottom: active ? '2px solid var(--dsw-alias-brand-primary)' : '2px solid transparent',
        cursor: 'pointer',
      }),
      card: {
        background: 'var(--dsw-alias-bg-layer-1)',
        border: '1px solid var(--dsw-alias-border-l1)',
        borderRadius: 10,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      },
      cardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
      cardTitle: { fontSize: 13, fontWeight: 600 },
      hint: { fontSize: 11.5, lineHeight: 1.55, color: 'var(--dsw-alias-label-secondary)' },
      metaGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '6px 18px' },
      metaRow: { display: 'flex', gap: 8, fontSize: 12, alignItems: 'baseline' },
      metaLabel: { color: 'var(--dsw-alias-label-secondary)', minWidth: 68 },
      metaValue: { wordBreak: 'break-all' },
      group: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '10px 12px',
        borderRadius: 8,
        background: 'var(--dsw-alias-bg-layer-2)',
      },
      groupTitle: { fontSize: 12, fontWeight: 600 },
      groupBody: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 },
      sliderRow: { display: 'flex', flexDirection: 'column', gap: 4 },
      sliderHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 },
      sliderLabel: { fontSize: 11, color: 'var(--dsw-alias-label-secondary)' },
      sliderValue: {
        fontSize: 11,
        color: 'var(--dsw-alias-label-secondary)',
        fontVariantNumeric: 'tabular-nums',
      },
      range: { width: '100%', margin: 0, accentColor: 'var(--dsw-alias-brand-primary)' },
      buttons: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
      looks: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 8 },
      input: {
        fontSize: 12.5,
        padding: '6px 9px',
        borderRadius: 7,
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-base)',
        color: 'var(--dsw-alias-label-primary)',
        fontFamily: 'inherit',
        minWidth: 0,
      },
      select: {
        fontSize: 12.5,
        padding: '6px 9px',
        borderRadius: 7,
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-base)',
        color: 'var(--dsw-alias-label-primary)',
        fontFamily: 'inherit',
        minWidth: 160,
        maxWidth: '100%',
      },
      error: {
        fontSize: 12,
        color: 'var(--dsw-alias-state-error-primary)',
        border: '1px solid var(--dsw-alias-state-error-primary)',
        borderRadius: 8,
        padding: '8px 10px',
        wordBreak: 'break-word',
      },
      logList: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11.5 },
      logRow: { display: 'flex', gap: 8, alignItems: 'baseline' },
      logTime: { color: 'var(--dsw-alias-label-secondary)', fontVariantNumeric: 'tabular-nums' },
      logOk: { color: 'var(--dsw-alias-state-success-primary)' },
      logFail: { color: 'var(--dsw-alias-state-error-primary)' },
      pre: {
        margin: 0,
        padding: 10,
        borderRadius: 8,
        background: 'var(--dsw-alias-bg-layer-2)',
        fontSize: 11,
        lineHeight: 1.5,
        maxHeight: 260,
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      },
    }

    function buttonStyle(variant, disabled) {
      const base = {
        fontSize: 12.5,
        padding: '6px 12px',
        borderRadius: 7,
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-layer-2)',
        color: 'var(--dsw-alias-label-primary)',
        fontFamily: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        whiteSpace: 'nowrap',
      }
      if (variant === 'primary') {
        // 不要用 brand-primary + 白字：这套主题里 brand-primary 本身就是浅色，白底白字看不见。
        // 用「正文色当底、基础底色当字」反色，亮/暗主题下都保证对比度。
        return {
          ...base,
          background: 'var(--dsw-alias-label-primary)',
          borderColor: 'var(--dsw-alias-label-primary)',
          color: 'var(--dsw-alias-bg-base)',
          fontWeight: 600,
        }
      }
      if (variant === 'danger') {
        return { ...base, color: 'var(--dsw-alias-state-error-primary)', borderColor: 'var(--dsw-alias-state-error-primary)' }
      }
      return base
    }

    function Button({ children, onClick, variant = 'secondary', disabled = false }) {
      return h('button', { type: 'button', onClick, disabled, style: buttonStyle(variant, disabled) }, children)
    }

    function Card({ title, extra, children }) {
      return h(
        'section',
        { style: S.card },
        h('div', { style: S.cardHead }, h('div', { style: S.cardTitle }, title), extra ?? null),
        children,
      )
    }

    function Slider({ label, value, min, max, step, onChange }) {
      return h(
        'div',
        { style: S.sliderRow },
        h(
          'div',
          { style: S.sliderHead },
          h('span', { style: S.sliderLabel }, label),
          h('span', { style: S.sliderValue }, formatValue(value, step)),
        ),
        h('input', {
          type: 'range',
          min,
          max,
          step,
          value: clamp(value, min, max),
          onChange: (event) => onChange(toNumber(event.target.value, value)),
          style: S.range,
        }),
      )
    }

    function formatValue(value, step) {
      if (!Number.isFinite(value)) return '—'
      const decimals = step >= 1 ? 0 : step >= 0.1 ? 1 : step >= 0.01 ? 2 : 3
      return value.toFixed(decimals)
    }

    function CdlGroup({ title, values, min, max, step, onChange }) {
      return h(
        'div',
        { style: S.group },
        h('div', { style: S.groupTitle }, title),
        h(
          'div',
          { style: S.groupBody },
          ['R', 'G', 'B'].map((channel, index) =>
            h(Slider, {
              key: channel,
              label: channel,
              value: values[index],
              min,
              max,
              step,
              onChange: (next) => {
                const copy = values.slice()
                copy[index] = next
                onChange(copy)
              },
            }),
          ),
        ),
      )
    }

    function displayText(value) {
      if (value === null || value === undefined || value === '') return '—'
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
      if (Array.isArray(value)) return value.map(displayText).join(' / ')
      if (typeof value === 'object') return value.versionName ?? value.name ?? pretty(value)
      return String(value)
    }

    function MetaRow({ label, value }) {
      return h(
        'div',
        { style: S.metaRow },
        h('span', { style: S.metaLabel }, label),
        h('span', { style: S.metaValue }, displayText(value)),
      )
    }

    function PanelIcon({ size = 18, active = false }) {
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          'aria-hidden': true,
          style: { display: 'block', opacity: active ? 1 : 0.82 },
        },
        h('circle', { cx: 12, cy: 12, r: 7.6, stroke: 'currentColor', strokeWidth: 1.6 }),
        h('path', { d: 'M12 4.4v3.4', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' }),
        h('path', { d: 'M18.6 15.9l-2.9-1.7', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' }),
        h('path', { d: 'M5.4 15.9l2.9-1.7', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' }),
        h('circle', { cx: 12, cy: 12, r: 2.2, fill: 'currentColor' }),
      )
    }

    const LOOKS = ['neutral', 'warm', 'cool', 'film', 'contrast', 'fade', 'bw', 'teal']

    function emptyCdl() {
      return {
        lift: [0, 0, 0],
        gamma: [1, 1, 1],
        gain: [1, 1, 1],
        saturation: 1,
      }
    }

    function DavinciPanel(props) {
      const t = typeof props?.t === 'function' ? props.t : (key) => key

      const [tab, setTab] = React.useState('grade')
      const [busy, setBusy] = React.useState(null)
      const [error, setError] = React.useState(null)
      const [entries, setEntries] = React.useState([])
      const [runtime, setRuntime] = React.useState(null)
      const [version, setVersion] = React.useState(null)
      const [project, setProject] = React.useState(null)
      const [timeline, setTimeline] = React.useState(null)
      const [item, setItem] = React.useState(null)
      const [state, setState] = React.useState(null)

      const [cdl, setCdl] = React.useState(emptyCdl)
      const [versionName, setVersionName] = React.useState('')
      const [selectedVersion, setSelectedVersion] = React.useState('')
      const [targets, setTargets] = React.useState([])
      const [targetId, setTargetId] = React.useState('')
      const [confirmToken, setConfirmToken] = React.useState('')
      const [transform, setTransform] = React.useState({
        Pan: 0,
        Tilt: 0,
        ZoomX: 1,
        ZoomY: 1,
        RotationAngle: 0,
      })
      const [crop, setCrop] = React.useState({ CropLeft: 0, CropRight: 0, CropTop: 0, CropBottom: 0 })
      const [opacity, setOpacity] = React.useState(100)
      const [blurSize, setBlurSize] = React.useState(10)
      const [refs, setRefs] = React.useState([])
      const [refPath, setRefPath] = React.useState('')
      const [refThumb, setRefThumb] = React.useState('')
      const [capture, setCapture] = React.useState(null)
      const [plan, setPlan] = React.useState(null)
      const [applyResult, setApplyResult] = React.useState(null)
      const [resetFirst, setResetFirst] = React.useState(false)
      const [pipeline, setPipeline] = React.useState(null)
      const fileInputRef = React.useRef(null)
      const overlayInputRef = React.useRef(null)
      const [autoArmed, setAutoArmed] = React.useState(false)
      const [autoResult, setAutoResult] = React.useState(null)
      const [vibeText, setVibeText] = React.useState('')
      const [vibeStyle, setVibeStyle] = React.useState('none')
      const [tierResult, setTierResult] = React.useState(null)
      const [sceneResult, setSceneResult] = React.useState(null)
      const [editResult, setEditResult] = React.useState(null)
      const [editSeconds, setEditSeconds] = React.useState(30)
      const [cutoutResult, setCutoutResult] = React.useState(null)
      const [overlayResult, setOverlayResult] = React.useState(null)
      const [alphaSources, setAlphaSources] = React.useState([])
      const [alphaVideoPath, setAlphaVideoPath] = React.useState('')
      const [alphaUploadName, setAlphaUploadName] = React.useState('')
      const [alphaVideoClipId, setAlphaVideoClipId] = React.useState('')
      const [videoSourceClipId, setVideoSourceClipId] = React.useState('')
      const [videoTargets, setVideoTargets] = React.useState([])
      const [videoTimelineName, setVideoTimelineName] = React.useState('')
      const [videoTargetId, setVideoTargetId] = React.useState('')
      const [videoCutoutDuration, setVideoCutoutDuration] = React.useState(2)
      const [videoCutoutFps, setVideoCutoutFps] = React.useState(24)
      const [alphaCompositeResult, setAlphaCompositeResult] = React.useState(null)
      const [videoCutoutResult, setVideoCutoutResult] = React.useState(null)
      const [sourcePreview, setSourcePreview] = React.useState(null)
      const [subjectBox, setSubjectBox] = React.useState(null)
      const [boxDrag, setBoxDrag] = React.useState(null)
      const alphaSourcesLoadedRef = React.useRef(false)
      const [features, setFeatures] = React.useState({ videoMatting: false })
      const [featureSteps, setFeatureSteps] = React.useState([])
      const featuresLoadedRef = React.useRef(false)
      const [trackResult, setTrackResult] = React.useState(null)
      const [eraseResult, setEraseResult] = React.useState(null)
      const [commandText, setCommandText] = React.useState('')
      const [commandResult, setCommandResult] = React.useState(null)
      const [cameraResult, setCameraResult] = React.useState(null)
      const [styleResult, setStyleResult] = React.useState(null)
      const [envResult, setEnvResult] = React.useState(null)
      const [storyResult, setStoryResult] = React.useState(null)
      const [storyPlan, setStoryPlan] = React.useState(null)
      const [previewResult, setPreviewResult] = React.useState(null)
      const [exportCheck, setExportCheck] = React.useState(null)
      const [storyTarget, setStoryTarget] = React.useState(40)
      const [mode, setMode] = React.useState(null)
      const [liveOn, setLiveOn] = React.useState(false)
      const [liveCompare, setLiveCompare] = React.useState(false)
      const [liveLeft, setLiveLeft] = React.useState('source')
      const [liveRight, setLiveRight] = React.useState('current')
      const [liveFrame, setLiveFrame] = React.useState({ left: null, right: null, stage: null, error: null })
      const [liveCaps, setLiveCaps] = React.useState(null)
      React.useEffect(() => {
        let alive = true
        request('preview.capabilities', {}).then((value) => { if (alive) setLiveCaps(value?.value ?? value ?? null) }).catch(() => {})
        return () => { alive = false }
      }, [])
      const [lutName, setLutName] = React.useState('godfather-look-s05')
      const [lutResult, setLutResult] = React.useState(null)
      const [lutFile, setLutFile] = React.useState(null)
      const [lockBox, setLockBox] = React.useState({ x: 820, y: 380, w: 220, h: 120 })
      const [lockResult, setLockResult] = React.useState(null)
      const [eraseSize, setEraseSize] = React.useState('auto')
      const [eraseMethod, setEraseMethod] = React.useState('auto')
      const [erasePlan, setErasePlan] = React.useState(null)
      const [mediaPaths, setMediaPaths] = React.useState('')
      const [mediaResult, setMediaResult] = React.useState(null)
      const [pipelineFixResult, setPipelineFixResult] = React.useState(null)
      const [preflight, setPreflight] = React.useState(null)
      const [styleList, setStyleList] = React.useState([])
      const [deliverPlan, setDeliverPlan] = React.useState(null)
      const [deliverWidth, setDeliverWidth] = React.useState(1920)
      const [deliverHeight, setDeliverHeight] = React.useState(1080)
      const [deliverFps, setDeliverFps] = React.useState(24)
      const [deliverBitrate, setDeliverBitrate] = React.useState(20)
      const [debugEntries, setDebugEntries] = React.useState([])
      const [deps, setDeps] = React.useState(null)
      const [restoreInfo, setRestoreInfo] = React.useState(null)
      const [restoreLutPath, setRestoreLutPath] = React.useState('')
      const [officialLutUrl, setOfficialLutUrl] = React.useState('')
      const debugSeqRef = React.useRef(0)
      const [docKind, setDocKind] = React.useState('script')
      const [docText, setDocText] = React.useState('')
      const [docPath, setDocPath] = React.useState('')
      const [docFile, setDocFile] = React.useState(null)
      const [docResult, setDocResult] = React.useState(null)
      const [docsList, setDocsList] = React.useState([])
      const [rebuildResult, setRebuildResult] = React.useState(null)
      const [mistStrength, setMistStrength] = React.useState(0.35)
      const [mistResult, setMistResult] = React.useState(null)
      const [lookPreset, setLookPreset] = React.useState('love-letter')
      const [lookStrength, setLookStrength] = React.useState(0.5)
      const [stillFrame, setStillFrame] = React.useState(null)
      const [stillDrag, setStillDrag] = React.useState(null)

      const itemId = item?.id ?? null

      const pushEntry = React.useCallback((entry) => {
        setEntries((current) => [{ id: `${Date.now()}-${Math.random()}`, at: nowLabel(), ...entry }, ...current].slice(0, 8))
      }, [])

      /** 所有 Host 动作都走这里：统一忙碌状态、日志与错误展示。 */
      const run = React.useCallback(
        async (op, args, label) => {
          setBusy(label)
          setError(null)
          try {
            const value = await request(op, args)
            // 业务失败也是失败：op 返回 ok:false 时不能在产品日志里打 ✓
            const failed = value?.ok === false || value?.success === false
            if (failed) {
              const rawError = typeof value?.error === 'string'
                ? value.error
                : value?.error?.message ?? value?.reason ?? value?.hint ?? '操作返回失败（ok/success=false）'
              pushEntry({ label, ok: false, value })
              setError(cleanMessage(String(rawError)))
              return value
            }
            pushEntry({ label, ok: true, value })
            return value
          } catch (cause) {
            const raw = cause instanceof Error ? cause.message : String(cause)
            const message = cleanMessage(raw)
            pushEntry({ label, ok: false, value: raw })
            setError(message)
            return null
          } finally {
            setBusy(null)
          }
        },
        [pushEntry],
      )

      const refreshRuntime = React.useCallback(async () => {
        const value = await run('status', {}, t('action.refresh'))
        if (value) setRuntime(value.runtime ?? null)
      }, [run, t])

      const refreshItem = React.useCallback(
        async ({ quiet } = {}) => {
          const value = await run('item', {}, quiet ? t('action.refresh') : t('action.refresh'))
          if (!value) return null
          setItem(value.current ?? null)
          setState(value.state ?? null)
          return value
        },
        [run, t],
      )

      const connect = React.useCallback(async () => {
        const value = await run('connect', {}, t('action.connect'))
        if (!value) return
        setRuntime(value.runtime ?? null)
        setVersion(value.version ?? null)
        setProject(value.project ?? null)
        const timelineValue = await run('timeline', {}, t('label.timeline'))
        if (timelineValue) setTimeline(timelineValue)
        await refreshItem()
      }, [run, refreshItem, t])

      React.useEffect(() => {
        void refreshRuntime()
      }, [refreshRuntime])

      // 片段状态读回来后同步各表单的当前值（Resolve 的读数可能是数字或字符串）。
      React.useEffect(() => {
        if (!state) return
        const transformValue = okOf(state.transform)
        if (transformValue) {
          setTransform({
            Pan: num(transformValue.Pan, 0),
            Tilt: num(transformValue.Tilt, 0),
            ZoomX: num(transformValue.ZoomX, 1),
            ZoomY: num(transformValue.ZoomY, 1),
            RotationAngle: num(transformValue.RotationAngle, 0),
          })
        }
        const cropValue = okOf(state.crop)
        if (cropValue) {
          setCrop({
            CropLeft: num(cropValue.CropLeft, 0),
            CropRight: num(cropValue.CropRight, 0),
            CropTop: num(cropValue.CropTop, 0),
            CropBottom: num(cropValue.CropBottom, 0),
          })
        }
        const compositeValue = okOf(state.composite)
        if (compositeValue) setOpacity(num(compositeValue.Opacity, 100))
      }, [state])

      const versions = React.useMemo(() => {
        const list = okOf(state?.versions)?.names
        return Array.isArray(list) ? list.filter((name) => typeof name === 'string') : []
      }, [state])

      React.useEffect(() => {
        if (selectedVersion || versions.length === 0) return
        setSelectedVersion(versions[versions.length - 1])
      }, [versions, selectedVersion])

      const working = busy !== null

      const loadRefs = React.useCallback(async () => {
        const value = await run('ref.list', {}, t('ref.load'))
        if (value) setRefs(Array.isArray(value.refs) ? value.refs : [])
      }, [run, t])

      const importRef = async (file) => {
        if (!file) return
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result ?? ''))
          reader.onerror = () => reject(new Error('读取文件失败'))
          reader.readAsDataURL(file)
        })
        const value = await run('ref.import', { dataUrl, name: file.name }, t('ref.import'))
        if (value) {
          setRefPath(value.path)
          setRefThumb(value.thumb ?? '')
          setPlan(null)
          setApplyResult(null)
          await loadRefs()
        }
      }

      const pickRef = (ref) => {
        setRefPath(ref.path)
        setRefThumb(ref.thumb ?? '')
        setPlan(null)
        setApplyResult(null)
      }

      const captureFrame = async (mode) => {
        const value = await run('look.capture', { mode, itemId }, mode === 'source' ? t('look.captureSource') : t('look.capture'))
        if (value) {
          setCapture(value)
          setPlan(null)
          setApplyResult(null)
        }
      }

      const buildPlan = async () => {
        if (!refPath || !capture) return
        const value = await run('look.plan', { referencePath: refPath, targetPath: capture.path }, t('look.plan'))
        if (value) {
          setPlan(value)
          setApplyResult(null)
        }
      }

      const applyLayeredLook = async () => {
        if (!plan || !itemId) return
        const value = await run(
          'look.apply',
          {
            itemId,
            plan,
            referencePath: refPath,
            targetStats: capture?.stats ?? null,
            resetFirst,
            saveVersion: true,
            verify: true,
          },
          t('look.apply'),
        )
        if (value) {
          setApplyResult(value)
          await refreshItem()
        }
      }

      const runAuto = async () => {
        if (!refPath) return
        const value = await run('look.auto', { referencePath: refPath, trackIndex: 1, limit: 12 }, t('look.auto'))
        setAutoResult(value)
        setAutoArmed(false)
        if (value) await refreshItem()
      }

      const buildTiers = async () => {
        const value = await run('grade.tiers', { itemId, vibeText, style: vibeStyle }, t('vibe.build'))
        if (value) setTierResult(value)
      }

      const applyTiers = async () => {
        const value = await run(
          'grade.tiers',
          { itemId, vibeText, style: vibeStyle, resetFirst: true },
          t('vibe.apply'),
        )
        if (value) {
          setTierResult(value)
          await refreshItem()
        }
      }

      const scanScenes = async () => {
        const value = await run('scenes.scan', { trackIndex: 1, thumbLimit: 8 }, t('scenes.scan'))
        if (value) setSceneResult(value)
      }

      const runEdit = async () => {
        const value = await run('edit.auto', { trackIndex: 1, targetDuration: editSeconds }, t('scenes.editRun'))
        if (value) setEditResult(value)
      }

      const pickOverlay = async (file) => {
        if (!file) return
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result ?? ''))
          reader.onerror = () => reject(new Error('读取文件失败'))
          reader.readAsDataURL(file)
        })
        const value = await run('mask.cutout', { dataUrl }, t('fx.cutout'))
        if (value?.ok !== false) setCutoutResult(value)
      }

      const mediaUrl = (filePath) => {
        if (!filePath) return ''
        if (typeof document === 'undefined') return `/davinci-panel/media?path=${encodeURIComponent(filePath)}`
        const url = new URL('davinci-panel/media', document.baseURI)
        url.searchParams.set('path', filePath)
        return url.href
      }

      const pickPlayheadCutout = async () => {
        const frame = await run('preview.live', { stage: 'source', width: 640 }, t('fx.fromPlayhead'))
        if (!frame?.path) return
        const value = await run('mask.cutout', { path: frame.path }, t('fx.cutout'))
        if (value?.ok !== false) { setCutoutResult(value); setOverlayResult(null) }
      }

      const applyOverlay = async () => {
        if (!cutoutResult?.outputPath) return
        const value = await run('overlay.quick', { itemId, pngPath: cutoutResult.outputPath }, t('fx.overlayApply'))
        if (value) setOverlayResult(value)
      }

      const loadAlphaSources = React.useCallback(async () => {
        const value = await run('alpha.sources', {}, t('alpha.sources'))
        if (value?.clips) setAlphaSources(value.clips)
      }, [run, t])

      const loadVideoTargets = React.useCallback(async () => {
        const value = await run('video.targets', {}, t('alpha.targetsLoad'))
        if (value?.ok === false) return
        const targets = Array.isArray(value?.targets) ? value.targets : []
        setVideoTargets(targets)
        if (value?.timeline?.name) setVideoTimelineName(value.timeline.name)
        setVideoTargetId((current) => {
          if (targets.some((entry) => entry.id === current)) return current
          if (targets.some((entry) => entry.id === itemId)) return itemId
          return targets[0]?.id ?? ''
        })
      }, [run, t, itemId])

      React.useEffect(() => {
        if (tab === 'videoAlpha' && features.videoMatting) void loadVideoTargets()
      }, [tab, features.videoMatting, loadVideoTargets])

      React.useEffect(() => {
        if (tab === 'videoAlpha' && !alphaSourcesLoadedRef.current) {
          alphaSourcesLoadedRef.current = true
          void loadAlphaSources()
        }
      }, [tab, loadAlphaSources])

      const loadFeatures = React.useCallback(async () => {
        const value = await run('features.get', {}, t('feature.status'))
        if (value?.ok !== false) setFeatures(value)
      }, [run, t])

      React.useEffect(() => {
        if (featuresLoadedRef.current) return
        featuresLoadedRef.current = true
        void loadFeatures()
      }, [loadFeatures])

      React.useEffect(() => {
        if (!features.videoMatting && tab === 'videoAlpha') setTab('grade')
      }, [features.videoMatting, tab])

      const enableVideoMatting = async () => {
        const value = await run('features.set', { videoMatting: true }, t('feature.enable'))
        if (value?.ok === false) { setFeatureSteps(value.steps ?? []); return }
        setFeatures({ videoMatting: true, runtime: value?.runtime ?? null })
        setFeatureSteps(value?.steps ?? [])
        alphaSourcesLoadedRef.current = false
        setTab('videoAlpha')
      }

      const disableVideoMatting = async () => {
        const value = await run('features.set', { videoMatting: false }, t('feature.disable'))
        if (value?.ok !== false) {
          setFeatures({ videoMatting: false })
          setFeatureSteps([])
          setTab('grade')
        }
      }

      const compositeAlphaVideo = async (upload) => {
        const payload = { targetItemId: videoTargetId }
        if (upload?.dataUrl) {
          payload.dataUrl = upload.dataUrl
          payload.fileName = upload.fileName ?? 'alpha-upload.mov'
        } else {
          if (!alphaVideoPath.trim()) return
          payload.filePath = alphaVideoPath.trim()
        }
        const value = await run('alpha.composite', payload, t('alpha.composite'))
        if (value) setAlphaCompositeResult(value)
      }

      const pickAlphaUpload = async (file) => {
        if (!file) return
        if (file.size > 20 * 1024 * 1024) {
          setError(`${t('alpha.uploadTooBig')} ${(file.size / 1024 / 1024).toFixed(1)}MB`)
          return
        }
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result ?? ''))
          reader.onerror = () => reject(new Error('读取文件失败'))
          reader.readAsDataURL(file)
        }).catch((cause) => { setError(String(cause?.message ?? cause)); return null })
        if (!dataUrl) return
        setAlphaUploadName(file.name)
        await compositeAlphaVideo({ dataUrl, fileName: file.name })
      }

      const runVideoCutout = async () => {
        if (!videoTargetId || !videoSourceClipId) return
        const value = await run('video.cutout', {
          sourceClipId: videoSourceClipId,
          targetItemId: videoTargetId,
          durationSec: Number(videoCutoutDuration) || 2,
          fps: Number(videoCutoutFps) || 24,
          maxFrames: Math.min(240, Math.max(2, Math.round((Number(videoCutoutDuration) || 2) * (Number(videoCutoutFps) || 24)))),
          // 不传 width：由 host 按目标时间线原生分辨率处理，避免 UI 又把 1920 缩回 960
          subjectBox: subjectBox || undefined,
        }, t('alpha.cutout'))
        if (value) setVideoCutoutResult(value)
      }

      const previewSource = async () => {
        if (!videoSourceClipId) return
        const value = await run('video.sourcePreview', { sourceClipId: videoSourceClipId, startSec: 0, width: 960 }, t('alpha.previewSource'))
        if (value?.ok !== false && value?.dataUrl) { setSourcePreview(value); setSubjectBox(null); setBoxDrag(null) }
      }

      const boxPoint = (event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        return {
          x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
          y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
        }
      }
      const onBoxDown = (event) => {
        if (!sourcePreview) return
        const point = boxPoint(event)
        setBoxDrag({ x0: point.x, y0: point.y, x1: point.x, y1: point.y })
      }
      const onBoxMove = (event) => {
        if (!boxDrag) return
        const point = boxPoint(event)
        setBoxDrag((drag) => (drag ? { ...drag, x1: point.x, y1: point.y } : drag))
      }
      const onBoxUp = () => {
        if (!boxDrag) return
        let x = Math.min(boxDrag.x0, boxDrag.x1)
        let y = Math.min(boxDrag.y0, boxDrag.y1)
        const w = Math.abs(boxDrag.x1 - boxDrag.x0)
        const h = Math.abs(boxDrag.y1 - boxDrag.y0)
        setBoxDrag(null)
        if (w > 0.01 && h > 0.01) {
          x = Math.min(x, Math.max(0, 1 - w))
          y = Math.min(y, Math.max(0, 1 - h))
          setSubjectBox({ x, y, w, h })
        }
      }

      const detectErase = async () => {
        const value = await run('erase.detect', { itemId }, t('fx.detect'))
        if (value) setEraseResult(value)
      }

      const renderErase = async () => {
        if (!eraseResult?.delogoBoxes?.length) return
        const value = await run(
          'erase.render',
          { itemId: eraseResult.itemId, boxes: eraseResult.delogoBoxes },
          t('fx.render'),
        )
        if (value) {
          setEraseResult((current) => ({ ...(current ?? {}), render: value }))
          await refreshItem()
        }
      }

      const applyMist = async (mode) => {
        const value = await run('texture.mist', { itemId, mode, strength: mistStrength }, mode === 'black' ? t('tex.blackMist') : t('tex.whiteMist'))
        if (value) setMistResult(value)
      }

      const rebuildAll = async () => {
        const value = await run('grade.rebuildAll', { lookPreset: lookPreset, lookStrength: lookStrength }, t('grade.rebuildAll'))
        if (value) setRebuildResult(value)
      }

      const acquireLut = async () => {
        const payload = { name: lutName, itemId }
        if (lutFile?.dataUrl) payload.dataUrl = lutFile.dataUrl
        else payload.lutName = lutName
        const value = await run('lut.acquire', payload, t('lut.acquire'))
        if (value) setLutResult(value)
      }

      const ensureLut = async () => {
        const value = await run('lut.ensure', { name: lutName }, t('lut.ensure'))
        if (value) setLutResult(value)
      }

      const captureStill = async () => {
        const value = await run('erase.still', { itemId }, t('erase.still'))
        if (value) { setStillFrame(value); setLockResult(null) }
      }

      const stillPoint = (event, frame) => {
        const rect = event.currentTarget.getBoundingClientRect()
        return {
          x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
          y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
        }
      }

      const onStillDown = (event) => {
        if (!stillFrame) return
        const point = stillPoint(event, stillFrame)
        setStillDrag({ x0: point.x, y0: point.y, x1: point.x, y1: point.y })
      }
      const onStillMove = (event) => {
        if (!stillDrag || !stillFrame) return
        const point = stillPoint(event, stillFrame)
        setStillDrag((drag) => (drag ? { ...drag, x1: point.x, y1: point.y } : drag))
      }
      const onStillUp = () => {
        if (!stillDrag || !stillFrame) return
        const x = Math.min(stillDrag.x0, stillDrag.x1) * stillFrame.width
        const y = Math.min(stillDrag.y0, stillDrag.y1) * stillFrame.height
        const w = Math.abs(stillDrag.x1 - stillDrag.x0) * stillFrame.width
        const h = Math.abs(stillDrag.y1 - stillDrag.y0) * stillFrame.height
        setStillDrag(null)
        if (w < 4 || h < 4) return
        const scale = stillFrame.scale ?? 1
        setLockBox({ x: Math.round(x * scale), y: Math.round(y * scale), w: Math.round(w * scale), h: Math.round(h * scale) })
      }

      React.useEffect(() => {
        let alive = true
        const pull = async () => {
          try {
            const value = await request('debug.log', { since: debugSeqRef.current })
            if (!alive || !value?.entries?.length) return
            debugSeqRef.current = value.lastSeq
            setDebugEntries((previous) => [...previous, ...value.entries].slice(-200))
          } catch { /* 日志拉取失败不打扰用户 */ }
        }
        pull()
        const timer = setInterval(pull, 1500)
        return () => { alive = false; clearInterval(timer) }
      }, [])

      const feedback = async () => {
        const value = await run('feedback.issue', { summary: '插件反馈', detail: '' }, '反馈/报错')
        if (value?.url) window.open(value.url, '_blank')
      }

      const clearDebug = async () => {
        await run('debug.clear', {}, '清空调试日志')
        debugSeqRef.current = 0
        setDebugEntries([])
      }

      const resolveRestore = async () => {
        const value = await run('restore.resolve', { itemId }, t('restore.resolve'))
        if (value) setRestoreInfo(value)
      }
      const applyRestoreLut = async (lutPath) => {
        const value = await run('restore.apply', { itemId, lutPath }, t('restore.apply'))
        if (value?.ok) setRestoreInfo((previous) => ({ ...(previous || {}), applied: lutPath }))
      }
      const ensureRestore = async () => {
        const value = await run('restore.ensure', { itemId }, t('restore.ensure'))
        if (value) setRestoreInfo((previous) => ({ ...(previous || {}), ensured: value }))
      }
      const downloadOfficialLut = async () => {
        const value = await run('restore.download', { url: officialLutUrl }, t('restore.download'))
        if (value) setRestoreInfo((previous) => ({ ...(previous || {}), downloaded: value.files ?? [] }))
      }
      const runPreflight = async () => {
        const value = await run('preflight.check', {}, t('preflight.run'))
        if (value) setPreflight(value)
      }
      const loadStyles = async () => {
        const value = await run('style.catalog', {}, 'styles')
        if (value?.styles) setStyleList(value.styles)
      }
      React.useEffect(() => {
        void loadStyles()
        void runPreflight()
        void (async () => { try { setDeps(await request('deps.check', {})) } catch { /* 忽略 */ } })()
      }, [])
      const applyStyleOneClick = async (preset) => {
        const value = await run('style.oneClick', { preset }, `风格 ${preset}`)
        if (value) setStyleResult(value)
      }
      const planDelivery = async () => {
        const value = await run('render.deliver', { width: deliverWidth, height: deliverHeight, fps: deliverFps, bitrateMbps: deliverBitrate }, '交付方案')
        if (value) setDeliverPlan(value)
      }
      const confirmDelivery = async () => {
        if (!deliverPlan?.confirmToken) return
        const value = await run('render.deliver', { confirmToken: deliverPlan.confirmToken, width: deliverWidth, height: deliverHeight, fps: deliverFps, bitrateMbps: deliverBitrate }, '确认渲染')
        if (value?.ok && value?.jobId) setDeliverPlan({ ...deliverPlan, confirmed: value, confirmError: null })
        else setDeliverPlan({ ...deliverPlan, confirmError: value?.error ?? '渲染未启动（后端未返回任务 ID）' })
      }
      const fixPipelineOneClick = async () => {
        const value = await run('pipeline.oneClickFix', {}, t('pipeline.fixOneClick'))
        if (value) setPipelineFixResult(value)
      }

      const importMedia = async () => {
        const paths = mediaPaths.split(/\n+/).map((line) => line.trim()).filter(Boolean)
        if (!paths.length) return
        const value = await run('media.import', { paths }, '导入素材')
        if (value) setMediaResult(value)
      }

      const importDoc = async () => {
        const payload = { kind: docKind }
        if (docFile?.dataUrl) payload.dataUrl = docFile.dataUrl
        else if (docPath.trim()) payload.path = docPath.trim()
        else if (docText.trim()) payload.text = docText
        else return
        const value = await run('docs.import', payload, t('docs.import'))
        if (value) {
          setDocResult(value.entry ?? value)
          const list = await run('docs.list', {}, 'docs')
          setDocsList((list?.items ?? list?.docs ?? list?.entries ?? []).slice(0, 8))
        }
      }

      const planEraseTarget = async () => {
        const value = await run('erase.plan', { itemId, box: lockBox, size: eraseSize, method: eraseMethod, durationSec: 6 }, t('erase.plan'))
        if (value) setErasePlan(value)
      }

      const buildErase = async () => {
        const value = await run('erase.build', { itemId, box: lockBox, size: eraseSize, method: eraseMethod }, t('erase.build'))
        if (value) setErasePlan((previous) => ({ ...(previous ?? {}), built: value }))
      }

      const lockErase = async () => {
        const offset = Number(stillFrame?.offsetSec ?? 0)
        const value = await run('erase.lock', {
          itemId,
          box: lockBox,
          frames: 8,
          rangeStartSec: Math.max(0, offset - 0.5),
          rangeEndSec: offset + 4,
        }, t('erase.lock'))
        if (value) setLockResult(value)
      }

      const runEnvCheck = async () => {
        const value = await run('env.status', {}, t('env.check'))
        if (value) setEnvResult(value)
      }

      const runEnvInstall = async () => {
        const missing = (envResult?.summary?.missing ?? []).filter((id) => id !== 'brew' && id !== 'swiftc' && id !== 'asr-swift')
        const value = await run('env.install', { items: missing.length ? missing : ['vision', 'vosk', 'asr-model'] }, t('env.install'))
        if (value) setEnvResult(value.environment ?? null)
      }

      const runAsrSelfTest = async () => {
        const value = await run('env.selftest', {}, t('env.selftest'))
        if (value) setEnvResult((current) => ({ ...(current ?? {}), selfTest: value }))
      }

      const transcribeStory = async () => {
        const value = await run('story.transcribe', { trackIndex: 1 }, t('story.transcribe'))
        if (value) setStoryResult(value)
      }

      const planStory = async () => {
        const value = await run('story.plan', { trackIndex: 1, targetDuration: Number(storyTarget) || 40 }, t('story.plan'))
        if (value) { setStoryPlan(value) }
      }

      const applyStory = async () => {
        const value = await run('edit.story', { plan: storyPlan }, t('story.apply'))
        if (value) setStoryPlan((current) => ({ ...(current ?? {}), applied: value }))
      }

      const checkExportAspect = async () => {
        const value = await run('export.check', { trackIndex: 1 }, t('export.check'))
        if (value) setExportCheck(value)
      }

      const applyStyleToTimeline = async (preset) => {
        const list = await run('items', {}, t('style.apply'))
        const items = list?.items ?? []
        if (items.length === 0) {
          setStyleResult({ error: 'V1 没有片段' })
          return
        }
        const results = []
        for (const entry of items) {
          const value = await run('style.apply', { preset, scope: 'item', itemId: entry.id }, `${preset} · ${entry.name ?? ''}`)
          results.push({ item: entry.name, ok: Boolean(value?.ok), lut: value?.lutReadback?.lut ?? null })
        }
        setStyleResult({ preset, total: items.length, ok: results.filter((entry) => entry.ok).length, results })
      }

      const runCommand = async (execute) => {
        if (!commandText.trim()) return
        const value = execute === true
          ? await run('vibe.apply', { text: commandText }, t('cmd.runExecute'))
          : await run('vibe.run', { text: commandText, itemId }, t('cmd.run'))
        if (value) setCommandResult(value)
      }

      const detectCameraInfo = async () => {
        const value = await run('camera.detect', { itemId }, t('cam.detect'))
        if (value) setCameraResult(value)
      }

      const applyRaw = async () => {
        const value = await run('raw.apply', { itemId }, t('cam.apply'))
        if (value) {
          setCameraResult((current) => ({ ...(current ?? {}), rawApply: value }))
          await refreshItem()
        }
      }

      const runDiagnose = async () => {
        const value = await run('pipeline.diagnose', {}, t('pipe.diagnose'))
        if (value) setPipeline(value)
      }

      const fixPipeline = async (ids) => {
        const value = await run('pipeline.fix', ids ? { ids } : {}, t('pipe.fixAll'))
        if (!value) return
        const again = await run('pipeline.diagnose', {}, t('pipe.diagnose'))
        setPipeline(again ? { ...again, fixResult: value } : { ...pipeline, fixResult: value })
      }

      React.useEffect(() => {
        if (tab === 'look') void loadRefs()
      }, [tab, loadRefs])

      const applyCdl = async () => {
        if (!itemId) return
        const value = await run(
          'cdl',
          { itemId, cdl: { Slope: cdl.gain, Offset: cdl.lift, Power: cdl.gamma, Saturation: cdl.saturation } },
          t('cdl.apply'),
        )
        if (value) await refreshItem()
      }

      const applyLook = async (look) => {
        if (!itemId) return
        const value = await run('look', { itemId, look }, t(`look.${look}`))
        if (value) await refreshItem()
      }

      const saveVersion = async () => {
        if (!itemId || !versionName.trim()) return
        const value = await run('version.save', { itemId, name: versionName.trim() }, t('version.save'))
        if (value) {
          setVersionName('')
          await refreshItem()
        }
      }

      const loadVersion = async () => {
        if (!itemId || !selectedVersion) return
        const value = await run('version.load', { itemId, name: selectedVersion }, t('version.load'))
        if (value) await refreshItem()
      }

      const listTargets = async () => {
        const value = await run('items', { trackIndex: 1 }, t('copy.load'))
        const list = Array.isArray(value?.items) ? value.items : []
        setTargets(list)
        const firstOther = list.find((entry) => entry.id && entry.id !== itemId)
        setTargetId(firstOther?.id ?? '')
      }

      const copyGrade = async () => {
        if (!itemId || !targetId) return
        const value = await run('grade.copy', { fromId: itemId, toId: targetId }, t('copy.apply'))
        if (value) setTargetId('')
      }

      const resetGrade = async () => {
        if (!itemId) return
        const args = { itemId }
        if (confirmToken) args.confirmToken = confirmToken
        const value = await run('grade.reset', args, t('danger.apply'))
        if (!value) return
        if (value.status === 'confirmation_required' && value.confirm_token) {
          setConfirmToken(value.confirm_token)
          return
        }
        setConfirmToken('')
        await refreshItem()
      }

      const applyTransform = async () => {
        if (!itemId) return
        const value = await run(
          'transform',
          {
            itemId,
            props: {
              Pan: transform.Pan,
              Tilt: transform.Tilt,
              ZoomX: transform.ZoomX,
              ZoomY: transform.ZoomY,
              RotationAngle: transform.RotationAngle,
            },
          },
          t('transform.apply'),
        )
        if (value) await refreshItem()
      }

      const resetTransform = () => setTransform({ Pan: 0, Tilt: 0, ZoomX: 1, ZoomY: 1, RotationAngle: 0 })

      const applyCrop = async () => {
        if (!itemId) return
        const value = await run('crop', { itemId, props: { ...crop } }, t('crop.apply'))
        if (value) await refreshItem()
      }

      const applyOpacity = async () => {
        if (!itemId) return
        const value = await run('composite', { itemId, props: { Opacity: opacity } }, t('opacity.apply'))
        if (value) await refreshItem()
      }

      const applyBlur = async () => {
        if (!itemId) return
        const value = await run('blur', { itemId, size: blurSize }, t('blur.apply'))
        if (value) await refreshItem()
      }

      const runtimeRunning = runtime?.running === true
      const runtimeKnown = runtime !== null && typeof runtime.running === 'boolean'

      const header = h(
        'header',
        { style: S.header },
        h(
          'div',
          null,
          h('h1', { style: S.title }, t('panel')),
          h('div', { style: S.subtitle }, t('header.hint')),
        ),
        h(
          'div',
          { style: S.toolbar },
          h(
            'span',
            { style: S.pill },
            h('span', { style: S.dot(runtimeRunning) }),
            runtimeKnown ? (runtimeRunning ? t('runtime.running') : t('runtime.stopped')) : t('runtime.unknown'),
          ),
          h(Button, { variant: 'primary', onClick: connect, disabled: working }, t('action.connect')),
          h(Button, { onClick: () => refreshItem(), disabled: working }, t('action.refresh')),
        ),
      )

      const visionDetail = commandResult?.results
        ? h(
            'div',
            { style: { ...S.hint, borderTop: '1px solid var(--dsw-alias-border)', paddingTop: 8, marginTop: 8 } },
            h('div', { style: S.hint }, `视觉模型：${commandResult.provider ?? '—'} / ${commandResult.model ?? '—'}；阶段：${commandResult.stage ?? '—'}；调用：${(commandResult.callOk ?? commandResult.ok) === true ? '成功' : '失败'}；完整验收：${commandResult.complete === true ? '通过' : '未通过'}${(commandResult.callOk ?? commandResult.ok) === true && commandResult.complete !== true ? '（部分完成 / 未通过）' : ''}`),
            ...(commandResult.results ?? []).map((row) =>
              h(
                'div',
                { key: row.itemId, style: S.hint },
                `${row.itemName ?? row.itemId} · 采样 ${(row.frames ?? []).map((frame) => `t=${frame.timeSec}s`).join(' / ') || '—'} · 复看 ${row.review?.verdict ?? (row.review?.skipped ? '未复看' : '失败')}${row.review?.confidence != null ? ` (${row.review.confidence})` : ''} · 模型置信 ${row.analysis?.overallConfidence ?? '—'} · 局部肤色 ${row.localCorrection?.requested ? '未完成' : '不需要'}`,
              ),
            ),
            commandResult.localRequested
              ? h('div', { style: S.error }, '模型建议局部肤色修正，但本轮没有安全执行；Vibe Color 不视为完整通过。')
              : null,
            (commandResult.unverifiedChecks ?? []).length
              ? h('div', { style: S.hint }, `未验收：${commandResult.unverifiedChecks.join('、')}（本轮没有可靠检测能力）`)
              : null,
            (commandResult.verdicts ?? []).map((row) =>
              h('div', { key: `${row.itemId}-v`, style: S.hint }, `复看结论 ${row.itemId}: ${row.verdict ?? '—'}${row.confidence != null ? ` / ${row.confidence}` : ''}`),
            ),
          )
        : null

      const commandBar = h(
        'section',
        {
          style: {
            ...S.card,
            border: '1px solid var(--dsw-alias-brand-primary)',
            background: 'var(--dsw-alias-bg-layer-1)',
          },
        },
        h('div', { style: S.cardTitle }, `${t('cmd.title')}（默认调用当前视觉模型；失败不回退词典）`),
        h('textarea', {
          value: commandText,
          placeholder: t('cmd.placeholder'),
          onChange: (event) => setCommandText(event.target.value),
          style: { ...S.input, width: '100%', minHeight: 52, resize: 'vertical', lineHeight: 1.5 },
        }),
        h(
          'div',
          { style: S.buttons },
          h(Button, { onClick: () => runCommand(false), disabled: working || !commandText.trim() }, t('cmd.run')),
          h(Button, { variant: 'primary', onClick: () => runCommand(true), disabled: working || !commandText.trim() }, t('cmd.runExecute')),
        ),
        commandResult
          ? h(
              'div',
              null,
              h('div', { style: S.hint }, `${t('cmd.plan')}: ${(commandResult.plan ?? []).map((entry) => entry.op).join(' → ') || '—'}`),
              commandResult.intents?.length
                ? h('div', { style: S.hint }, `intents: ${JSON.stringify(commandResult.intents)}`)
                : null,
              (commandResult.needs ?? []).length
                ? h('div', { style: S.hint }, `${t('cmd.needs')}: ${commandResult.needs.join('；')}`)
                : null,
              (commandResult.executed ?? []).length
                ? h(
                    'details',
                    null,
                    h('summary', { style: { ...S.hint, cursor: 'pointer' } }, t('cmd.executed')),
                    h('pre', { style: S.pre }, JSON.stringify(commandResult.executed, null, 2).slice(0, 2400)),
                  )
                : h('div', { style: S.hint }, t('cmd.executedHint')),
              visionDetail,
            )
          : null,
      )

      const depsBanner = deps && !deps.ok
        ? h('div', { style: S.error }, `环境未就绪：${(deps.hints ?? []).join('；')}`)
        : null

      const helpCard = h(
        Card,
        { title: t('help.title') },
        h('div', { style: S.hint }, t('help.step1')),
        h('div', { style: S.hint }, t('help.step2')),
        h('div', { style: S.hint }, t('help.step3')),
        h('div', { style: S.hint }, '提示：每个按钮跑完，最下方「调试日志」会逐条说明它做了什么；交付渲染必须由你在「交付」卡片点确认。'),
      )

      const mediaCard = h(
        Card,
        {
          title: t('media.title'),
          extra: h(Button, { variant: 'primary', onClick: importMedia, disabled: working }, t('media.import')),
        },
        h('div', { style: S.hint }, t('media.hint')),
        h('textarea', {
          value: mediaPaths,
          onChange: (event) => setMediaPaths(event.target.value),
          rows: 3,
          style: { ...S.input, width: '100%', fontFamily: 'inherit' },
          placeholder: '/Users/you/Desktop/素材文件夹\n或一条或多条 .mov / .mp4 路径（一行一个）',
        }),
        mediaResult
          ? h('div', { style: S.hint }, `已导入 ${mediaResult.importedCount ?? 0} 条素材${(mediaResult.clips ?? []).length ? '：' + mediaResult.clips.map((clip) => clip.name).slice(0, 5).join('、') : ''}${(mediaResult.missing ?? []).length ? '（不存在：' + mediaResult.missing.join('、') + '）' : ''}`)
          : null,
        mediaResult?.pipeline
          ? h('div', null,
              h('div', { style: S.hint }, `色彩管线：${mediaResult.pipeline.ok ? '正常' : `发现 ${mediaResult.pipeline.findings?.length ?? 0} 项问题`}（色彩科学 ${mediaResult.pipeline.science ?? '未知'}）`),
              ...(mediaResult.pipeline.findings ?? []).map((item) => h('div', { key: item.id, style: S.hint }, `· ${item.title}${item.fixable ? '（可自动修）' : '（需手动）'}`)),
              (mediaResult.pipeline.findings ?? []).length
                ? h(Button, { variant: 'primary', onClick: fixPipelineOneClick, disabled: working }, t('pipeline.fixOneClick'))
                : null,
            )
          : null,
        pipelineFixResult
          ? h('div', { style: S.hint }, `已修复：${(pipelineFixResult.applied ?? []).join('、') || '无'}；剩余：${(pipelineFixResult.remaining ?? []).map((item) => item.id).join('、') || '无'}`)
          : null,
      )

      const docsCard = h(
        Card,
        {
          title: t('docs.title'),
          extra: h(
            'div',
            { style: S.buttons },
            h('select', { value: docKind, onChange: (event) => setDocKind(event.target.value), style: S.select },
              [['script', t('docs.script')], ['shotlist', t('docs.shotlist')], ['continuity', t('docs.continuity')]].map(([value, label]) => h('option', { key: value, value }, label))),
            h(Button, { variant: 'primary', onClick: importDoc, disabled: working }, t('docs.import')),
          ),
        },
        h('div', { style: S.hint }, t('docs.hint')),
        h('textarea', {
          value: docText, rows: 4,
          onChange: (event) => setDocText(event.target.value),
          style: { ...S.input, width: '100%', fontFamily: 'inherit' },
          placeholder: t('docs.pasteHint'),
        }),
        h('div', { style: S.buttons },
          h('input', {
            value: docPath,
            onChange: (event) => setDocPath(event.target.value),
            style: { ...S.input, flex: 1 },
            placeholder: '/path/to/剧本.docx 或 分镜.xlsx 或 场记.jpg',
          }),
          h('label', { style: { ...S.buttons, cursor: 'pointer' } },
            docFile ? docFile.name : t('docs.pickFile'),
            h('input', {
              type: 'file',
              accept: '.txt,.md,.doc,.docx,.xlsx,.csv,.png,.jpg,.jpeg',
              style: { display: 'none' },
              onChange: (event) => {
                const file = event.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => setDocFile({ name: file.name, dataUrl: String(reader.result || '') })
                reader.readAsDataURL(file)
              },
            }),
          ),
        ),
        docResult
          ? h('div', { style: S.hint }, `${t('docs.imported')}：${docResult.summary ?? docResult.kind ?? ''}`)
          : null,
        docsList.length
          ? h('div', { style: S.hint }, `${t('docs.recent')}：${docsList.map((doc) => `${doc.kind}:${doc.summary ?? doc.id}`).join(' · ')}`)
          : null,
      )

      const preflightCard = h(
        Card,
        {
          title: t('preflight.title'),
          extra: h(Button, { onClick: runPreflight, disabled: working }, t('preflight.run')),
        },
        preflight
          ? h('div', null,
              h('div', { style: S.hint }, `${preflight.project?.name ?? ''} · ${preflight.project?.science ?? ''} · ${preflight.project?.resolution ?? ''} · ${preflight.project?.fps ?? ''}fps · 片段 ${preflight.timeline?.items ?? 0}`),
              (preflight.missingMedia ?? []).length
                ? h('div', { style: S.error }, `⚠ 离线/丢失素材 ${preflight.missingMedia.length} 条：${preflight.missingMedia.map((m) => m.name).slice(0, 3).join('、')}（先重链再渲染）`)
                : h('div', { style: S.hint }, '素材在线'),
              (preflight.pipeline?.findings ?? []).length
                ? h('div', { style: S.hint }, `色彩管线问题：${preflight.pipeline.findings.map((f) => f.title).join('；')}`)
                : h('div', { style: S.hint }, '色彩管线正常'),
            )
          : h('div', { style: S.hint }, t('preflight.hint')),
      )

      const restoreCard = h(
        Card,
        {
          title: t('restore.title'),
          extra: h(Button, { onClick: resolveRestore, disabled: working || !itemId }, t('restore.resolve')),
        },
        restoreInfo
          ? h('div', null,
              h('div', { style: S.hint }, restoreInfo.verdict?.reason ?? (restoreInfo.error?.message ?? '')),
              restoreInfo.camera ? h('div', { style: S.hint }, `机型：${restoreInfo.camera.vendor} ${restoreInfo.camera.model} · 曲线：${restoreInfo.curve}`) : null,
              restoreInfo.lut ? h('div', { style: S.hint }, `匹配 LUT：${restoreInfo.lut.name}`) : null,
              restoreInfo.needsChoice ? h('div', null,
                h('div', { style: S.hint }, '库里同曲线有多条，请选择（不替你选机器）：'),
                h('div', { style: S.buttons }, (restoreInfo.candidates ?? []).map((item) => h(Button, { key: item.path, onClick: () => applyRestoreLut(item.path), disabled: working }, item.name))),
              ) : null,
              restoreInfo.needsLut ? h('div', null,
                h('div', { style: S.error }, `DaVinci 自带库里没有 ${restoreInfo.curve} 的还原 LUT`),
                h('div', { style: S.hint }, `官方页面（需你确认后下载）：${restoreInfo.officialPage}`),
              ) : null,
              h('div', { style: S.hint }, `官方 LUT 页面：${restoreInfo.officialPage ?? '（无）'} —— 复制 .cube/.zip 直链到下面，插件负责下载并装进 DaVinci`),
              h('div', { style: S.buttons },
                h(Button, { variant: 'primary', onClick: ensureRestore, disabled: working || !itemId }, t('restore.ensure')),
              ),
              h('div', { style: S.buttons },
                h('input', { value: officialLutUrl, placeholder: t('restore.urlPlaceholder'), onChange: (event) => setOfficialLutUrl(event.target.value), style: { ...S.input, flex: 1 } }),
                h(Button, { onClick: downloadOfficialLut, disabled: working || !officialLutUrl }, t('restore.download')),
              ),
              h('div', { style: S.buttons },
                h('input', { value: restoreLutPath, placeholder: t('restore.pathPlaceholder'), onChange: (event) => setRestoreLutPath(event.target.value), style: { ...S.input, flex: 1 } }),
                h(Button, { onClick: () => applyRestoreLut(restoreLutPath), disabled: working || !restoreLutPath }, t('restore.installLocal')),
              ),
              (restoreInfo.downloaded ?? []).length
                ? h('div', { style: S.hint }, `已安装：${restoreInfo.downloaded.map((item) => item.file).join('、')}（再点一次「判断/匹配还原 LUT」会匹配到）`)
                : null,
              restoreInfo.applied ? h('div', { style: S.hint }, `已套用：${restoreInfo.applied}`) : null,
              restoreInfo.ensured
                ? h('div', { style: S.hint }, `一键还原：${restoreInfo.ensured.ok ? '完成' : '未完成'} · ${(restoreInfo.ensured.steps ?? []).map((step) => step.step).join(' → ')}${restoreInfo.ensured.used ? ' · ' + restoreInfo.ensured.used.split('/').pop() : ''}`)
                : null,
            )
          : h('div', { style: S.hint }, t('restore.hint')),
      )

      const debugCard = h(
        Card,
        {
          title: t('debug.title'),
          extra: h('div', { style: S.buttons },
            h(Button, { onClick: feedback }, t('debug.feedback')),
            h(Button, { onClick: clearDebug }, t('debug.clear')),
          ),
        },
        h('div', { style: S.hint }, t('debug.hint')),
        h(
          'div',
          { style: { maxHeight: 260, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 4 } },
          debugEntries.length === 0
            ? h('div', { style: S.hint }, '（还没有动作：跑一次预检 / 一键风格 / 重建调色图，这里会逐条显示）')
            : debugEntries.map((entry) => h('div', { key: entry.seq, style: { ...S.hint, lineHeight: 1.5 } },
                h('span', { style: { ...S.pill, marginRight: 6 } }, entry.stage),
                entry.node ? h('b', null, `${entry.node} `) : null,
                entry.tool ? h('span', null, `工具：${entry.tool}；`) : null,
                h('span', null, entry.message ?? ''),
                entry.purpose ? h('span', null, ` 目的：${entry.purpose}`) : null,
              )),
        ),
      )

      const stylesOneClickCard = h(
        Card,
        { title: t('style.title') },
        h('div', { style: S.hint }, t('style.hint')),
        h('div', { style: S.buttons },
          styleList.map((style) => h(Button, { key: style.key, onClick: () => applyStyleOneClick(style.key), disabled: working || !itemId }, style.label))),
        styleResult ? h(React.Fragment, null,
            h('div', { style: S.hint }, `已应用：${styleResult.style?.label ?? ''} · ${styleResult.applied}/${styleResult.total}`),
            styleEffectsLine(styleResult),
          ) : null,
      )

      const deliveryCard = h(
        Card,
        { title: t('deliver.title') },
        h('div', { style: S.hint }, t('deliver.hint')),
        h('div', { style: S.buttons },
          ['width','height','fps','bitrate'].map((key) => h('input', {
            key, type: 'number',
            value: key === 'width' ? deliverWidth : key === 'height' ? deliverHeight : key === 'fps' ? deliverFps : deliverBitrate,
            onChange: (event) => { const v = Number(event.target.value) || 0; if (key === 'width') setDeliverWidth(v); else if (key === 'height') setDeliverHeight(v); else if (key === 'fps') setDeliverFps(v); else setDeliverBitrate(v) },
            style: { ...(S.input || {}), width: 90 },
          }))),
        h('div', { style: S.buttons },
          h(Button, { variant: 'primary', onClick: planDelivery, disabled: working }, t('deliver.plan')),
          h(Button, { variant: 'primary', onClick: confirmDelivery, disabled: working || !deliverPlan?.confirmToken || Boolean(deliverPlan?.confirmed) }, t('deliver.confirm')),
        ),
        deliverPlan
          ? h('div', null,
              h('div', { style: S.hint }, `方案：${deliverPlan.plan?.width}×${deliverPlan.plan?.height} / ${deliverPlan.plan?.fps}fps / ${deliverPlan.plan?.bitrateMbps}Mbps / ${deliverPlan.plan?.container} → ${deliverPlan.plan?.targetDir}`),
              deliverPlan.confirmed
                ? h('div', { style: S.hint }, `已启动渲染：job ${deliverPlan.confirmed.jobId}（规格已核对）`)
                : deliverPlan.confirmError
                  ? h('div', { style: S.error }, `交付失败：${deliverPlan.confirmError}`)
                  : h('div', { style: S.hint }, '等待确认（确认后才会渲染）'),
            )
          : null,
      )

      const modeCard = !mode
        ? h(
            Card,
            { title: t('mode.title') },
            h('div', { style: S.hint }, t('mode.hint')),
            h(
              'div',
              { style: S.buttons },
              h(Button, { variant: 'primary', onClick: () => { setMode('edit'); setTab('scenes') } }, t('mode.edit')),
              h(Button, { variant: 'primary', onClick: () => { setMode('grade'); setTab('grade') } }, t('mode.grade')),
            ),
          )
        : h(
            'div',
            { style: { ...S.buttons, justifyContent: 'space-between' } },
            h('span', { style: S.hint }, `${t('mode.current')}: ${mode === 'edit' ? t('mode.edit') : t('mode.grade')}`),
            h(Button, { onClick: () => setMode(null) }, t('mode.switch')),
          )

      const lutCard = h(
        Card,
        {
          title: t('lut.title'),
          extra: h(
            'div',
            { style: S.buttons },
            h('input', { value: lutName, onChange: (event) => setLutName(event.target.value), style: { ...S.input, width: 200 }, placeholder: t('lut.name') }),
            h(Button, { onClick: ensureLut, disabled: working }, t('lut.ensure')),
            h('label', { style: { ...S.buttons, cursor: 'pointer' } },
              lutFile ? lutFile.name : t('lut.pickFile'),
              h('input', {
                type: 'file', accept: '.cube',
                style: { display: 'none' },
                onChange: (event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = () => setLutFile({ name: file.name, dataUrl: String(reader.result || '') })
                  reader.readAsDataURL(file)
                },
              })),
            h(Button, { variant: 'primary', onClick: acquireLut, disabled: working || !itemId }, t('lut.acquire')),
          h(Button, { onClick: rebuildAll, disabled: working || !itemId }, t('grade.rebuildAll')),
          ),
        },
        h('div', { style: S.hint }, t('lut.hint')),
        lutResult
          ? h('div', { style: S.hint }, JSON.stringify(lutResult).slice(0, 300))
          : null,
        rebuildResult
          ? h('div', { style: S.hint }, `重建调色图：${rebuildResult.rebuilt}/${rebuildResult.total} · look ${rebuildResult.lookPreset ?? ''}`)
          : null,
        h(
          'div',
          { style: S.buttons },
          h('span', { style: S.hint }, t('tex.mist')),
          h(Button, { onClick: () => applyMist('black'), disabled: working || !itemId }, `${t('tex.blackMist')} ${mistStrength.toFixed(2)}`),
          h(Button, { onClick: () => applyMist('white'), disabled: working || !itemId }, `${t('tex.whiteMist')} ${mistStrength.toFixed(2)}`),
          h('input', { type: 'number', min: 0.05, max: 1, step: 0.05, value: mistStrength, onChange: (event) => setMistStrength(Number(event.target.value) || 0.35), style: { ...S.input, width: 70 } }),
        ),
        mistResult
          ? h('div', { style: S.hint }, `柔光：${mistResult.mode} · ${JSON.stringify(mistResult.applied ?? {})}`)
          : null,
      )

      const tabDefs = [
        ['grade', t('tab.grade')],
        ['effects', t('tab.effects')],
        ['look', t('tab.look')],
        ['vibe', t('tab.vibe')],
        ['scenes', t('tab.scenes')],
        ['fx', t('tab.fx')],
        ...(features.videoMatting ? [['videoAlpha', t('tab.videoAlpha')]] : []),
      ]
      const featureCard = h(
        Card,
        { title: t('feature.title') },
        h('div', { style: S.hint }, t('feature.hint')),
        h('div', { style: S.buttons },
          features.videoMatting
            ? h(Button, { onClick: disableVideoMatting, disabled: Boolean(working) }, t('feature.disable'))
            : h(Button, { variant: 'primary', onClick: enableVideoMatting, disabled: Boolean(working) }, t('feature.enable')),
          h(Button, { onClick: loadFeatures, disabled: Boolean(working) }, t('feature.status')),
          h('span', { style: S.hint }, features.videoMatting
            ? `${t('feature.on')} · runtime ${features.runtime?.ready ? 'ready' : 'missing'}${features.runtime?.source ? ` (${features.runtime.source})` : ''}`
            : t('feature.off')),
        ),
        features.videoMatting ? null : h('div', { style: S.hint }, t('feature.hidden')),
        featureSteps.length ? h('div', { style: S.hint }, featureSteps.join(' · ')) : null,
      )

      const tabs = h(
        'div',
        { style: S.tabs },
        tabDefs.map(([key, label]) => h(
          Button,
          { key, variant: tab === key ? 'primary' : undefined, onClick: () => setTab(key) },
          label,
        )),
      )

      const currentCard = h(
        Card,
        { title: t('card.current') },
        !itemId
          ? h('div', { style: S.hint }, t('card.current.empty'))
          : h(
              'div',
              { style: S.metaGrid },
              h(MetaRow, { label: t('label.item'), value: item?.name }),
              h(MetaRow, { label: t('label.project'), value: project?.name ?? '—' }),
              h(MetaRow, { label: t('label.timeline'), value: timeline?.name ?? '—' }),
              h(MetaRow, {
                label: t('label.nodes'),
                value: okOf(state?.nodes)?.num_nodes ?? '—',
              }),
              h(MetaRow, { label: t('label.comps'), value: okOf(state?.comps)?.count ?? '—' }),
              h(MetaRow, { label: t('label.version'), value: okOf(state?.version)?.version?.versionName ?? '—' }),
              h(MetaRow, { label: t('label.group'), value: okOf(state?.colorGroup)?.name ?? '—' }),
              h(MetaRow, {
                label: t('label.versions'),
                value: versions.length ? versions.join(' / ') : t('version.none'),
              }),
            ),
        !itemId && version
          ? h(
              'div',
              { style: S.hint },
              `${version.product ?? 'DaVinci Resolve'} ${version.version_string ?? version.version ?? ''}`.trim(),
            )
          : null,
      )

      const gradeCard = h(
        Card,
        {
          title: t('card.cdl'),
          extra: h(
            'div',
            { style: S.buttons },
            h(Button, { variant: 'primary', onClick: applyCdl, disabled: working || !itemId }, t('cdl.apply')),
            h(
              Button,
              { onClick: () => setCdl(emptyCdl()), disabled: working },
              t('cdl.neutral'),
            ),
          ),
        },
        h('div', { style: S.hint }, t('card.cdl.hint')),
        h(CdlGroup, {
          title: t('cdl.lift'),
          values: cdl.lift,
          min: -0.25,
          max: 0.25,
          step: 0.005,
          onChange: (next) => setCdl((current) => ({ ...current, lift: next })),
        }),
        h(CdlGroup, {
          title: t('cdl.gamma'),
          values: cdl.gamma,
          min: 0.4,
          max: 2.5,
          step: 0.01,
          onChange: (next) => setCdl((current) => ({ ...current, gamma: next })),
        }),
        h(CdlGroup, {
          title: t('cdl.gain'),
          values: cdl.gain,
          min: 0.4,
          max: 2.5,
          step: 0.01,
          onChange: (next) => setCdl((current) => ({ ...current, gain: next })),
        }),
        h(Slider, {
          label: t('cdl.saturation'),
          value: cdl.saturation,
          min: 0,
          max: 2,
          step: 0.01,
          onChange: (next) => setCdl((current) => ({ ...current, saturation: next })),
        }),
      )

      const looksCard = h(
        Card,
        { title: t('card.looks') },
        h('div', { style: S.hint }, t('card.looks.hint')),
        h(
          'div',
          { style: S.looks },
          LOOKS.map((look) =>
            h(
              Button,
              { key: look, onClick: () => applyLook(look), disabled: working || !itemId },
              t(`look.${look}`),
            ),
          ),
        ),
      )

      const versionsCard = h(
        Card,
        { title: t('card.versions') },
        h(
          'div',
          { style: S.buttons },
          h('input', {
            type: 'text',
            placeholder: t('version.name'),
            value: versionName,
            onChange: (event) => setVersionName(event.target.value),
            style: { ...S.input, width: 180 },
          }),
          h(Button, { onClick: saveVersion, disabled: working || !itemId || !versionName.trim() }, t('version.save')),
        ),
        h(
          'div',
          { style: S.buttons },
          h(
            'select',
            {
              value: selectedVersion,
              onChange: (event) => setSelectedVersion(event.target.value),
              style: S.select,
            },
            versions.length === 0
              ? h('option', { value: '' }, t('version.none'))
              : versions.map((name) => h('option', { key: name, value: name }, name)),
          ),
          h(
            Button,
            { onClick: loadVersion, disabled: working || !itemId || !selectedVersion },
            t('version.load'),
          ),
        ),
      )

      const copyCard = h(
        Card,
        { title: t('card.copy') },
        h('div', { style: S.hint }, t('card.copy.hint')),
        h(
          'div',
          { style: S.buttons },
          h(Button, { onClick: listTargets, disabled: working }, t('copy.load')),
          h(
            'select',
            {
              value: targetId,
              onChange: (event) => setTargetId(event.target.value),
              style: S.select,
              disabled: targets.length === 0,
            },
            targets.length === 0
              ? h('option', { value: '' }, t('copy.empty'))
              : targets.map((entry, index) =>
                  h(
                    'option',
                    { key: `${entry.id ?? index}`, value: entry.id ?? '' },
                    `${index + 1}. ${entry.name ?? '—'}`,
                  ),
                ),
          ),
          h(
            Button,
            { variant: 'primary', onClick: copyGrade, disabled: working || !itemId || !targetId },
            t('copy.apply'),
          ),
        ),
      )

      const dangerCard = h(
        Card,
        { title: t('card.danger') },
        h('div', { style: S.hint }, t('card.danger.hint')),
        h(
          'div',
          { style: S.buttons },
          h(
            Button,
            {
              variant: 'danger',
              onClick: resetGrade,
              disabled: working || !itemId,
            },
            confirmToken ? t('danger.confirm') : t('danger.apply'),
          ),
          confirmToken
            ? h(Button, { onClick: () => setConfirmToken(''), disabled: working }, t('action.cancel'))
            : null,
        ),
      )

      const transformCard = h(
        Card,
        {
          title: t('card.transform'),
          extra: h(
            'div',
            { style: S.buttons },
            h(Button, { variant: 'primary', onClick: applyTransform, disabled: working || !itemId }, t('transform.apply')),
            h(Button, { onClick: resetTransform, disabled: working }, t('transform.reset')),
          ),
        },
        h('div', { style: S.hint }, t('card.transform.hint')),
        h(Slider, {
          label: t('transform.pan'),
          value: transform.Pan,
          min: -1,
          max: 1,
          step: 0.01,
          onChange: (next) => setTransform((current) => ({ ...current, Pan: next })),
        }),
        h(Slider, {
          label: t('transform.tilt'),
          value: transform.Tilt,
          min: -1,
          max: 1,
          step: 0.01,
          onChange: (next) => setTransform((current) => ({ ...current, Tilt: next })),
        }),
        h(Slider, {
          label: t('transform.zoomx'),
          value: transform.ZoomX,
          min: 0.2,
          max: 3,
          step: 0.01,
          onChange: (next) => setTransform((current) => ({ ...current, ZoomX: next })),
        }),
        h(Slider, {
          label: t('transform.zoomy'),
          value: transform.ZoomY,
          min: 0.2,
          max: 3,
          step: 0.01,
          onChange: (next) => setTransform((current) => ({ ...current, ZoomY: next })),
        }),
        h(Slider, {
          label: t('transform.rotation'),
          value: transform.RotationAngle,
          min: -180,
          max: 180,
          step: 1,
          onChange: (next) => setTransform((current) => ({ ...current, RotationAngle: next })),
        }),
      )

      const cropCard = h(
        Card,
        {
          title: t('card.crop'),
          extra: h(Button, { variant: 'primary', onClick: applyCrop, disabled: working || !itemId }, t('crop.apply')),
        },
        h(
          'div',
          { style: S.groupBody },
          ['CropLeft', 'CropRight', 'CropTop', 'CropBottom'].map((key) =>
            h(Slider, {
              key,
              label: t(`crop.${key.replace('Crop', '').toLowerCase()}`),
              value: crop[key],
              min: 0,
              max: 1,
              step: 0.01,
              onChange: (next) => setCrop((current) => ({ ...current, [key]: next })),
            }),
          ),
        ),
      )

      const opacityCard = h(
        Card,
        {
          title: t('card.opacity'),
          extra: h(Button, { variant: 'primary', onClick: applyOpacity, disabled: working || !itemId }, t('opacity.apply')),
        },
        h(Slider, {
          label: t('opacity.value'),
          value: opacity,
          min: 0,
          max: 100,
          step: 1,
          onChange: setOpacity,
        }),
      )

      const blurCard = h(
        Card,
        {
          title: t('card.blur'),
          extra: h(Button, { variant: 'primary', onClick: applyBlur, disabled: working || !itemId }, t('blur.apply')),
        },
        h('div', { style: S.hint }, t('card.blur.hint')),
        h(Slider, {
          label: t('blur.size'),
          value: blurSize,
          min: 0,
          max: 50,
          step: 1,
          onChange: setBlurSize,
        }),
      )

      const fmt3 = (value) =>
        Array.isArray(value) ? value.map((v) => Number(v).toFixed(2)).join('/') : typeof value === 'number' ? value.toFixed(2) : '—'

      const layerLabel = (key) => t(`look.layer.${key}`)

      const summarizeLayers = (stats) => {
        const l = stats?.layers
        if (!l) return '—'
        return [
          `${t('look.layer.skin')} ${l.skin?.coverage ?? 0}%`,
          `${t('look.layer.background')} ${l.background?.dominantHueFamily ?? '—'} ${l.background?.coverage ?? 0}%`,
          `${t('look.layer.highlight')} ${l.highlight?.coverage ?? 0}%`,
          `${t('look.layer.neutral')} ${l.neutral?.coverage ?? 0}%`,
        ].join(' · ')
      }

      const renderPlan = (value) =>
        h(
          'div',
          null,
          Object.entries(value.layers ?? {}).map(([key, entry]) =>
            h(
              'div',
              {
                key,
                style: {
                  display: 'flex',
                  gap: 10,
                  alignItems: 'baseline',
                  flexWrap: 'wrap',
                  padding: '6px 0',
                  borderBottom: '1px solid var(--dsw-alias-border-l1)',
                },
              },
              h('span', { style: { minWidth: 86, fontSize: 12.5, fontWeight: 600 } }, layerLabel(key)),
              h(
                'span',
                {
                  style: {
                    minWidth: 70,
                    fontSize: 11.5,
                    color:
                      entry.confidence === 'low'
                        ? 'var(--dsw-alias-label-secondary)'
                        : 'var(--dsw-alias-state-success-primary)',
                  },
                },
                `${t('look.confidence')}: ${entry.confidence ?? '—'}`,
              ),
              h(
                'span',
                { style: { fontSize: 11.5, fontVariantNumeric: 'tabular-nums' } },
                `S ${fmt3(entry.cdl?.Slope)} · O ${fmt3(entry.cdl?.Offset)} · P ${fmt3(entry.cdl?.Power)} · Sat ${fmt3(entry.cdl?.Saturation)}`,
              ),
              h(
                'span',
                { style: { fontSize: 11, color: 'var(--dsw-alias-label-secondary)', flex: 1, minWidth: 200 } },
                String(entry.note ?? '').slice(0, 140),
              ),
            ),
          ),
        )

      const renderApply = (result) =>
        h(
          'div',
          null,
          h(
            'div',
            { style: S.hint },
            `${t('look.mode')}: ${t(`look.mode.${result?.mode === 'drx-layered' ? 'drx' : result?.mode === 'cdl-fallback' ? 'cdl' : 'failed'}`)} · ${t('look.nodes')}: ${result?.nodeGraph?.num_nodes ?? result?.expectedNodes ?? '—'} · ${t('look.version')}: ${result?.version?.version ?? result?.versionName ?? '—'}`,
          ),
          result?.warning ? h('div', { style: S.hint }, result.warning) : null,
          result?.residual?.delta
            ? h(
                'div',
                { style: S.hint },
                `Δ 亮度 ${Number(result.residual.delta.luma).toFixed(3)} · Δ 饱和 ${Number(result.residual.delta.saturation).toFixed(3)}`,
              )
            : null,
          result?.drxPath ? h('div', { style: S.hint }, `drx: ${result.drxPath}`) : null,
          result?.residual?.compare
            ? h(
                'details',
                null,
                h('summary', { style: { ...S.hint, cursor: 'pointer' } }, t('look.residual')),
                h(
                  'pre',
                  { style: S.pre },
                  JSON.stringify(
                    Object.fromEntries(
                      Object.entries(result.residual.compare.layers ?? {}).map(([k, v]) => [k, v?.cdl ?? v]),
                    ),
                    null,
                    2,
                  ),
                ),
              )
            : null,
          result?.residual?.afterThumb
            ? h('img', {
                src: result.residual.afterThumb,
                style: { width: '100%', maxWidth: 460, borderRadius: 8, marginTop: 8 },
              })
            : null,
          result?.ok === false
            ? h('div', { style: S.error }, JSON.stringify(result.steps ?? result, null, 2).slice(0, 1200))
            : null,
        )

      const lookTab = h(
        React.Fragment,
        null,
        h(
          Card,
          {
            title: t('ref.title'),
            extra: h(
              'div',
              { style: S.buttons },
              h('input', {
                type: 'file',
                accept: 'image/*',
                ref: fileInputRef,
                style: { display: 'none' },
                onChange: (event) => {
                  const file = event.target.files?.[0]
                  if (file) void importRef(file)
                  event.target.value = ''
                },
              }),
              h(Button, { onClick: () => fileInputRef.current?.click(), disabled: working }, t('ref.import')),
              h(Button, { onClick: () => loadRefs(), disabled: working }, t('ref.load')),
            ),
          },
          h('div', { style: S.hint }, t('ref.hint')),
          refThumb
            ? h('img', {
                src: refThumb,
                style: { width: '100%', maxWidth: 440, borderRadius: 8, border: '1px solid var(--dsw-alias-border-l1)' },
              })
            : h('div', { style: S.hint }, t('ref.none')),
          refs.length > 0
            ? h(
                'div',
                { style: S.buttons },
                refs
                  .slice()
                  .reverse()
                  .map((ref) => h(Button, { key: ref.path, onClick: () => pickRef(ref) }, ref.name)),
              )
            : null,
        ),
        h(
          Card,
          {
            title: t('look.target'),
            extra: h(
              'div',
              { style: S.buttons },
              h(Button, { onClick: () => captureFrame('rendered'), disabled: working || !itemId }, t('look.capture')),
              h(Button, { onClick: () => captureFrame('source'), disabled: working || !itemId }, t('look.captureSource')),
            ),
          },
          h('div', { style: S.hint }, t('look.captureHint')),
          capture
            ? h(
                'div',
                null,
                capture.thumb
                  ? h('img', {
                      src: capture.thumb,
                      style: { width: '100%', maxWidth: 440, borderRadius: 8, border: '1px solid var(--dsw-alias-border-l1)' },
                    })
                  : null,
                h('div', { style: S.hint }, `${t('look.layersFound')}: ${summarizeLayers(capture.stats)}`),
                capture.fallback ? h('div', { style: S.hint }, String(capture.fallback)) : null,
              )
            : null,
        ),
        h(
          Card,
          {
            title: t('look.plan'),
            extra: h(
              Button,
              { variant: 'primary', onClick: buildPlan, disabled: working || !refPath || !capture },
              t('look.plan'),
            ),
          },
          h('div', { style: S.hint }, t('look.planHint')),
          plan ? renderPlan(plan) : h('div', { style: S.hint }, t('look.noPlan')),
        ),
        h(
          Card,
          {
            title: t('look.applied'),
            extra: h(
              Button,
              { variant: 'primary', onClick: applyLayeredLook, disabled: working || !plan || !itemId },
              t('look.apply'),
            ),
          },
          h(
            'label',
            { style: { ...S.hint, display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' } },
            h('input', { type: 'checkbox', checked: resetFirst, onChange: (event) => setResetFirst(event.target.checked) }),
            t('look.resetFirst'),
          ),
          applyResult ? renderApply(applyResult) : null,
        ),
        h(
          Card,
          {
            title: t('look.auto'),
            extra: h(
              Button,
              {
                variant: autoArmed ? 'danger' : 'primary',
                onClick: () => (autoArmed ? runAuto() : setAutoArmed(true)),
                disabled: working || !refPath,
              },
              autoArmed ? t('look.autoArm') : t('look.auto'),
            ),
          },
          h('div', { style: S.hint }, t('look.autoHint')),
          autoResult
            ? h(
                'div',
                null,
                h(
                  'div',
                  { style: S.hint },
                  `${t('look.autoMatched')}: ${autoResult.matched ?? 0}/${autoResult.requested ?? 0} · ${t('look.autoFailed')}: ${autoResult.failed ?? 0} · ${t('look.spread')}: ${autoResult.globalGainSpread == null ? '—' : Number(autoResult.globalGainSpread).toFixed(3)}`,
                ),
                h(
                  'div',
                  { style: S.logList },
                  (autoResult.results ?? []).map((entry) =>
                    h(
                      'div',
                      { key: entry.id, style: S.logRow },
                      h('span', { style: entry.ok ? S.logOk : S.logFail }, entry.ok ? '✓' : '✗'),
                      h('span', null, entry.name ?? entry.id),
                      h('span', { style: S.logTime }, entry.mode ?? entry.error ?? ''),
                      entry.globalCdl
                        ? h('span', { style: S.logTime }, `S ${fmt3(entry.globalCdl.Slope)}`)
                        : null,
                    ),
                  ),
                ),
              )
            : null,
        ),
      )

      const runLive = async (stage) => {
        const value = await run('preview.live', { stage }, `实时预览 ${stage}`)
        if (value?.ok && value?.dataUrl) setLiveFrame({ stage, dataUrl: value.dataUrl, left: null, right: null, error: null })
        else setLiveFrame({ stage, dataUrl: null, left: null, right: null, error: value?.error ?? '实时预览失败' })
      }
      const runLiveCompare = async () => {
        const value = await run('preview.compare', { left: liveLeft, right: liveRight }, '分屏对比')
        if (value?.ok && value?.left?.dataUrl && value?.right?.dataUrl) setLiveFrame({ stage: 'compare', dataUrl: null, left: value.left.dataUrl, right: value.right.dataUrl, error: null })
        else setLiveFrame({ stage: 'compare', dataUrl: null, left: null, right: null, error: value?.error ?? `分屏失败（${value?.failedSide ?? '未知'}）` })
      }
      const livePreviewCard = h(
        Card,
        { title: '实时预览 / 分屏对比' },
        h('div', { style: S.hint }, '按层预览当前片段；预览会临时切换节点开关，结束后按原状态恢复。'),
        h(
          'div',
          { style: S.buttons },
          [['current', '现行'], ['source', '原素材'], ['L1', 'L1'], ['L2', 'L2'], ['L3', 'L3']].map(([key, label]) =>
            h(Button, { key, onClick: () => runLive(key), disabled: working || (['L1', 'L2', 'L3'].includes(key) && liveCaps && liveCaps.layeredPreview === false) }, label),
          ),
        ),
        h(
          'div',
          { style: S.buttons },
          h('select', { value: liveLeft, onChange: (event) => setLiveLeft(event.target.value) }, ['source', 'L1', 'L2', 'L3', 'current'].map((option) => h('option', { key: option, value: option }, option))),
          h('select', { value: liveRight, onChange: (event) => setLiveRight(event.target.value) }, ['source', 'L1', 'L2', 'L3', 'current'].map((option) => h('option', { key: option, value: option }, option))),
          h(Button, { onClick: runLiveCompare, disabled: working }, '分屏对比'),
        ),
        liveCaps && liveCaps.layeredPreview === false
          ? h('div', { style: S.hint }, `分层预览已禁用：${(liveCaps.reasons ?? []).join('；')}。可用：现行 / 原素材 / 分屏。`)
          : null,
        liveFrame.error ? h('div', { style: S.error }, liveFrame.error) : null,
        liveFrame.dataUrl ? h('img', { src: liveFrame.dataUrl, style: { maxWidth: '100%', borderRadius: 6, marginTop: 8 } }) : null,
        liveFrame.left || liveFrame.right
          ? h('div', { style: { display: 'flex', gap: 8, marginTop: 8 } },
              liveFrame.left ? h('img', { src: liveFrame.left, style: { width: '50%', borderRadius: 6 } }) : null,
              liveFrame.right ? h('img', { src: liveFrame.right, style: { width: '50%', borderRadius: 6 } }) : null)
          : null,
      )

      function styleEffectsLine(value) {
        const effects = value?.effects
        if (!effects) return null
        const names = { grain: '颗粒', vignette: '暗角', filmLut: 'Film LUT', mist: '柔光' }
        const unsupported = (effects.unsupported ?? []).map((item) => names[item.name] ?? item.name)
        const missing = (effects.missing ?? []).map((item) => names[item] ?? item)
        const parts = []
        if (missing.length) parts.push(`必需效果未完成：${missing.join('、')}`)
        if (unsupported.length) parts.push(`本版未实现：${unsupported.join('、')}（需 Fusion/后期）`)
        if (!parts.length) parts.push('影调与必需效果均已应用')
        return h('div', { style: S.hint }, `成片完成度：${parts.join('；')}`)
      }

      const styleCard = h(
        Card,
        { title: t('style.title') },
        h('div', { style: S.hint }, t('style.hint')),
        h(
          'div',
          { style: S.buttons },
          ['cyberpunk', 'teal-orange', 'bleach'].map((preset) =>
            h(
              Button,
              { key: preset, onClick: () => applyStyleToTimeline(preset), disabled: working },
              `${t('style.apply')} ${preset}`,
            ),
          ),
        ),
        styleResult
          ? styleResult.error
            ? h('div', { style: S.error }, styleResult.error)
            : h('div', null,
                h('div', { style: S.hint }, `${styleResult.preset} · ${styleResult.ok}/${styleResult.total} 个片段已套用`),
                styleEffectsLine(styleResult),
                h('div', { style: S.hint }, t('style.allHint')),
              )
          : null,
      )

      const vibeTab = h(
        React.Fragment,
        null,
        styleCard,
        h(
          Card,
          {
            title: t('vibe.title'),
            extra: h(
              'div',
              { style: S.buttons },
              h(Button, { onClick: buildTiers, disabled: working || !itemId }, t('vibe.build')),
              h(Button, { variant: 'primary', onClick: applyTiers, disabled: working || !itemId }, t('vibe.apply')),
            ),
          },
          h('div', { style: S.hint }, t('vibe.hint')),
          h('textarea', {
            value: vibeText,
            placeholder: t('vibe.placeholder'),
            onChange: (event) => setVibeText(event.target.value),
            style: {
              ...S.input,
              width: '100%',
              minHeight: 64,
              resize: 'vertical',
              lineHeight: 1.5,
            },
          }),
          h(
            'div',
            { style: S.buttons },
            h('span', { style: S.hint }, t('vibe.style')),
            h(
              'select',
              { value: vibeStyle, onChange: (event) => setVibeStyle(event.target.value), style: S.select },
              ['none', 'film', 'punchy', 'clean', 'teal-orange', 'cyberpunk'].map((style) =>
                h('option', { key: style, value: style }, style),
              ),
            ),
          ),
          tierResult
            ? h(
                'div',
                null,
                h('div', { style: S.hint }, `${t('vibe.intents')}: ${JSON.stringify(tierResult.vibe?.intents ?? [], null, 0)}`),
                h('div', { style: S.hint }, `${t('look.nodes')}: ${tierResult.nodeGraph?.num_nodes ?? tierResult.expectedNodes ?? '—'} · ${t('look.version')}: ${tierResult.versionName ?? '—'}`),
                h(
                  'div',
                  { style: S.logList },
                  (tierResult.nodeLabels ?? []).map((label, index) =>
                    h('div', { key: `${label}-${index}`, style: S.logRow }, h('span', { style: S.logTime }, String(index + 1)), h('span', null, label)),
                  ),
                ),
                (tierResult.tiers ?? []).length > 0
                  ? h(
                      'details',
                      null,
                      h('summary', { style: { ...S.hint, cursor: 'pointer' } }, t('vibe.tiers')),
                      h('pre', { style: S.pre }, JSON.stringify(tierResult.tiers, null, 2)),
                    )
                  : null,
                tierResult.error ? h('div', { style: S.error }, String(tierResult.error)) : null,
              )
            : h('div', { style: S.hint }, t('vibe.empty')),
        ),
      )

      const storyCard = h(
        Card,
        {
          title: t('story.title'),
          extra: h(
            'div',
            { style: S.buttons },
            h(Button, { onClick: transcribeStory, disabled: working }, t('story.transcribe')),
            h(Button, { onClick: planStory, disabled: working }, t('story.plan')),
            h(Button, { variant: 'primary', onClick: applyStory, disabled: working || !(storyPlan?.edits ?? []).length }, t('story.apply')),
          ),
        },
        h('div', { style: S.hint }, t('story.hint')),
        h(
          'div',
          { style: S.buttons },
          h('span', { style: S.hint }, t('story.target')),
          h('input', { type: 'number', value: storyTarget, onChange: (event) => setStoryTarget(event.target.value), style: { ...S.input, width: 90 } }),
        ),
        storyResult
          ? h('div', { style: S.hint }, `转写: ${storyResult.transcribed ?? 0} 段 · 缓存: ${storyResult.cached ?? 0} · 台词段: ${storyResult.totalSegments ?? 0} · ${storyResult.elapsedSec ?? 0}s`)
          : null,
        storyPlan
          ? h(
              'div',
              null,
              h('div', { style: S.hint }, `剧本 ${storyPlan.scriptLines ?? 0} 句 / 方案 ${(storyPlan.edits ?? []).length} 刀 / 总长 ${storyPlan.totalDuration ?? 0}s / 切点问题 ${(storyPlan.diagnostics?.blocking ?? []).length}`),
              h(
                'details',
                { open: true },
                h('summary', { style: { ...S.hint, cursor: 'pointer' } }, t('story.script')),
                h(
                  'div',
                  { style: S.logList },
                  (storyPlan.script?.lines ?? []).slice(0, 40).map((line, index) =>
                    h(
                      'div',
                      { key: `s-${index}`, style: S.logRow },
                      h('span', { style: S.logTime }, line.speaker),
                      h('span', { style: S.logTime }, `${line.start.toFixed(1)}–${line.end.toFixed(1)}`),
                      h('span', null, line.text),
                    ),
                  ),
                ),
              ),
              h(
                'details',
                null,
                h('summary', { style: { ...S.hint, cursor: 'pointer' } }, t('story.edits')),
                h(
                  'div',
                  { style: S.logList },
                  (storyPlan.edits ?? []).map((edit) =>
                    h(
                      'div',
                      { key: `e-${edit.index}`, style: S.logRow },
                      h('span', { style: S.logTime }, `#${edit.index}`),
                      h('span', { style: S.logTime }, `${edit.kind}`),
                      h('span', { style: S.logTime }, `${edit.duration}s`),
                      h('span', null, edit.reason),
                    ),
                  ),
                ),
              ),
              (storyPlan.diagnostics?.blocking ?? []).length
                ? h('div', { style: S.error }, `切点问题: ${JSON.stringify(storyPlan.diagnostics.blocking.slice(0, 4))}`)
                : h('div', { style: S.hint }, `${t('story.diag')}: 碎句 0 · 动作中间切 0`),
              storyPlan.applied
                ? h('div', { style: S.hint }, `已建时间线: ${storyPlan.applied.timelineName}（${storyPlan.applied.clipCount} 刀 / ${storyPlan.applied.durationSec}s）`)
                : null,
            )
          : h('div', { style: S.hint }, t('story.empty')),
      )

      const exportCard = h(
        Card,
        {
          title: t('export.title'),
          extra: h(Button, { onClick: checkExportAspect, disabled: working }, t('export.check')),
        },
        h('div', { style: S.hint }, t('export.hint')),
        exportCheck
          ? h(
              'div',
              null,
              h('div', { style: S.hint }, `时间线 ${exportCheck.resolution?.width}×${exportCheck.resolution?.height} · 素材 ${(exportCheck.mediaInconsistency ?? []).length} 条宽高比不一致`),
              exportCheck.question
                ? h(
                    'div',
                    null,
                    h('div', { style: S.hint }, exportCheck.question.text),
                    h(
                      'div',
                      { style: S.buttons },
                      (exportCheck.question.options ?? []).map((option) =>
                        h(Button, { key: option.id, onClick: () => setExportCheck((current) => ({ ...(current ?? {}), chosen: option.id })) }, option.label),
                      ),
                    ),
                    exportCheck.chosen
                      ? h('div', { style: S.hint }, `已选：${exportCheck.chosen}（导出时按此执行，需在对话里确认）`)
                      : null,
                  )
                : h('div', { style: S.hint }, exportCheck.note ?? ''),
            )
          : h('div', { style: S.hint }, t('export.check')),
      )

      const scenesTab = h(
        React.Fragment,
        null,
        h(
          Card,
          {
            title: t('scenes.title'),
            extra: h(Button, { variant: 'primary', onClick: scanScenes, disabled: working }, t('scenes.scan')),
          },
          h('div', { style: S.hint }, t('scenes.hint')),
          sceneResult
            ? h(
                'div',
                null,
                h('div', { style: S.hint }, `${t('scenes.count')}: ${sceneResult.sceneCount ?? 0} · 时间线: ${sceneResult.timeline ?? '—'}`),
                h(
                  'div',
                  { style: S.logList },
                  (sceneResult.scenes ?? []).slice(0, 20).map((scene) =>
                    h(
                      'div',
                      { key: scene.index, style: S.logRow },
                      h('span', { style: S.logTime }, `#${scene.index}`),
                      h('span', { style: S.logTime }, `${scene.recordStart}–${scene.recordEnd}`),
                      h('span', null, scene.clipName ?? ''),
                      h('span', { style: S.logTime }, `luma ${Number(scene.metrics?.lumaMean ?? 0).toFixed(0)} · 锐 ${Number(scene.metrics?.sharpness ?? 0).toFixed(1)} · 绿 ${(Number(scene.metrics?.greenDominance ?? 0) * 100).toFixed(0)}%`),
                    ),
                  ),
                ),
                h(
                  'div',
                  { style: S.buttons },
                  (sceneResult.thumbs ?? []).map((thumb, index) =>
                    thumb.thumb
                      ? h('img', { key: `t-${index}`, src: thumb.thumb, style: { width: 132, borderRadius: 6 } })
                      : null,
                  ),
                ),
              )
            : h('div', { style: S.hint }, t('scenes.empty')),
        ),
        h(
          Card,
          {
            title: t('scenes.edit'),
            extra: h(Button, { variant: 'primary', onClick: runEdit, disabled: working }, t('scenes.editRun')),
          },
          h(
            'div',
            { style: S.buttons },
            h('span', { style: S.hint }, t('scenes.target')),
            h('input', {
              type: 'number',
              min: 5,
              max: 600,
              value: editSeconds,
              onChange: (event) => setEditSeconds(Number(event.target.value) || 30),
              style: { ...S.input, width: 90 },
            }),
          ),
          editResult
            ? h(
                'div',
                null,
                h('div', { style: S.hint }, `${editResult.timelineName ?? ''} · edits ${editResult.decision?.edits?.length ?? 0} · total ${Number(editResult.decision?.totalDuration ?? 0).toFixed(1)}s`),
                h('pre', { style: S.pre }, JSON.stringify(editResult.decision?.edits ?? [], null, 2).slice(0, 2000)),
              )
            : null,
        ),
      )

      const advancedCard = h(
        Card,
        { title: t('adv.title') },
        h('div', { style: S.hint }, t('adv.hint')),
        h('div', { style: S.buttons },
          [
            ['overlay.perspective', '透视跟踪'],
            ['scenes.group', '场景分组'],
            ['scenes.unify', '场景统一'],
            ['look.plan', '风格方案'],
            ['look.apply', '套用方案'],
            ['grade.tiers', '三层图信息'],
            ['texture.mist', '白柔'],
            ['edit.auto', '自动剪辑'],
          ].map(([op, label]) => h(Button, { key: op, onClick: () => run(op, { itemId, mode: 'white', strength: 0.3 }, label), disabled: working }, label)),
        ),
      )

      const alphaPreviewGrid = (result) => {
        const previews = Array.isArray(result?.previews) ? result.previews.filter((entry) => entry?.dataUrl) : []
        if (!previews.length) return null
        return h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8, marginTop: 8 } },
          previews.map((entry) => h('div', { key: entry.offset },
            h('img', { src: entry.dataUrl, style: { width: '100%', borderRadius: 6 } }),
            h('div', { style: S.hint }, `${t('alpha.previewAt')} ${entry.offset}f`),
          )),
        )
      }

      const videoAlphaTab = h(
        React.Fragment,
        null,
        h(
          Card,
          { title: t('alpha.targetCard') },
          h('div', { style: S.buttons },
            h('select', {
              value: videoTargetId,
              onChange: (event) => setVideoTargetId(event.target.value),
              style: S.select,
            },
              h('option', { value: '' }, t('alpha.targetPick')),
              videoTargets.map((target) => h('option', { key: target.id, value: target.id }, `${target.name} · ${target.start}–${target.end}`)),
            ),
            h(Button, { onClick: loadVideoTargets, disabled: working }, t('alpha.targetsRefresh')),
          ),
          h('div', { style: S.hint }, t('alpha.targetHint')),
          h('div', { style: S.hint }, t('alpha.visualLimits')),
        ),
        h(
          Card,
          { title: t('alpha.videoTitle') },
          h('div', { style: S.hint }, t('alpha.videoHint')),
          h('div', { style: S.buttons },
            h('input', {
              value: alphaVideoPath,
              onChange: (event) => setAlphaVideoPath(event.target.value),
              placeholder: '/path/to/alpha.mov（ProRes 4444 / 带 alpha）',
              style: { ...S.input, flex: 1, minWidth: 260 },
            }),
            h(Button, { variant: 'primary', onClick: () => compositeAlphaVideo(), disabled: working || !videoTargetId || !alphaVideoPath.trim() }, t('alpha.composite')),
            h('label', { style: { ...S.buttons, cursor: 'pointer', fontSize: 12.5 } },
              alphaUploadName ? `${t('alpha.uploaded')} ${alphaUploadName}` : t('alpha.upload'),
              h('input', { type: 'file', accept: 'video/*', style: { display: 'none' }, onChange: (event) => { const f = event.target.files?.[0]; event.target.value = ''; if (f) void pickAlphaUpload(f) } }),
            ),
          ),
          h('div', { style: S.buttons },
            h('select', {
              value: alphaVideoClipId,
              onChange: (event) => {
                const id = event.target.value
                setAlphaVideoClipId(id)
                const clip = alphaSources.find((entry) => entry.id === id)
                if (clip?.filePath) setAlphaVideoPath(clip.filePath)
              },
              style: S.select,
            },
              h('option', { value: '' }, t('alpha.pickAlphaClip')),
              alphaSources.map((clip) => h('option', { key: clip.id, value: clip.id }, `${clip.name}${clip.derived ? ' · alpha' : ''}`)),
            ),
          ),
          alphaCompositeResult
            ? h('div', null,
                alphaCompositeResult.ok === false
                  ? h('div', { style: S.error }, alphaCompositeResult.error ?? '失败')
                  : h('div', null,
                      h('div', { style: S.hint }, `alpha: ${alphaCompositeResult.alpha?.codec ?? ''} ${alphaCompositeResult.alpha?.pixFmt ?? ''} · ${alphaCompositeResult.alpha?.frameCount ?? alphaCompositeResult.alpha?.frames ?? '—'} 帧 / ${alphaCompositeResult.alpha?.durationSec ?? '—'}s · fps ${alphaCompositeResult.alpha?.fps ?? '—'}`),
                      h('div', { style: S.hint }, `placed: ${String(alphaCompositeResult.placement?.placed)} · V2 items: ${alphaCompositeResult.placement?.v2Items ?? '—'} · sync: start ${alphaCompositeResult.sync?.recordFrame ?? '—'} / alpha ${alphaCompositeResult.sync?.alphaFrames ?? '—'}f / target ${alphaCompositeResult.sync?.targetFrames ?? '—'}f`),
                      alphaCompositeResult.normalization
                        ? h('div', { style: S.hint }, `归一化: ${alphaCompositeResult.normalization.from} → ${alphaCompositeResult.normalization.to} (${alphaCompositeResult.normalization.pixFmt})`)
                        : null,
                      alphaPreviewGrid(alphaCompositeResult),
                    ),
              )
            : null,
        ),
        h(
          Card,
          { title: t('alpha.cutoutTitle') },
          h('div', { style: S.hint }, t('alpha.cutoutHint')),
          h('div', { style: S.buttons },
            h('select', {
              value: videoSourceClipId,
              onChange: (event) => {
                setVideoSourceClipId(event.target.value)
                setSourcePreview(null)
                setSubjectBox(null)
                setBoxDrag(null)
                setVideoCutoutResult(null)
              },
              style: S.select,
            },
              h('option', { value: '' }, t('alpha.pickSource')),
              alphaSources.filter((clip) => !clip.derived).map((clip) => h('option', { key: clip.id, value: clip.id }, clip.name)),
            ),
            h(Button, { onClick: loadAlphaSources, disabled: working }, t('alpha.refreshSources')),
            h(Button, { onClick: previewSource, disabled: working || !videoSourceClipId }, t('alpha.previewSource')),
          ),
          sourcePreview
            ? h('div', null,
                h('div', { style: { position: 'relative', maxWidth: 480, marginTop: 8, userSelect: 'none', cursor: 'crosshair' },
                  onMouseDown: onBoxDown, onMouseMove: onBoxMove, onMouseUp: onBoxUp, onMouseLeave: onBoxUp },
                  h('img', { src: sourcePreview.dataUrl, draggable: false, style: { display: 'block', width: '100%', borderRadius: 6 } }),
                  (() => {
                    const box = boxDrag
                      ? { x: Math.min(boxDrag.x0, boxDrag.x1), y: Math.min(boxDrag.y0, boxDrag.y1), w: Math.abs(boxDrag.x1 - boxDrag.x0), h: Math.abs(boxDrag.y1 - boxDrag.y0) }
                      : subjectBox
                    if (!box) return null
                    return h('div', { style: { position: 'absolute', left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.w * 100}%`, height: `${box.h * 100}%`, border: '2px solid #ffd400', boxShadow: '0 0 0 9999px rgba(0,0,0,0.28)', pointerEvents: 'none' } })
                  })(),
                ),
                h('div', { style: S.hint }, subjectBox ? t('alpha.boxReady') : t('alpha.boxHint')),
              )
            : null,
          h('div', { style: S.hint }, `${t('alpha.target')}: ${videoTargets.find((entry) => entry.id === videoTargetId)?.name ?? '—'} / ${videoTimelineName || timeline?.name || '—'}`),
          h('div', { style: S.buttons },
            h('span', { style: S.hint }, t('alpha.duration')),
            h('input', { type: 'number', min: 0.5, max: 10, step: 0.5, value: videoCutoutDuration, onChange: (event) => setVideoCutoutDuration(Number(event.target.value) || 2), style: { ...S.input, width: 70 } }),
            h('span', { style: S.hint }, t('alpha.fps')),
            h('input', { type: 'number', min: 2, max: 24, step: 1, value: videoCutoutFps, onChange: (event) => setVideoCutoutFps(Number(event.target.value) || 24), style: { ...S.input, width: 60 } }),
            h(Button, { variant: 'primary', onClick: runVideoCutout, disabled: working || !videoTargetId || !videoSourceClipId }, t('alpha.cutout')),
          ),
          videoCutoutResult
            ? h('div', null,
                videoCutoutResult.ok === false
                  ? h('div', { style: S.error }, videoCutoutResult.error ?? '失败')
                  : h('div', null,
                      h('div', { style: S.hint }, `${t('alpha.mode')}: ${videoCutoutResult.mode} · ${t('alpha.frames')}: ${videoCutoutResult.matteFrames} · fps ${videoCutoutResult.alpha?.fps ?? '—'} · alpha ${videoCutoutResult.alpha?.pixFmt ?? ''}`),
                      h('div', { style: S.hint }, videoCutoutResult.trackingImplemented === false ? t('alpha.noTracking') : ''),
                      alphaPreviewGrid(videoCutoutResult),
                    ),
              )
            : null,
        ),
      )

      const trackCard = h(
        Card,
        {
          title: t('track.title'),
          extra: h('div', { style: S.buttons },
            h(Button, { onClick: async () => { const v = await run('face.track', { itemId }, t('track.face')); if (v) setTrackResult(v) }, disabled: working || !itemId }, t('track.face')),
            h(Button, { onClick: async () => { const v = await run('mask.verify', { itemId }, t('track.verify')); if (v) setTrackResult(v) }, disabled: working || !itemId }, t('track.verify')),
          ),
        },
        h('div', { style: S.hint }, t('track.hint')),
        trackResult ? h('div', { style: S.hint }, JSON.stringify(trackResult).slice(0, 240)) : null,
      )

      const fxTab = h(
        React.Fragment,
        null,
        h(
          Card,
          {
            title: t('fx.title'),
            extra: h(
              'div',
              { style: S.buttons },
              h('input', {
                type: 'file',
                accept: 'image/*',
                ref: overlayInputRef,
                style: { display: 'none' },
                onChange: (event) => {
                  const file = event.target.files?.[0]
                  if (file) void pickOverlay(file)
                  event.target.value = ''
                },
              }),
              h(Button, { onClick: () => overlayInputRef.current?.click(), disabled: working }, t('fx.upload')),
              h(Button, { onClick: pickPlayheadCutout, disabled: working || !itemId }, t('fx.fromPlayhead')),
            ),
          },
          h('div', { style: S.hint }, t('fx.hint')),
          cutoutResult
            ? h(
                'div',
                null,
                h('div', { style: S.hint }, t('fx.alphaPreview')),
                h(
                  'div',
                  {
                    style: {
                      maxWidth: 420, borderRadius: 8, overflow: 'hidden',
                      backgroundImage: 'linear-gradient(45deg,#bbb 25%,transparent 25%),linear-gradient(-45deg,#bbb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#bbb 75%),linear-gradient(-45deg,transparent 75%,#bbb 75%)',
                      backgroundSize: '24px 24px', backgroundPosition: '0 0,0 12px,12px -12px,-12px 0',
                    },
                  },
                  cutoutResult.outputPath
                    ? h('img', { src: mediaUrl(cutoutResult.outputPath), alt: 'alpha', style: { display: 'block', width: '100%' } })
                    : cutoutResult.thumb ? h('img', { src: cutoutResult.thumb, style: { display: 'block', width: '100%' } }) : null,
                ),
                h('div', { style: S.hint }, `${cutoutResult.method ?? ''} · coverage ${Number((cutoutResult.coverage ?? 0) * 100).toFixed(1)}% · ${t('fx.alphaPng')}: ${cutoutResult.outputPath ?? ''}`),
                h('div', { style: S.buttons },
                  h(Button, { variant: 'primary', onClick: applyOverlay, disabled: working || !itemId || !cutoutResult.outputPath }, t('fx.overlayApply')),
                ),
                h('div', { style: S.hint }, t('fx.overlayHint')),
                overlayResult
                  ? h('div', { style: S.hint }, `Fusion: ${overlayResult.ok ? 'ok' : 'fail'} · ${overlayResult.comp ?? overlayResult.error ?? ''} · keyframes ${overlayResult.keyframeCount ?? '—'}`)
                  : null,
              )
            : null,
        ),
        trackCard,
        advancedCard,
        h(
          Card,
          {
            title: t('fx.eraseTitle'),
            extra: h(
              'div',
              { style: S.buttons },
              h(Button, { onClick: detectErase, disabled: working || !itemId }, t('fx.detect')),
              h(
                Button,
                {
                  variant: 'primary',
                  onClick: renderErase,
                  disabled: working || !(eraseResult?.delogoBoxes?.length > 0),
                },
                t('fx.render'),
              ),
            ),
          },
          h('div', { style: S.hint }, t('fx.eraseHint')),
          eraseResult
            ? h(
                'div',
                null,
                h('div', { style: S.hint }, `${t('fx.candidates')}: ${(eraseResult.candidates ?? []).length} · delogo: ${JSON.stringify(eraseResult.delogoBoxes ?? [])}`),
                h(
                  'div',
                  { style: S.buttons },
                  (eraseResult.thumbs ?? []).map((thumb, index) =>
                    thumb ? h('img', { key: `e-${index}`, src: thumb, style: { width: 132, borderRadius: 6 } }) : null,
                  ),
                ),
                eraseResult.render
                  ? h('div', { style: S.hint }, `clean: ${eraseResult.render.outputPath ?? ''} · 叠到 V2: ${String(eraseResult.render.placed)}`)
                  : null,
              )
            : h('div', { style: S.hint }, t('fx.empty')),
        ),
        h(
          Card,
          {
            title: `${t('erase.lockTitle')} · DEMO`, 
            extra: h(
              'div',
              { style: S.buttons },
              h(Button, { onClick: captureStill, disabled: working || !itemId }, t('erase.still')),
              h(Button, { variant: 'primary', onClick: lockErase, disabled: working || !itemId || !stillFrame }, t('erase.lock')),
            ),
          },
          h('div', { style: S.hint }, t('erase.lockHint')),
          h(
            'div',
            { style: S.buttons },
            h('span', { style: S.hint }, t('erase.size')),
            h('select', { value: eraseSize, onChange: (event) => setEraseSize(event.target.value), style: S.select },
              [['auto', t('erase.sizeAuto')], ['large', t('erase.sizeLarge')], ['small', t('erase.sizeSmall')]].map(([value, label]) => h('option', { key: value, value }, label))),
            h('span', { style: S.hint }, t('erase.method')),
            h('select', { value: eraseMethod, onChange: (event) => setEraseMethod(event.target.value), style: S.select },
              [['auto', t('erase.methodAuto')], ['plate', t('erase.methodPlate')], ['follow', t('erase.methodFollow')]].map(([value, label]) => h('option', { key: value, value }, label))),
            h(Button, { onClick: planEraseTarget, disabled: working || !itemId }, t('erase.plan')),
            h(Button, { variant: 'primary', onClick: buildErase, disabled: working || !itemId }, t('erase.build')),
          ),
          erasePlan
            ? h('div', null,
                h('div', { style: S.hint }, `${erasePlan.plan.size} / ${erasePlan.plan.method} · ${erasePlan.classification.reason}`),
                ...(erasePlan.plan.steps ?? []).map((step, index) => h('div', { key: index, style: S.hint }, step)),
                ...(erasePlan.plan.warnings ?? []).map((warn, index) => h('div', { key: `w${index}`, style: S.hint }, `⚠ ${warn}`)),
              )
            : null,
          stillFrame
            ? h(
                'div',
                { style: { position: 'relative', userSelect: 'none', cursor: 'crosshair', maxWidth: 960 } },
                h('img', {
                  src: stillFrame.dataUrl,
                  draggable: false,
                  onMouseDown: onStillDown,
                  onMouseMove: onStillMove,
                  onMouseUp: onStillUp,
                  onMouseLeave: onStillUp,
                  style: { width: '100%', borderRadius: 6, display: 'block' },
                }),
                (() => {
                  const frame = stillFrame
                  const scale = frame.scale ?? 1
                  const boxPct = stillDrag
                    ? {
                        left: `${Math.min(stillDrag.x0, stillDrag.x1) * 100}%`,
                        top: `${Math.min(stillDrag.y0, stillDrag.y1) * 100}%`,
                        width: `${Math.abs(stillDrag.x1 - stillDrag.x0) * 100}%`,
                        height: `${Math.abs(stillDrag.y1 - stillDrag.y0) * 100}%`,
                      }
                    : {
                        left: `${(lockBox.x / scale / frame.width) * 100}%`,
                        top: `${(lockBox.y / scale / frame.height) * 100}%`,
                        width: `${(lockBox.w / scale / frame.width) * 100}%`,
                        height: `${(lockBox.h / scale / frame.height) * 100}%`,
                      }
                  return h('div', {
                    style: {
                      position: 'absolute',
                      border: '2px solid #ffd54a',
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)',
                      pointerEvents: 'none',
                      ...boxPct,
                    },
                  })
                })(),
                h('div', { style: S.hint }, `${stillFrame.width}×${stillFrame.height}（原始 ${stillFrame.fullWidth}×${stillFrame.fullHeight}）· ${stillFrame.timecode ?? ''}`),
              )
            : h('div', { style: S.hint }, t('erase.stillHint')),
          h(
            'div',
            { style: S.buttons },
            ['x', 'y', 'w', 'h'].map((key) =>
              h('input', {
                key,
                type: 'number',
                value: lockBox[key],
                onChange: (event) => setLockBox((box) => ({ ...box, [key]: Number(event.target.value) || 0 })),
                style: { ...S.input, width: 84 },
              }),
            ),
          ),
          lockResult
            ? h('div', null,
                h('div', { style: S.hint }, `mode: ${lockResult.mode} · drift ${lockResult.driftPx}px · ${(lockResult.frames ?? []).length} 帧`),
                h('div', { style: S.hint }, lockResult.recommendation ?? ''),
              )
            : null,
        ),
        storyCard,
        exportCard,
      )

      const cameraCard = h(
        Card,
        {
          title: t('cam.title'),
          extra: h(
            'div',
            { style: S.buttons },
            h(Button, { onClick: detectCameraInfo, disabled: working }, t('cam.detect')),
            h(Button, { variant: 'primary', onClick: applyRaw, disabled: working }, t('cam.apply')),
          ),
        },
        h('div', { style: S.hint }, t('cam.applyHint')),
        cameraResult?.detection
          ? h(
              'div',
              null,
              h(MetaRow, { label: 'camera', value: `${cameraResult.detection.label ?? '—'} (${cameraResult.detection.camera ?? '—'})` }),
              h(MetaRow, { label: t('cam.log'), value: String(cameraResult.detection.isLog) }),
              h(MetaRow, { label: t('cam.conf'), value: String(cameraResult.detection.confidence) }),
              h(MetaRow, { label: t('cam.path'), value: `${cameraResult.recommendedPath ?? '—'} / ${cameraResult.detection.suggested?.lutKey ?? '—'}` }),
              h('div', { style: S.hint }, cameraResult.detection.reason ?? ''),
              (cameraResult.detection.evidence ?? []).length
                ? h('div', { style: S.hint }, (cameraResult.detection.evidence ?? []).join(' · '))
                : null,
              cameraResult.rawApply
                ? h('pre', { style: S.pre }, JSON.stringify(cameraResult.rawApply, null, 2).slice(0, 1600))
                : null,
            )
          : h('div', { style: S.hint }, t('cam.unknown')),
      )

      const envCard = h(
        Card,
        {
          title: t('env.title'),
          extra: h(
            'div',
            { style: S.buttons },
            h(Button, { onClick: runEnvCheck, disabled: working }, t('env.check')),
            h(Button, { onClick: runAsrSelfTest, disabled: working }, t('env.selftest')),
            h(Button, { variant: 'primary', onClick: runEnvInstall, disabled: working }, t('env.install')),
          ),
        },
        h('div', { style: S.hint }, t('env.hint')),
        envResult
          ? h(
              'div',
              null,
              h('div', { style: S.hint }, envResult.ok ? `✓ ${t('env.ok')}` : `缺 ${(envResult.summary?.missing ?? []).join(', ')}`),
              h(
                'div',
                { style: S.logList },
                (envResult.items ?? []).map((item) =>
                  h(
                    'div',
                    { key: item.id, style: S.logRow },
                    h('span', { style: { ...S.logTime, color: item.status === 'ok' ? '#3ecf8e' : item.status === 'optional' ? 'inherit' : '#ff8a5c' } }, item.status),
                    h('span', null, item.label ?? item.id),
                  ),
                ),
              ),
              envResult.selfTest
                ? h('div', { style: S.hint }, `ASR: ${envResult.selfTest.asr?.text ?? envResult.selfTest.error ?? '—'}`)
                : null,
            )
          : h('div', { style: S.hint }, t('env.check')),
      )

      const pipelineTab = h(
        React.Fragment,
        null,
        envCard,
        cameraCard,
        h(
          Card,
          {
            title: t('pipe.title'),
            extra: h(
              'div',
              { style: S.buttons },
              h(Button, { variant: 'primary', onClick: runDiagnose, disabled: working }, t('pipe.diagnose')),
              h(Button, { onClick: () => fixPipeline(null), disabled: working || !pipeline }, t('pipe.fixAll')),
            ),
          },
          h('div', { style: S.hint }, t('pipe.hint')),
          pipeline
            ? h(
                'div',
                { style: S.metaGrid },
                h(MetaRow, { label: t('pipe.platform'), value: `${pipeline.snapshot?.platform ?? '—'} ${pipeline.snapshot?.osRelease ?? ''}` }),
                h(MetaRow, { label: t('pipe.resolve'), value: pipeline.snapshot?.version?.version_string ?? '—' }),
                h(MetaRow, { label: t('pipe.science'), value: pipeline.resolved?.science?.value ?? '—' }),
                h(MetaRow, { label: t('pipe.timeline'), value: pipeline.resolved?.timelineSpace?.value ?? '—' }),
                h(MetaRow, { label: t('pipe.output'), value: pipeline.resolved?.outputSpace?.value ?? '—' }),
                h(MetaRow, { label: t('pipe.gamma'), value: pipeline.resolved?.outputGamma?.value ?? '—' }),
              )
            : h('div', { style: S.hint }, t('pipe.empty')),
        ),
        pipeline
          ? (pipeline.findings ?? []).map((finding) =>
              h(
                'div',
                {
                  key: finding.id,
                  style: {
                    background: 'var(--dsw-alias-bg-layer-1)',
                    border: '1px solid var(--dsw-alias-border-l1)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  },
                },
                h(
                  'div',
                  { style: { display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' } },
                  h(
                    'span',
                    {
                      style: {
                        fontSize: 11.5,
                        fontWeight: 700,
                        color:
                          finding.severity === 'error'
                            ? 'var(--dsw-alias-state-error-primary)'
                            : finding.severity === 'warn'
                              ? 'var(--dsw-alias-state-warn-primary)'
                              : finding.severity === 'ok'
                                ? 'var(--dsw-alias-state-success-primary)'
                                : 'var(--dsw-alias-label-secondary)',
                      },
                    },
                    t(`pipe.severity.${finding.severity}`),
                  ),
                  h('span', { style: { fontSize: 13, fontWeight: 600 } }, finding.title),
                  h('span', { style: { fontSize: 11, color: 'var(--dsw-alias-label-secondary)' } }, finding.autoFix ? t('pipe.auto') : t('pipe.manual')),
                ),
                h('div', { style: S.hint }, finding.detail),
                h('div', { style: S.hint }, `${t('pipe.current')}: ${finding.current ?? '—'}`),
                finding.recommended
                  ? h('div', { style: S.hint }, `${t('pipe.recommended')}: ${finding.recommended.key} = ${finding.recommended.value}`)
                  : null,
                finding.manual ? h('div', { style: S.hint }, finding.manual) : null,
                finding.recommended && finding.autoFix
                  ? h('div', { style: S.buttons }, h(Button, { onClick: () => fixPipeline([finding.id]), disabled: working }, t('pipe.fixOne')))
                  : null,
              ),
            )
          : null,
        pipeline?.fixResult ? h('pre', { style: S.pre }, JSON.stringify(pipeline.fixResult, null, 2)) : null,
      )

      const logCard = h(
        Card,
        { title: t('log.title') },
        entries.length === 0
          ? h('div', { style: S.hint }, t('log.empty'))
          : h(
              'div',
              { style: S.logList },
              entries.map((entry) =>
                h(
                  'div',
                  { key: entry.id, style: S.logRow },
                  h('span', { style: S.logTime }, entry.at),
                  h('span', { style: entry.ok ? S.logOk : S.logFail }, entry.ok ? '✓' : '✗'),
                  h('span', null, entry.label),
                  entry.ok ? null : h('span', { style: S.logFail }, cleanMessage(entry.value).slice(0, 120)),
                ),
              ),
            ),
        entries.length > 0
          ? h(
              'details',
              null,
              h('summary', { style: { ...S.hint, cursor: 'pointer' } }, t('log.raw')),
              h('pre', { style: S.pre }, pretty(entries[0].value)),
            )
          : null,
      )

      return h(
        'div',
        { style: S.page },
        h(
          'div',
          { style: S.inner },
          header,
          commandBar,
          depsBanner,
          helpCard,
          modeCard,
          featureCard,
          error ? h('div', { style: S.error }, `${t('state.error')}${error}`) : null,
          mode === 'edit' ? mediaCard : null,
          mode === 'edit' ? docsCard : null,
          preflightCard,
          tabs,
          tab === 'grade'
            ? h(React.Fragment, null, currentCard, livePreviewCard, gradeCard, versionsCard, copyCard, lutCard, dangerCard)
            : tab === 'effects'
              ? h(React.Fragment, null, transformCard, cropCard, opacityCard, blurCard)
              : tab === 'look'
                ? h(React.Fragment, null, lookTab, looksCard)
                : tab === 'vibe'
                  ? vibeTab
                  : tab === 'scenes'
                    ? scenesTab
                    : tab === 'fx'
                      ? fxTab
                      : tab === 'videoAlpha' && features.videoMatting
                        ? videoAlphaTab
                        : pipelineTab,
          restoreCard,
          stylesOneClickCard,
          deliveryCard,
          debugCard,
          logCard,
        ),
      )
    }

    function pretty(value) {
      if (typeof value === 'string') return value
      try {
        return JSON.stringify(value, null, 2)
      } catch {
        return String(value)
      }
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, DICTIONARIES), 'davinci-panel: dictionaries')
        const t = ctx.locale.bind(NS)

        ctx.effect(
          () =>
            ctx.slots.inject('main', () =>
              ctx.slots.register(
                {
                  name: 'main',
                  key: PANEL_ID,
                  locale: NS,
                },
                DavinciPanel,
              ),
            ),
          'davinci-panel: main panel',
        )

        ctx.effect(
          () =>
            ctx.slots.inject('sidebar.panellist', () =>
              ctx.slots.register(
                {
                  name: 'sidebar.panellist',
                  id: PANEL_ID,
                  order: 20,
                  locale: NS,
                  label: () => t('panel.short'),
                },
                PanelIcon,
              ),
            ),
          'davinci-panel: sidebar entry',
        )
      },
    }
  },
})
