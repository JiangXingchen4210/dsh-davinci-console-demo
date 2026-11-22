/**
 * 相机 / 传输函数识别 —— 决定「要不要套 LUT、套哪一个」。
 *
 * 科学 Camera Raw 流程的第一性问题不是“套什么 LUT”，而是“这段素材到底是什么”：
 * 机型、编码、是否 LOG、是否已经是 Rec.709。判断错一步，后面全错。
 *
 * 判据优先级：
 *  1) 文件扩展名（.braw/.r3d/.ari…）→ 直接判定 RAW 机型
 *  2) 元数据（ffprobe tags/stream + Resolve clip properties 的机型/编码字段）→ 机型与 color_transfer
 *  3) 画面统计（lib/layers.mjs 的 lumaPct / dynamicRange / meanSat）→ LOG 还是已 709 的兜底判据
 * 只有「明确是 LOG + 有内置曲线」才 needsLut=true；未知一律不套。
 */

const clippers = (value) => String(value ?? '').toLowerCase()

/** 机型关键词表：order 敏感（RAW 扩展名与显式品牌先判）。 */
const CAMERA_RULES = [
  {
    key: 'blackmagic',
    label: 'Blackmagic Design',
    extensions: ['.braw'],
    match: /blackmagic|bmd|pocket cinema|ursa|braw/,
    inputColorSpace: 'Blackmagic Design Film Gen 5',
    inputGamma: 'Blackmagic Design Film Gen 5',
    lutKey: null,
  },
  {
    key: 'red',
    label: 'RED',
    extensions: ['.r3d'],
    match: /\bred\b|komodo|raptor|log3g10|redcode/,
    inputColorSpace: 'RED Log3G10',
    inputGamma: 'RED Log3G10',
    lutKey: null,
  },
  {
    key: 'arri',
    label: 'ARRI',
    extensions: ['.ari', '.arw'],
    match: /arri|alexa|amira|logc/,
    inputColorSpace: 'ARRI LogC3',
    inputGamma: 'ARRI LogC3',
    lutKey: 'arri-logc3',
  },
  {
    key: 'sony',
    label: 'Sony',
    extensions: ['.mxf', '.mp4', '.mov'],
    match: /sony|ilce|ilme|fx3|fx6|fx9|a7s|a7iv|venice|s-log|slog/,
    inputColorSpace: 'Sony S-Log3 S-Gamut3.Cine',
    inputGamma: 'Sony S-Log3',
    lutKey: 'sony-slog3',
  },
  {
    key: 'canon',
    label: 'Canon',
    extensions: ['.crm', '.mxf', '.mp4', '.mov'],
    match: /canon|eos|cinema eos|c-log|clog/,
    inputColorSpace: 'Canon Log 3',
    inputGamma: 'Canon Log 3',
    lutKey: null,
  },
  {
    key: 'panasonic',
    label: 'Panasonic',
    extensions: ['.mxf', '.mp4', '.mov'],
    match: /panasonic|lumix|v-log|vlog|\bs1[hr]?\b|\bs5\b|\bgh[456]\b/,
    inputColorSpace: 'Panasonic V-Gamut/V-Log',
    inputGamma: 'Panasonic V-Log',
    lutKey: 'panasonic-vlog',
  },
  {
    key: 'dji',
    label: 'DJI',
    extensions: ['.mp4', '.mov'],
    match: /dji|mavic|inspire|ronin|d-log|dlog/,
    inputColorSpace: 'DJI D-Log',
    inputGamma: 'DJI D-Log',
    lutKey: 'dji-dlog',
  },
  {
    key: 'apple',
    label: 'Apple',
    extensions: ['.mov', '.mp4'],
    match: /apple|iphone|ipad/,
    inputColorSpace: null,
    inputGamma: null,
    lutKey: null,
  },
  {
    key: 'nikon',
    label: 'Nikon',
    extensions: ['.mov', '.mp4', '.nef'],
    match: /nikon|\bz[89]\b|n-log|nlog/,
    inputColorSpace: 'Nikon N-Log',
    inputGamma: 'Nikon N-Log',
    lutKey: null,
  },
  {
    key: 'fuji',
    label: 'Fujifilm',
    extensions: ['.mov', '.mp4', '.raf'],
    match: /fuji|x-h|x-t|f-log|flog/,
    inputColorSpace: 'Fuji F-Log',
    inputGamma: 'Fuji F-Log',
    lutKey: null,
  },
]

const LOG_TRANSFERS = ['log100', 'log316', 'arib-std-b67', 'smpte2084', 'smpte-st-2084', 'log', 'logc']
const SDR_TRANSFERS = ['bt709', 'bt.709', 'smpte170m', 'bt470bg', 'iec61966-2-1', 'srgb']

function firstStream(ffprobe) {
  return ffprobe?.streams?.[0] ?? ffprobe?.stream ?? null
}

