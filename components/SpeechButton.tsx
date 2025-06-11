'use client'

import { useSpeechRecognition } from '@/lib/hooks/useSpeechRecognition'

export default function SpeechButton({
  onText,
  disabled,
}: {
  onText: (text: string) => void
  disabled: boolean
}) {
  const { start, recording } = useSpeechRecognition(onText)

  return (
    <button
      onClick={start}
      disabled={recording || disabled}
      className={`px-6 rounded-lg font-medium text-white 
        ${recording ? 'bg-gradient-to-r from-red-600 to-yellow-500' : 'bg-gradient-to-r from-green-600 to-blue-500'} 
        hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50`}
    >
      {recording ? '錄音中...' : '開始錄音'}
    </button>
  )
}
