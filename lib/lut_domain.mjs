/**
 * LUT 输入域检查：只根据 .cube 文件头/注释判定输入空间，不靠文件名。
 * 目标：避免把 Cineon/Log 输入的电影印片 LUT 直接接在 RCM 已输出 Rec.709 的节点后面。
 */
import { promises as fs } from 'node:fs'

const LOG_HINTS = [
  /cineon/i, /\blog\b/i, /logc/i, /s-?log/i, /v-?log/i, /d-?log/i, /n-?log/i,
  /f-?log/i, /log3g10/i, /arri ?log/i, /acesc/i, /adx/i,
]
const REC709_HINTS = [/rec\.? ?709/i, /display ?rec/i, /gamma ?2\.?4/i, /srgb/i, /bt\.?709/i]

export async function inspectLutDomain(lutPath) {
  const text = await fs.readFile(lutPath, 'utf8')
  const head = text.split(/\r?\n/).slice(0, 80).join('\n')
  const title = (head.match(/TITLE\s+"([^"]+)"/i)?.[1] ?? '').trim()
  const domainLine = head.match(/DOMAIN_MIN[^\n]*\n?DOMAIN_MAX[^\n]*/i)?.[0] ?? ''
  const inputLine = (head.match(/#[^\n]*\bInput\b[^\n]*/i)?.[0] ?? '').trim()
  const displayLine = (head.match(/#[^\n]*\bDisplay\b[^\n]*/i)?.[0] ?? '').trim()
  const log = LOG_HINTS.some((re) => re.test(head))
  const rec709 = REC709_HINTS.some((re) => re.test(head))
  let inputDomain = 'unknown'
  // 优先看显式 Input/Display 行：Resolve Film Looks LUT 的标题含 Rec709，但 Input 行明确是 Cineon Log。
  if (/log|cineon|adx/i.test(inputLine)) inputDomain = 'log'
  else if (/rec\.? ?709|display/i.test(inputLine)) inputDomain = 'rec709'
  else if (log && !rec709) inputDomain = 'log'
  else if (rec709 && !log) inputDomain = 'rec709'
  else if (log && rec709) inputDomain = /cineon|log/i.test(title) || /log|cineon/i.test(displayLine) ? 'log' : 'unknown'
  return {
    path: lutPath,
    title,
    inputDomain,
    evidence: {
      logHints: LOG_HINTS.filter((re) => re.test(head)).map(String),
      rec709Hints: REC709_HINTS.filter((re) => re.test(head)).map(String),
      inputLine,
      displayLine,
      headerSample: head.split(/\r?\n/).filter((line) => /^#/.test(line)).slice(0, 8),
    },
  }
}

export function lutCompatibleWithOutput(inspection, outputDomain = 'rec709') {
  const input = inspection?.inputDomain ?? 'unknown'
  const output = String(outputDomain ?? 'rec709').toLowerCase()
  if (input === 'unknown') return { ok: false, error: 'LUT 输入域无法从文件头确认；请先明确输入色彩空间，再挂载外部 LUT' }
  if (input === output) return { ok: true }
  return {
    ok: false,
    error: `LUT 输入域 ${input} 与当前输出域 ${output} 不匹配；不能因为文件名含 Rec709 就直接挂载`,
  }
}