function buildText({ ffprobe, clipProperties, filePath }) {
  const stream = firstStream(ffprobe) ?? {}
  const tags = { ...(ffprobe?.format?.tags ?? {}), ...(stream.tags ?? {}) }
  const parts = [
    filePath,
    ffprobe?.format?.format_name,
    stream.codec_name,
    stream.codec_long_name,
    stream.color_transfer,
    stream.color_primaries,
    stream.color_space,
    tags.make,
    tags.model,
    tags.encoder,
    tags.comment,
    tags.handler_name,
    clipProperties?.['Camera Type'],
    clipProperties?.['Camera Manufacturer'],
    clipProperties?.['Video Codec'],
    clipProperties?.['File Path'],
    clipProperties?.['Format'],
    // 厂商私有 metadata（Panasonic Semi-Pro XML、vendor_id 等）必须纳入识别：
    // 这些文件常见 color_transfer=bt709，但 XML 里明确 CaptureGamma=V-Log / CaptureGamut=V-Gamut。
    ...Object.entries(ffprobe?.format?.tags ?? {}).map(([key, value]) => `${key}=${String(value).slice(0, 4000)}`),
    ...Object.entries(stream.tags ?? {}).map(([key, value]) => `${key}=${String(value).slice(0, 1000)}`),
    ...Object.entries(clipProperties ?? {}).map(([key, value]) => `${key}=${String(value).slice(0, 1000)}`),
  ]
  return clippers(parts.filter(Boolean).join(' '))
}

/** 画面统计 → LOG / 已 709 的倾向（带置信度）。 */
export function analyseTone(stats) {
  const layer = stats?.layers?.global ?? stats?.global ?? null
  if (!layer) return { verdict: null, confidence: 0, metrics: null }
  const p5 = Number(layer.lumaPct?.p5 ?? layer.p5 ?? 0)
  const p95 = Number(layer.lumaPct?.p95 ?? layer.p95 ?? 1)
  const dynamicRange = Number(layer.dynamicRange ?? Math.max(0, p95 - p5))
  const saturation = Number(layer.meanSat ?? 0)
  const metrics = { p5, p95, dynamicRange, saturation }
  // LOG：黑位抬起 + 动态范围被压缩 + 饱和度偏低
  const logish = (p5 > 0.1 && dynamicRange < 0.55) || (p5 > 0.12 && saturation < 0.35 && dynamicRange < 0.62)
  // 已 709：黑位压得低、动态范围大、饱和度正常
  const graded = p5 < 0.06 && dynamicRange > 0.6 && saturation >= 0.3
  if (logish && !graded) return { verdict: 'log', confidence: 0.55, metrics }
  if (graded && !logish) return { verdict: 'graded', confidence: 0.6, metrics }
  if (!logish && !graded) return { verdict: null, confidence: 0, metrics }
  return { verdict: logish ? 'log' : 'graded', confidence: 0.3, metrics }
}

/**
 * 识别相机与传输函数。
 * @param {object} input - {ffprobe, clipProperties, stats, filePath}
 * @returns {object} {ok, camera, label, transfer, isLog, confidence, evidence, suggested, needsLut, reason}
 */
