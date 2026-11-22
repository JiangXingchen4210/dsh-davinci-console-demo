/** 从真实节点图选择独立创意风格节点；Node1 永远是输入还原，不可写。 */
export function chooseStyleNode(nodes, requested = null) {
  const list = Array.isArray(nodes) ? nodes : []
  const inputNode = list.find((node) => Number(node.node_index) === 1) ?? null
  const inputBefore = String(inputNode?.lut ?? '')
  const isDedicatedStyleNode = (node) => {
    if (Number(node.node_index) <= 1) return false
    if (!/风格|look|style/i.test(String(node.label ?? ''))) return false
    const tools = node.tools ?? []
    // 只允许空节点或仅含 LUT 工具的专用风格节点；带其他工具说明不是纯风格节点。
    return tools.every((tool) => /^LUT\b/i.test(String(tool)))
  }
  const dedicated = list.filter((node) => isDedicatedStyleNode(node))
  const requestedIndex = Number(requested) || null
  const requestedNode = requestedIndex && requestedIndex > 1
    ? dedicated.find((node) => Number(node.node_index) === requestedIndex) ?? null
    : null
  const chosen = requestedNode ?? dedicated[dedicated.length - 1] ?? null
  const candidates = dedicated.map((node) => ({ nodeIndex: Number(node.node_index), label: node.label ?? null, hasLut: Boolean(String(node.lut ?? '').trim()) }))
  if (!chosen) {
    return {
      ok: false,
      error: '没有专用的空/风格 LUT 节点：拒绝写入 Node1、质感节点或覆盖带其他工具的节点；请先建一个空 Creative Look 节点',
      inputBefore,
      candidates,
    }
  }
  return {
    ok: true,
    nodeIndex: Number(chosen.node_index),
    label: chosen.label ?? null,
    replaceExisting: Boolean(String(chosen.lut ?? '').trim()),
    existingLut: String(chosen.lut ?? ''),
    inputBefore,
    inputNodeIndex: 1,
    candidates,
  }
}
