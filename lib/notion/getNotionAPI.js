import { NotionAPI as NotionLibrary } from 'notion-client'
import BLOG from '@/blog.config'
import {
  adapterNotionBlockMap,
  pickNotionSpaceId
} from '@/lib/utils/notion.util'

const notionAPI = getNotionAPI()

function getNotionAPI() {
  const api = new NotionLibrary({
    apiBaseUrl: BLOG.API_BASE_URL || 'https://www.notion.so/api/v3', // https://[xxxxx].notion.site/api/v3
    activeUser: BLOG.NOTION_ACTIVE_USER || null,
    authToken: BLOG.NOTION_TOKEN_V2 || null,
    userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
  return patchNotionAPIForV3RecordMap(api)
}

/**
 * notion-client@6 按旧结构读 block.value.type，也没有带 spaceId。
 * Notion 现在返回双层 value，queryCollection 还要求 x-notion-space-id，
 * 不补这两处构建期会连续 400，最后把 categoryOptions 弄成空对象。
 */
function patchNotionAPIForV3RecordMap(api) {
  const origFetch = api.fetch.bind(api)
  let cachedSpaceId = null

  api.fetch = async function patchedFetch(opts = {}) {
    const headers = { ...(opts.headers || {}) }
    if (cachedSpaceId && !headers['x-notion-space-id']) {
      headers['x-notion-space-id'] = cachedSpaceId
    }

    const body = opts.body
    if (
      opts.endpoint === 'queryCollection' &&
      body &&
      !body.source &&
      body.collection?.id
    ) {
      body.source = { type: 'collection', id: body.collection.id }
    }

    const res = await origFetch({ ...opts, headers })
    if (opts.endpoint === 'loadPageChunk') {
      const spaceId = pickNotionSpaceId(res?.recordMap)
      if (spaceId) cachedSpaceId = spaceId
    }
    if (res?.recordMap) {
      res.recordMap = adapterNotionBlockMap(res.recordMap)
    }
    return res
  }

  return api
}

export default notionAPI
