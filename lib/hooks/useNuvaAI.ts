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
    setIsStreaming(true) // ✅ 當送出時，設定成 streaming 中

    try {
      // 先把使用者的輸入記錄到聊天訊息
      setMessages(prev => [...prev, { role: 'user', content: input }])

      const res = await fetch('http://localhost:6500/interact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user_test_001',
          voiceTranscript: input,
          screenshotAnalysis: '這是一個課程票券的購買頁面',
          pageUrl: 'https://nuva.store/products/aroma1',
          cartItems: [
            { title: 'chatgpt lv1', price: 12800, productId: 'prod_001' }
          ]
        })
      })

      if (!res.body) {
        throw new Error('沒有收到回應 body')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let done = false
      let aiReply = ''

      // 先插入一個空的 assistant 訊息，等待後續更新
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
      setIsStreaming(false) // ✅ streaming 完成
    }
  }

  return {
    messages,
    loading,
    isStreaming, // ✅ 回傳 isStreaming 給前端用
    sendInteract,
  }
}
