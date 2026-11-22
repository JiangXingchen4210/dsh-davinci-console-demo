/** LUT 输入域校验：Resolve Film Looks 标题/文件名含 Rec709，但 Input 行是 Cineon Log，必须判 log。 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { inspectLutDomain, lutCompatibleWithOutput } from './lut_domain.mjs'

let failures = 0
const check = (name, condition, detail = '') => {
  if (condition) console.log(`  pass ${name}`)
  else { failures += 1; console.error(`  FAIL ${name}${detail ? `: ${detail}` : ''}`) }
}

const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'lut-domain-'))
const logPath = path.join(dir, 'Rec709 Kodak 2383 D65.cube')
const recPath = path.join(dir, 'rec709-look.cube')
const unknownPath = path.join(dir, 'unlabeled.cube')
await fs.writeFile(logPath, [
  '# Resolve Film Look LUT',
  '#   Input: Cineon Log ',
  '#  Output: Kodak 2383 film stock look',
  '# Display: ITU-Rec.709, Gamma 2.4',
  'LUT_3D_SIZE 2',
  'DOMAIN_MIN 0.0 0.0 0.0',
  'DOMAIN_MAX 1.0 1.0 1.0',
  '0.0 0.0 0.0',
].join('\n'))
await fs.writeFile(recPath, [
  '# generated look',
  '# Rec.709 display in -> stylised Rec.709 display out',
  'LUT_3D_SIZE 2',
  'DOMAIN_MIN 0.0 0.0 0.0',
  'DOMAIN_MAX 1.0 1.0 1.0',
  '0.0 0.0 0.0',
].join('\n'))
await fs.writeFile(unknownPath, 'LUT_3D_SIZE 2\nDOMAIN_MIN 0 0 0\nDOMAIN_MAX 1 1 1\n0 0 0\n')

const log = await inspectLutDomain(logPath)
const rec = await inspectLutDomain(recPath)
const unknown = await inspectLutDomain(unknownPath)
check('Resolve Kodak 2383 的 Input:Cineon Log 判 log', log.inputDomain === 'log', log.inputDomain)
check('Rec709 生成 look 判 rec709', rec.inputDomain === 'rec709', rec.inputDomain)
check('log LUT 不能直接接 Rec709 输出', lutCompatibleWithOutput(log, 'rec709').ok === false)
check('rec709 LUT 可接 Rec709 输出', lutCompatibleWithOutput(rec, 'rec709').ok === true)
check('没有输入域说明的 LUT 不自动挂到 Rec709 输出', lutCompatibleWithOutput(unknown, 'rec709').ok === false)

await fs.rm(dir, { recursive: true, force: true })
if (failures) { console.error(`FAIL lut_domain.test.mjs — ${failures} 项`); process.exitCode = 1 }
else console.log('PASS lut_domain.test.mjs — LUT 输入域按文件头识别，不靠文件名')
