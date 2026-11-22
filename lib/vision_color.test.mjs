import { parseVibeVision, parseVibeReview, visionRecipe, objectiveFlags, aggregateObjective } from './vision_color.mjs'

let failures = 0
const check = (name, condition, detail = '') => {
  if (!condition) { failures += 1; console.error(`FAIL ${name}${detail ? ` — ${detail}` : ''}`) }
}

const raw = JSON.stringify({
  scene: '校园秋日，男生弹吉他',
  subjects: ['男生', '吉他'],
  faces: { present: true, count: 1 },
  lighting: { direction: '侧逆光', quality: 'soft', contrast: 'high', key: 'sun' },
  issues: [{ type: 'skin', severity: 'medium', region: 'face', timeSec: 1.2, evidence: '肤色偏橙偏深', suggestion: '局部提亮肤色', confidence: 0.82 }],
  adjustments: { exposure: 0.2, contrast: 1.03, saturation: 0.96, temperature: 0.15, tint: 0 },
  style: { preset: 'teal-orange', strength: 0.25, reason: '暖肤色与冷背景' },
  skin: { needed: true, brightness: 0.2, saturation: 0.98, protectHue: true, reason: '只提亮肤色' },
  overallConfidence: 0.86,
})
const parsed = parseVibeVision(`说明文字\n\`\`\`json\n${raw}\n\`\`\``)
check('解析带 markdown 的 JSON 对象', parsed.ok === true)
check('保留模型置信度与问题', parsed.ok && parsed.analysis.overallConfidence === 0.86 && parsed.analysis.issues[0].type === 'skin')
check('识别有人脸和肤色需求', parsed.ok && parsed.analysis.faces.present === true && parsed.analysis.skin.needed === true)
const recipe = visionRecipe(parsed.analysis)
check('模型曝光映射到有限 recipe', recipe.exposure > 0 && recipe.exposure <= 0.35)
check('风格只保留枚举', ['none', 'teal-orange', 'bleach', 'cyberpunk'].includes(parsed.analysis.style.preset))
check('无 JSON 对象时失败，不猜词典', parseVibeVision('暖一点，青橙风格').ok === false)
check('退化 JSON 无场景/主体/问题时失败', parseVibeVision('{}').ok === false)
const flags = objectiveFlags(parsed.analysis, { clipping: { highlightRatio: 0.09, shadowRatio: 0.01 }, saturation: { mean: 0.7 }, temporal: { maxLumaJump: 0.22 } })
check('客观标记高光/饱和/时序问题', flags.some((flag) => flag.type === 'highlight-clipping') && flags.some((flag) => flag.type === 'oversaturation') && flags.some((flag) => flag.type === 'temporal-jump'))

const reviewWorse = parseVibeReview(JSON.stringify({ verdict: 'worse', confidence: 0.9, evidence: '肤色更橙', pairs: [{ index: 1, timeSec: 0.5, risk: 'high', confidence: 0.8, evidence: '肤色偏橙' }], issues: [] }))
check('复看 worse 不通过', reviewWorse.ok && reviewWorse.passed === false && reviewWorse.verdict === 'worse')
const reviewUncertain = parseVibeReview(JSON.stringify({ verdict: 'uncertain', confidence: 0.8, evidence: '看不清', pairs: [] }))
check('复看 uncertain 不通过', reviewUncertain.ok && reviewUncertain.passed === false)
const reviewImproved = parseVibeReview(JSON.stringify({ verdict: 'improved', confidence: 0.8, evidence: '肤色更自然', pairs: [{ index: 1, timeSec: 0.5, risk: 'low', confidence: 0.8, evidence: '更好' }], issues: [] }))
check('复看 improved 且高置信才通过', reviewImproved.ok && reviewImproved.passed === true)
check('复看缺少 verdict 失败', parseVibeReview(JSON.stringify({ confidence: 0.9 })).ok === false)
const aggregate = aggregateObjective({ frames: [
  { luma: 0.5, saturation: 0.2, clipping: { highlightRatio: 0.02, shadowRatio: 0.01, threshold: { highlightLuma: 0.98 } }, quality: { banding: { checked: true, ratio: 0.01, method: 'x' }, spill: { checked: true, ratio: 0.001, method: 'x' } } },
  { luma: 0.52, saturation: 0.3, clipping: { highlightRatio: 0.09, shadowRatio: 0.03, threshold: { highlightLuma: 0.98 } }, quality: { banding: { checked: true, ratio: 0.03, method: 'x' }, spill: { checked: true, ratio: 0.004, method: 'x' } } },
] })
check('客观检查覆盖全部采样帧', aggregate.frameCount === 2 && aggregate.clipping.maxHighlightRatio === 0.09 && aggregate.saturation.max === 0.3)
check('断层/溢色有检测字段（无样本时仍标记未检查）', Array.isArray(aggregate.unverifiedChecks))
const aggFlags = objectiveFlags({}, { aggregate })
check('客观标记读取全部帧的最大高光/时序', aggFlags.some((flag) => flag.type === 'highlight-clipping'))

if (failures) { console.error(`FAIL vision_color.test.mjs — ${failures} 项`); process.exitCode = 1 } else { console.log('PASS vision_color.test.mjs') }
