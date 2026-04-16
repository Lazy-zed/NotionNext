export default function getAllPageIds(collectionQuery, collectionId, collectionView, viewIds) {
  if (!collectionQuery && !collectionView) {
    return []
  }

  const pageSet = new Set()

  // 策略1：从 collectionView 的 page_sort 取（有顺序）
  // 兼容 Notion 新格式（双层 .value.value）和旧格式（单层 .value）
  if (collectionView && viewIds?.length > 0) {
    const targetViewId = viewIds[0]
    const viewEntry = collectionView?.[targetViewId]
    const pageSort =
      viewEntry?.value?.value?.page_sort ??  // 新格式
      viewEntry?.value?.page_sort            // 旧格式
    if (Array.isArray(pageSort) && pageSort.length > 0) {
      pageSort.forEach(id => pageSet.add(id))
    }
  }

  // 策略2：从 collectionQuery 兜底，同时兼容多种路径
  if (collectionQuery && collectionId) {
    const viewQuery = collectionQuery?.[collectionId]
    if (viewQuery) {
      Object.values(viewQuery).forEach(viewData => {
        // 兼容旧格式 blockIds、新格式 collection_group_results、results 等路径
        ;[
          viewData?.blockIds,
          viewData?.collection_group_results?.blockIds,
          viewData?.results?.blockIds,
        ].forEach(ids => {
          if (Array.isArray(ids)) ids.forEach(id => pageSet.add(id))
        })
        // 分组视图
        if (Array.isArray(viewData?.collection_group_results?.results)) {
          viewData.collection_group_results.results.forEach(group => {
            group?.blockIds?.forEach(id => pageSet.add(id))
          })
        }
      })
    }
  }

  return [...pageSet]
}
