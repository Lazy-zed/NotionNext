export default function getAllPageIds(collectionQuery, collectionId, collectionView, viewIds) {
  if (!collectionQuery && !collectionView) {
    return []
  }

  let pageIds = []

  // 优先从第一个视图取
  if (viewIds && viewIds.length > 0) {
    try {
      const view = collectionQuery?.[collectionId]?.[viewIds[0]]
      const ids =
        view?.collection_group_results?.blockIds ||
        view?.blockIds
      if (ids && ids.length > 0) {
        pageIds = [...ids]
      }
    } catch (error) {
      console.error('Error fetching page IDs from primary view:', error)
      // 不 return，继续走兜底
    }
  }

  // 兜底：遍历所有视图
  if (pageIds.length === 0 && collectionQuery) {
    const pageSet = new Set()
    const collData = collectionQuery[collectionId] || collectionQuery[Object.keys(collectionQuery)[0]]
    Object.values(collData || {}).forEach(view => {
      view?.blockIds?.forEach(id => pageSet.add(id))
      view?.collection_group_results?.blockIds?.forEach(id => pageSet.add(id))
    })
    pageIds = [...pageSet]
  }

  return pageIds
}
