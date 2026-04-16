import { useEffect } from 'react'

const TOKEN = process.env.NEXT_PUBLIC_DIFY_CHATBOT_TOKEN
const BASE_URL = process.env.NEXT_PUBLIC_DIFY_CHATBOT_BASE_URL || 'https://udify.app'

export default function DifyChatbot() {
  useEffect(() => {
    if (!TOKEN) return

    window.difyChatbotConfig = { token: TOKEN, baseUrl: BASE_URL }

    const script = document.createElement('script')
    script.src = `${BASE_URL}/embed.min.js`
    script.id = TOKEN
    script.defer = true
    document.body.appendChild(script)

    return () => {
      document.getElementById(TOKEN)?.remove()
    }
  }, [])

  return null
}
