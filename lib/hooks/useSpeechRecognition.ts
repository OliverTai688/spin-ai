import { useState, useEffect, useRef } from 'react'

declare global {
  interface Window {
    webkitSpeechRecognition: any
  }
}

export type SpeechRecognition = any
export type SpeechRecognitionEvent = any

export function useSpeechRecognition(onResult: (text: string) => void) {
  const [recording, setRecording] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition()
      Object.assign(recognition, {
        continuous: false,
        interimResults: false,
        lang: 'zh-TW',
      })

      recognition.onresult = (e: SpeechRecognitionEvent) => {
        const transcript = e.results[0][0].transcript
        onResult(transcript)
        setRecording(false)
      }

      recognition.onerror = () => setRecording(false)
      recognition.onend = () => setRecording(false)

      recognitionRef.current = recognition
    }
  }, [onResult])

  const start = () => {
    if (!recognitionRef.current) {
      alert('瀏覽器不支援語音辨識')
      return
    }
    setRecording(true)
    recognitionRef.current.start()
  }

  return { start, recording }
}
