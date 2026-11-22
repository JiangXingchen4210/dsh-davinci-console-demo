/**
 * Vibe Color 视觉决策：模型判断场景/主体/光线/风格与问题，宿主只做 schema 校验和安全落地。
 * 纯逻辑，不调用 Resolve，也不回退到关键词词典。
 */
export const VIBE_VISION_SYSTEM_PROMPT = [
  '你是资深电影调色师和视觉分析员。你会看到同一镜头的多张带时间戳的 Resolve 已处理帧。',
  '先描述你实际看到的：场景、主体（是否有人脸/肤色）、光线（方向/软硬/明暗）、拍摄/呈现问题（曝光、白平衡、饱和度、肤色、局部溢色、黑位/高光）。',
  '再给调色建议：全局基础校正、可选风格（只能从给定枚举中选）、以及是否需要局部肤色修正。不要猜测画面外信息。',
  '必须只输出一个 JSON 对象，不要 markdown、不要解释。字段：',
  '{"scene":"...","subjects":["..."],"faces":{"present":true/false,"count":0},"lighting":{"direction":"...","quality":"...","contrast":"low|medium|high","key":"..."},',
  '"issues":[{"type":"exposure|white-balance|saturation|skin|highlight|shadow|color-cast|other","severity":"low|medium|high","region":"full|face|skin|background|highlight|shadow","timeSec":0,"evidence":"...","suggestion":"...","confidence":0..1}],',
  '"adjustments":{"exposure":-2..2,"contrast":0.7..1.4,"saturation":0.5..1.5,"temperature":-1..1,"tint":-1..1},',
  '"style":{"preset":"none|teal-orange|bleach|cyberpunk","strength":0..0.6,"reason":"..."},',
  '"skin":{"needed":true/false,"brightness":-0.5..0.5,"saturation":0.5..1.5,"protectHue":true/false,"reason":"..."},',
  '"overallConfidence":0..1}',
  '如果画面没有可见人脸或肤色，faces.present=false，skin.needed=false。风格不明确就 preset="none"。',
  '肤色修正不要建议整体加亮；应局部提高肤色明度并保护背景与肤色相位，且说明跨帧一致性的风险。',
].join('\n')

export function buildVibeVisionPrompt({ text, clipName, frames }) {
  const list = (frames ?? []).map((frame, index) => `${index + 1}. t=${Number(frame.timeSec ?? 0).toFixed(2)}s`).join('\n')
  return [
    `用户目标：${text || '自然、专业的基础调色'}`,
    `镜头：${clipName ?? 'unknown'}；共 ${(frames ?? []).length} 张，按顺序给出：`,
    list,
    '请结合画面与用户目标输出一个 JSON 对象；如果目标与画面冲突，以画面实际内容为准并在 issues 说明。',
  ].join('\n')
}

function extractBalanced(text, open, close) {
  const raw = String(text ?? '').trim()
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1] : raw
  const start = candidate.indexOf(open)
  if (start < 0) return null
  let depth = 0; let inString = false; let escape = false
  for (let i = start; i < candidate.length; i += 1) {
    const ch = candidate[i]
    if (inString) {
      if (escape) escape = false
      else if (ch === '\\') escape = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') { inString = true; continue }
    if (ch === open) depth += 1
    else if (ch === close) {
      depth -= 1
      if (depth === 0) {
        try { return JSON.parse(candidate.slice(start, i + 1)) } catch { return null }
      }
    }
  }
  return null
}

