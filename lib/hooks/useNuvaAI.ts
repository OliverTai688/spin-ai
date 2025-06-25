import { useState } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function useNuvaAI() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false) // ✅ 加上 isStreaming 狀態

  const sendInteract = async (input: string) => {
  setLoading(true)
  setIsStreaming(true)

  // 👤 將使用者輸入加進 messages 陣列（但先不要 setMessages）
  const newMessages: Message[] = [...messages, { role: 'user', content: input }]


  try {
    // 🔥 改為傳送完整 messages 陣列給後端
    const res = await fetch('http://localhost:6500/interact/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user_test_001',
        voiceTranscript: input,
        screenshotAnalysis: '這是一個客戶分析的頁面',
        // pageUrl: 'https://spin/customer',
        // cartItems: [
        //   { title: 'chatgpt lv1', price: 12800, productId: 'prod_001' }
        // ],
        messages: newMessages, // ✅ 關鍵：後端 需要這個欄位
      })
    })

    if (!res.body) {
      throw new Error('沒有收到回應 body')
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let done = false
    let aiReply = ''

    // ✅ 加上使用者的訊息
    setMessages(newMessages)

    // ✅ 插入空的 AI 訊息，稍後會被更新
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      if (value) {
        const chunk = decoder.decode(value)
        aiReply += chunk
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: aiReply }
          return updated
        })
      }
    }

  } catch (err) {
    console.error('❌ AI 互動錯誤:', err)
    setMessages(prev => [...prev, { role: 'assistant', content: '❌ 無法連接 AI API，請檢查伺服器是否啟動' }])
  } finally {
    setLoading(false)
    setIsStreaming(false)
  }
}


  return {
    messages,
    loading,
    isStreaming, // ✅ 回傳 isStreaming 給前端用
    sendInteract,
  }
}
