
export default function getAllPageIds(collectionQuery, collectionId, collectionView, viewIds) {
  if (!collectionQuery && !collectionView) return []

  let pageIds = []

  // 兼容新旧格式：从单个 view 中提取 blockIds
  function extractBlockIds(view) {
    if (!view) return []
    const ids = new Set()
    // 旧格式
    view?.blockIds?.forEach(id => ids.add(id))
    // 新格式 - collection_group_results
    view?.collection_group_results?.blockIds?.forEach(id => ids.add(id))
    // 新格式 - reducerResults
    view?.reducerResults?.collection_group_results?.blockIds?.forEach(id => ids.add(id))
    // 分组视图 - groups 下的 blockIds
    if (view?.collection_group_results?.results) {
      view.collection_group_results.results.forEach(group => {
        group?.blockIds?.forEach(id => ids.add(id))
      })
    }
    return [...ids]
  }

  // 优先按 viewIds[0] 排序
  try {
    const collectionQueryById = collectionQuery?.[collectionId]
    if (viewIds && viewIds.length > 0 && collectionQueryById) {
      const firstView = collectionQueryById[viewIds[0]]
      if (firstView) {
        pageIds = extractBlockIds(firstView)
      }
    }
  } catch (error) {
    console.error('Error fetching page IDs (primary):', error)
    // 不再直接 return，继续走兜底逻辑
  }

  // 兜底：遍历所有视图
  if (pageIds.length === 0) {
    try {
      const collectionQueryById = collectionQuery?.[collectionId]
      if (collectionQueryById) {
        const pageSet = new Set()
        Object.values(collectionQueryById).forEach(view => {
          extractBlockIds(view).forEach(id => pageSet.add(id))
        })
        pageIds = [...pageSet]
      }
    } catch (error) {
      console.error('Error fetching page IDs (fallback):', error)
    }
  }

  return pageIds
}