export function parseVibeVision(text) {
  const obj = extractBalanced(text, '{', '}')
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return { ok: false, error: '模型输出不是 JSON 对象' }
  const clamp = (value, min, max, fallback) => {
    const num = Number(value)
    if (!Number.isFinite(num)) return fallback
    return Math.min(max, Math.max(min, num))
  }
  const presetSet = new Set(['none', 'teal-orange', 'bleach', 'cyberpunk'])
  const stylePreset = presetSet.has(String(obj.style?.preset)) ? String(obj.style.preset) : 'none'
  const issues = Array.isArray(obj.issues) ? obj.issues.filter((entry) => entry && typeof entry === 'object').slice(0, 12).map((entry) => ({
    type: String(entry.type ?? 'other'),
    severity: ['low', 'medium', 'high'].includes(entry.severity) ? entry.severity : 'low',
    region: String(entry.region ?? 'full'),
    timeSec: Number.isFinite(Number(entry.timeSec)) ? Number(entry.timeSec) : null,
    evidence: String(entry.evidence ?? '').slice(0, 300),
    suggestion: String(entry.suggestion ?? '').slice(0, 300),
    confidence: clamp(entry.confidence, 0, 1, 0.5),
  })) : []
  const faces = obj.faces && typeof obj.faces === 'object' ? { present: obj.faces.present === true, count: Math.max(0, Math.round(Number(obj.faces.count) || 0)) } : { present: false, count: 0 }
  const skin = obj.skin && typeof obj.skin === 'object' ? {
    needed: obj.skin.needed === true && faces.present,
    brightness: clamp(obj.skin.brightness, -0.5, 0.5, 0),
    saturation: clamp(obj.skin.saturation, 0.5, 1.5, 1),
    protectHue: obj.skin.protectHue !== false,
    reason: String(obj.skin.reason ?? '').slice(0, 300),
  } : { needed: false, brightness: 0, saturation: 1, protectHue: true, reason: '' }
  const result = {
    scene: String(obj.scene ?? '').slice(0, 300),
    subjects: Array.isArray(obj.subjects) ? obj.subjects.map((subject) => String(subject)).slice(0, 8) : [],
    faces,
    lighting: obj.lighting && typeof obj.lighting === 'object' ? {
      direction: String(obj.lighting.direction ?? '').slice(0, 120),
      quality: String(obj.lighting.quality ?? '').slice(0, 120),
      contrast: ['low', 'medium', 'high'].includes(obj.lighting.contrast) ? obj.lighting.contrast : 'medium',
      key: String(obj.lighting.key ?? '').slice(0, 120),
    } : null,
    issues,
    adjustments: {
      exposure: clamp(obj.adjustments?.exposure, -2, 2, 0),
      contrast: clamp(obj.adjustments?.contrast, 0.7, 1.4, 1),
      saturation: clamp(obj.adjustments?.saturation, 0.5, 1.5, 1),
      temperature: clamp(obj.adjustments?.temperature, -1, 1, 0),
      tint: clamp(obj.adjustments?.tint, -1, 1, 0),
    },
    style: { preset: stylePreset, strength: clamp(obj.style?.strength, 0, 0.6, 0.32), reason: String(obj.style?.reason ?? '').slice(0, 300) },
    skin,
    overallConfidence: clamp(obj.overallConfidence, 0, 1, 0.5),
  }
  if (!result.scene && !result.subjects.length && !result.issues.length) return { ok: false, error: '模型 JSON 缺少可校验的场景/主体/问题' }
  return { ok: true, analysis: result }
}

export function visionRecipe(analysis) {
  const a = analysis?.adjustments ?? {}
  const exposure = Number(a.exposure) || 0
  const contrast = Number(a.contrast) || 1
  const saturation = Number(a.saturation) || 1
  const temp = Number(a.temperature) || 0
  return {
    exposure: Math.max(-0.35, Math.min(0.35, exposure * 0.18)),
    contrast: Math.max(0.9, Math.min(1.12, contrast)),
    lift: Math.max(-0.02, Math.min(0.02, exposure * 0.004)),
    saturation: Math.max(0.8, Math.min(1.12, saturation)),
    hue: Math.max(-4, Math.min(4, temp * 3)),
    splitShadow: { r: 1 + temp * 0.012, g: 1, b: 1 - temp * 0.012 },
    splitHighlight: { r: 1 + temp * 0.018, g: 1, b: 1 - temp * 0.018 },
    skinGain: Math.max(0.98, Math.min(1.04, 1 + (analysis?.skin?.brightness ?? 0) * 0.04)),
  }
}

export function objectiveFlags(analysis, metrics) {
  const flags = []
  const clip = metrics?.aggregate?.clipping ?? metrics?.clipping ?? null
  const highlight = clip?.maxHighlightRatio ?? clip?.highlightRatio
  const shadow = clip?.maxShadowRatio ?? clip?.shadowRatio
  if (Number(highlight) > 0.06) flags.push({ type: 'highlight-clipping', severity: 'high', value: highlight })
  if (Number(shadow) > 0.08) flags.push({ type: 'shadow-crush', severity: 'high', value: shadow })
  const sat = metrics?.aggregate?.saturation?.max ?? metrics?.saturation?.mean
  if (Number.isFinite(Number(sat)) && Number(sat) > 0.62) flags.push({ type: 'oversaturation', severity: 'medium', value: sat })
  const temporal = metrics?.aggregate?.temporal?.maxLumaJump ?? metrics?.temporal?.maxLumaJump
  if (Number.isFinite(Number(temporal)) && Number(temporal) > 0.18) flags.push({ type: 'temporal-jump', severity: 'medium', value: temporal })
  const banding = metrics?.aggregate?.quality?.banding
  if (banding?.checked && Number(banding.maxRatio) > 0.02) flags.push({ type: 'banding', severity: 'medium', value: banding.maxRatio })
  const spill = metrics?.aggregate?.quality?.spill
  if (spill?.checked && Number(spill.maxRatio) > 0.002) flags.push({ type: 'color-spill', severity: 'medium', value: spill.maxRatio })
  return flags
}

