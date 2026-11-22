import { chooseStyleNode } from './style_node.mjs'

let failures = 0
const check = (name, condition, detail = '') => {
  if (!condition) {
    failures += 1
    console.error(`FAIL ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

const graph = [
  { node_index: 1, lut: 'MCP/panasonic-vlog-to-rec709.cube', label: '01 输入/还原起点', tools: ['LUT: panasonic-vlog-to-rec709'] },
  { node_index: 2, lut: '', label: '02 白平衡', tools: ['一级平衡'] },
  { node_index: 10, lut: '', label: '14 风格 LUT', tools: [] },
  { node_index: 11, lut: '', label: '15 质感', tools: [] },
]

const picked = chooseStyleNode(graph, 1)
check('请求 node1 时绝不选 node1', picked.ok && picked.nodeIndex === 10, JSON.stringify(picked))
check('优先选带“风格”标签的专用节点', picked.ok && picked.nodeIndex === 10)
check('保留输入还原 LUT 读回', picked.inputBefore === 'MCP/panasonic-vlog-to-rec709.cube')

const byRequest = chooseStyleNode(graph, 10)
check('显式指定专用风格节点时使用它', byRequest.ok && byRequest.nodeIndex === 10)

const afterFirst = graph.map((node) => node.node_index === 10 ? { ...node, lut: 'MCP/teal-orange.cube', tools: ['LUT: teal-orange'] } : node)
const second = chooseStyleNode(afterFirst, 1)
check('第二次点击复用已有风格 Node10，不串联到空 Node11', second.ok && second.nodeIndex === 10, JSON.stringify(second))
check('复用 Node10 时标记为替换而非新挂', second.ok && second.replaceExisting === true)

const styleWithOtherTool = afterFirst.map((node) => node.node_index === 10 ? { ...node, tools: ['LUT: teal-orange', '一级平衡'] } : node)
const fallback = chooseStyleNode(styleWithOtherTool, 1)
check('带其他工具的“风格”节点不被覆盖，且无专用节点时拒绝', fallback.ok === false, JSON.stringify(fallback))

const noDedicated = chooseStyleNode([
  { node_index: 1, lut: 'MCP/panasonic-vlog-to-rec709.cube', label: '输入', tools: ['LUT'] },
  { node_index: 2, lut: '', label: '02 白平衡', tools: ['一级平衡'] },
  { node_index: 11, lut: '', label: '15 质感', tools: [] },
])
check('没有专用风格节点时拒绝，不改质感节点', noDedicated.ok === false, JSON.stringify(noDedicated))

const noSafe = chooseStyleNode([
  { node_index: 1, lut: 'MCP/panasonic-vlog-to-rec709.cube', label: '输入', tools: ['LUT'] },
  { node_index: 2, lut: 'MCP/look.cube', label: '02 白平衡', tools: ['一级平衡'] },
])
check('没有专用空节点时拒绝而不是覆盖', noSafe.ok === false)
check('没有专用空节点时不返回 node1', noSafe.nodeIndex === undefined)

if (failures) {
  console.error(`FAIL style_node.test.mjs — ${failures} 项`)
  process.exitCode = 1
} else {
  console.log('PASS style_node.test.mjs')
}
