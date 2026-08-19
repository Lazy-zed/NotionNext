/**
 * Notion 数据格式清理工具
 * 旧版 block: { value: { id, type, ... } }
 * 新版 block: { spaceId, value: { value: { id, type, ... }, role? } }
 * 构建期 notion-client@6 只认旧版，必须先解包，否则查不到 collection。
 */
export function adapterNotionBlockMap(blockMap) {
  if (!blockMap) return blockMap

  return {
    ...blockMap,
    block: unwrapTable(blockMap.block),
    collection: unwrapTable(blockMap.collection),
    collection_view: unwrapTable(blockMap.collection_view)
  }
}

/**
 * 从 recordMap 里取出 workspace spaceId，给 queryCollection 补请求头用。
 */
export function pickNotionSpaceId(recordMap) {
  const tables = [
    recordMap?.block,
    recordMap?.collection,
    recordMap?.collection_view
  ]
  for (const table of tables) {
    if (!table || typeof table !== 'object') continue
    for (const item of Object.values(table)) {
      const spaceId =
        item?.spaceId ||
        item?.value?.space_id ||
        item?.value?.value?.space_id ||
        item?.value?.spaceId
      if (spaceId) return spaceId
    }
  }
  return null
}

function unwrapTable(table = {}) {
  if (!table || typeof table !== 'object') return {}
  const cleaned = {}
  for (const [id, item] of Object.entries(table)) {
    if (!item || typeof item !== 'object') {
      cleaned[id] = item
      continue
    }
    cleaned[id] = { value: unwrapValue(item) }
  }
  return cleaned
}

function unwrapValue(obj) {
  if (!obj) return obj
  let current = obj
  // Notion 现在可能套 1~2 层 { value }，剥到真正带 type/schema 的节点为止
  for (let i = 0; i < 5; i++) {
    if (!current || typeof current !== 'object') return current
    if (current.type || current.schema || current.properties) return current
    if (Object.prototype.hasOwnProperty.call(current, 'value')) {
      current = current.value
      continue
    }
    break
  }
  return current
}