export function detectCamera({ ffprobe = null, clipProperties = null, stats = null, filePath = '' } = {}) {
  const text = buildText({ ffprobe, clipProperties, filePath })
  const lowerPath = clippers(filePath ?? clipProperties?.['File Path'] ?? '')
  const evidence = []

  let cameraRule = null
  for (const rule of CAMERA_RULES) {
    const extHit = rule.extensions.some((ext) => lowerPath.endsWith(ext))
    if (extHit && (rule.key === 'blackmagic' || rule.key === 'red' || rule.key === 'arri')) {
      cameraRule = rule
      evidence.push(`RAW 扩展名命中 ${rule.extensions.find((ext) => lowerPath.endsWith(ext))}`)
      break
    }
  }
  if (!cameraRule) {
    for (const rule of CAMERA_RULES) {
      if (rule.match.test(text) || rule.match.test(lowerPath)) {
        cameraRule = rule
        evidence.push(`关键词命中 /${rule.match.source}/`)
        break
      }
    }
  }

  // 文件名只是兜底：厂商元数据（DJI/RONIN/ARRI/SONY…）优先级更高，A###C### 不是 Alexa 专属
  const arriNaming = /(^|[/_])A\d{3}C\d{3}/i.test(String(filePath ?? ''))
  if (arriNaming && !cameraRule) {
    cameraRule = { key: 'arri', label: 'ARRI', inputColorSpace: 'ARRI LogC3', inputGamma: 'ARRI LogC3', lutKey: 'arri-logc3' }
    evidence.push('文件名符合 ARRI Alexa 命名（A###C###）→ 按 ARRI LogC3 处理')
  }

  const stream = firstStream(ffprobe) ?? {}
  const transferTag = clippers(stream.color_transfer ?? ffprobe?.format?.tags?.color_transfer ?? '')
  let transfer = transferTag || 'unknown'
  let transferIsLog = null
  if (transferTag) {
    if (LOG_TRANSFERS.some((token) => transferTag.includes(token))) {
      transferIsLog = true
      evidence.push(`color_transfer=${transferTag}（LOG/HDR）`)
    } else if (SDR_TRANSFERS.some((token) => transferTag.includes(token))) {
      transferIsLog = false
      evidence.push(`color_transfer=${transferTag}（已 SDR）`)
    }
  }

  // Panasonic 的厂商标识只说明来源；必须读取实际拍摄 Gamma，不能把
  // CINELIKE_D2 / BT.709 等同于 V-Log。ffprobe 的 bt709 标签在 V-Log
  // 文件中也可能出现，所以明确的 CaptureGamma 优先于容器标签与画面统计。
  const panasonicXml = String(ffprobe?.format?.tags?.['com.panasonic.Semi-Pro.metadata.xml'] ?? '')
  const capturedGamma = panasonicXml.match(/<CaptureGamma(?:\s[^>]*)?>\s*([^<]+)\s*<\/CaptureGamma>/i)?.[1]?.trim() ?? null
  const explicitPanasonicLog = capturedGamma == null ? null
    : /^v[-_ ]?log(?:[-_ ]?l)?$/i.test(capturedGamma) ? true
    : /^(?:cinelike|cinelike[_ -]?d2|rec\.?709|bt\.?709|standard|natural)/i.test(capturedGamma) ? false
    : null
  if (explicitPanasonicLog !== null) {
    transferIsLog = explicitPanasonicLog
    evidence.push(`Panasonic CaptureGamma=${capturedGamma}（覆盖容器 transfer 标签）`)
  }
  const tone = analyseTone(stats)
  if (tone.metrics) {
    evidence.push(
      `画面统计 p5=${tone.metrics.p5.toFixed(3)} p95=${tone.metrics.p95.toFixed(3)} 动态范围=${tone.metrics.dynamicRange.toFixed(3)} 饱和=${tone.metrics.saturation.toFixed(3)}`,
    )
  }

  let isLog = null
  let confidence = 0
  if (explicitPanasonicLog === false) {
    isLog = false
    confidence = 0.95
  } else if (transferIsLog === true) {
    isLog = true
    confidence = 0.9
  } else if (tone.verdict === 'log') {
    isLog = true
    confidence = transferIsLog === false ? 0.45 : tone.confidence
    if (transferIsLog === false) evidence.push('元数据说是 SDR，但画面统计像 LOG → 以画面为准，但置信度降低')
  } else if (transferIsLog === false) {
    isLog = false
    confidence = 0.85
  } else if (tone.verdict === 'graded') {
    isLog = false
    confidence = tone.confidence
  } else {
    isLog = null
    confidence = 0
  }

  if (cameraRule && isLog === null && ['arri', 'sony', 'panasonic', 'canon', 'blackmagic', 'red'].includes(cameraRule.key)) {
    // 专业机默认按 LOG 拍摄，但仍标成中等置信度，提示用户确认
    isLog = true
    confidence = Math.max(confidence, 0.4)
    evidence.push('专业机型默认按 LOG 处理（置信度中等，建议人工确认）')
  }

  const lutKey = isLog === true && cameraRule?.lutKey ? cameraRule.lutKey : null
  const needsLut = isLog === true && Boolean(lutKey)
  const suggested = {
    inputColorSpace: isLog === true ? cameraRule?.inputColorSpace ?? null : null,
    inputGamma: isLog === true ? cameraRule?.inputGamma ?? null : null,
    lutKey,
  }

  let reason
  if (cameraRule == null && isLog === null) reason = '无法判断机型与传输函数：请手动选择 Input Color Space 或指定相机，插件不会瞎套 LUT'
  else if (isLog === false) reason = '画面/元数据判定已是 Rec.709 类显示素材，不需要 LOG→709 转换'
  else if (isLog === true && !lutKey) reason = `${cameraRule?.label ?? '该机型'} 的 LOG 曲线未内置：请用 Resolve 的 Color Space Transform 节点或官方 LUT（插件不猜）`
  else reason = `识别为 ${cameraRule?.label ?? '未知'} LOG，使用内置 ${lutKey} 曲线`

  return {
    ok: true,
    camera: cameraRule?.key ?? 'unknown',
    label: cameraRule?.label ?? 'unknown',
    transfer,
    isLog,
    confidence: Number(confidence.toFixed(2)),
    evidence,
    tone,
    suggested,
    needsLut,
    reason,
  }
}

export function listCameraRules() {
  return CAMERA_RULES.map((rule) => ({
    key: rule.key,
    label: rule.label,
    extensions: rule.extensions,
    inputColorSpace: rule.inputColorSpace,
    lutKey: rule.lutKey,
  }))
}
