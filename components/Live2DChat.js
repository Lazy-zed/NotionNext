import { useState, useEffect, useRef } from 'react'

export default function Live2DChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '你好！我是小助手，有什么可以帮你的吗？' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: newMessages.map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
            })),
            systemInstruction: {
              parts: [{ text: '你是一个清爽可爱的学生风男生助手，说话简洁友好，偶尔用一些轻松的语气，但不过分卖萌。' }]
            }
          })
        }
      )
      const data = await res.json()
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '抱歉，我没有理解你的问题。'
      setMessages([...newMessages, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: '网络出错了，请稍后再试。' }])
    }
    setLoading(false)
  }

  return (
    <div className='fixed right-6 top-1/3 z-50 flex flex-col items-end'>
      {/* 对话框 */}
      {open && (
        <div className='mb-4 w-[28rem] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700'>
          <div className='bg-blue-400 px-5 py-4 flex items-center justify-between'>
            <span className='text-white font-bold text-base'>✨ 小助手</span>
            <button onClick={() => setOpen(false)} className='text-white text-xl leading-none'>×</button>
          </div>
          <div className='flex-1 overflow-y-auto p-4 space-y-3 max-h-[27rem]'>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-400 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className='flex justify-start'>
                <div className='bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm text-sm text-gray-500'>
                  思考中...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className='p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2'>
            <input
              className='flex-1 text-sm px-4 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:border-blue-400'
              placeholder='输入消息...'
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className='bg-blue-400 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-full disabled:opacity-50'>
              发送
            </button>
          </div>
        </div>
      )}

      {/* 提示文字 + 头像 */}
      <div className='flex flex-col items-center gap-2'>
        {!open && (
          <div
            className='px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-md border border-blue-200 cursor-pointer'
            onClick={() => setOpen(true)}
            style={{ fontFamily: '"Ma Shan Zheng", "ZCOOL XiaoWei", cursive' }}>
            <span className='text-blue-400 text-2xl font-medium whitespace-nowrap'>点击和我聊天吧~</span>
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className='w-48 h-48 rounded-full overflow-hidden shadow-lg border-2 border-blue-300 hover:scale-110 transition-transform'
          title='和我聊天吧'>
          <img
            src='https://www.keaitupian.cn/cjpic/frombd/1/253/3689025110/3372143749.jpg'
            alt='助手'
            className='w-full h-full object-cover'
          />
        </button>
      </div>
    </div>
  )
}