export const VIBE_REVIEW_SYSTEM_PROMPT = [
  '你是电影调色师，正在复看同一镜头同一时间点的 before/after 配对帧。',
  '必须先给出 verdict：improved（after 更好）、worse（after 更差）、uncertain（无法判断/证据不足）。',
  'worse 或 uncertain 都不得视为通过；只有 improved 且置信度足够才可通过。',
  '同时给出每对时间点的风险、依据与置信度；只描述你能在图中看到的差异，不猜测画面外信息。',
  '只输出一个 JSON 对象，不要 markdown、不要解释：',
  '{"verdict":"improved|worse|uncertain","confidence":0..1,"evidence":"...","pairs":[{"index":1,"timeSec":0,"risk":"low|medium|high","confidence":0..1,"evidence":"..."}],"issues":[{"type":"skin|highlight|shadow|color-cast|banding|spill|other","severity":"low|medium|high","region":"...","timeSec":0,"evidence":"...","confidence":0..1}]}',
].join('\n')

export function parseVibeReview(text) {
  const obj = extractBalanced(text, '{', '}')
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return { ok: false, error: '复看模型输出不是 JSON 对象' }
  const verdict = ['improved', 'worse', 'uncertain'].includes(obj.verdict) ? obj.verdict : null
  if (!verdict) return { ok: false, error: '复看 JSON 缺少合法 verdict（improved/worse/uncertain）' }
  const clamp = (value, fallback = 0) => {
    const num = Number(value)
    if (!Number.isFinite(num)) return fallback
    return Math.min(1, Math.max(0, num))
  }
  const pairs = Array.isArray(obj.pairs) ? obj.pairs.filter((entry) => entry && typeof entry === 'object').slice(0, 16).map((entry, index) => ({
    index: Number.isFinite(Number(entry.index)) ? Number(entry.index) : index + 1,
    timeSec: Number.isFinite(Number(entry.timeSec)) ? Number(entry.timeSec) : null,
    risk: ['low', 'medium', 'high'].includes(entry.risk) ? entry.risk : 'medium',
    confidence: clamp(entry.confidence, 0.5),
    evidence: String(entry.evidence ?? '').slice(0, 400),
  })) : []
  const issues = Array.isArray(obj.issues) ? obj.issues.slice(0, 12).map((entry) => ({
    type: String(entry?.type ?? 'other'),
    severity: ['low', 'medium', 'high'].includes(entry?.severity) ? entry.severity : 'medium',
    region: String(entry?.region ?? 'full'),
    timeSec: Number.isFinite(Number(entry?.timeSec)) ? Number(entry.timeSec) : null,
    evidence: String(entry?.evidence ?? '').slice(0, 400),
    confidence: clamp(entry?.confidence, 0.5),
  })) : []
  const confidence = clamp(obj.confidence, 0.5)
  return {
    ok: true,
    verdict,
    confidence,
    evidence: String(obj.evidence ?? '').slice(0, 500),
    pairs,
    issues,
    passed: verdict === 'improved' && confidence >= 0.5,
  }
}

export function aggregateObjective(metrics) {
  const frames = Array.isArray(metrics?.frames) ? metrics.frames.filter(Boolean) : []
  const clips = frames.map((row) => row.clipping).filter(Boolean)
  const sats = frames.map((row) => row.saturation).filter((value) => Number.isFinite(value))
  const lumas = frames.map((row) => row.luma).filter((value) => Number.isFinite(value))
  const temporalJumps = lumas.length < 2 ? [] : lumas.slice(1).map((value, index) => Math.abs(value - lumas[index]))
  const qualities = frames.map((row) => row.quality).filter(Boolean)
  const bandingRatio = qualities.filter((q) => q.banding?.checked).map((q) => Number(q.banding.ratio) || 0)
  const spillRatio = qualities.filter((q) => q.spill?.checked).map((q) => Number(q.spill.ratio) || 0)
  return {
    frameCount: frames.length,
    quality: {
      banding: { checked: bandingRatio.length > 0, maxRatio: bandingRatio.length ? Math.max(...bandingRatio) : null, method: 'low-gradient-hard-step' },
      spill: { checked: spillRatio.length > 0, maxRatio: spillRatio.length ? Math.max(...spillRatio) : null, method: 'single-channel-clipping' },
    },
    clipping: {
      maxHighlightRatio: clips.length ? Math.max(...clips.map((clip) => Number(clip.highlightRatio) || 0)) : null,
      maxShadowRatio: clips.length ? Math.max(...clips.map((clip) => Number(clip.shadowRatio) || 0)) : null,
      threshold: frames[0]?.clipping?.threshold ?? null,
    },
    saturation: { mean: sats.length ? sats.reduce((sum, value) => sum + value, 0) / sats.length : null, max: sats.length ? Math.max(...sats) : null },
    temporal: { maxLumaJump: temporalJumps.length ? Math.max(...temporalJumps) : null },
    unverifiedChecks: bandingRatio.length && spillRatio.length ? [] : ['banding', 'local-color-spill'],
  }
}
