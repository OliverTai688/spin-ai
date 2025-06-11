'use client';

import { useState } from 'react';
import { useNuvaAI } from '@/lib/hooks/useNuvaAI';
import SpeechButton from './SpeechButton';

export default function NuiChatModal() {
  const { messages, loading, sendInteract } = useNuvaAI();
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (input.trim()) {
      sendInteract(input);
      setInput('');
    }
  };

  return (
    <>
      {/* 按鈕開啟對話視窗 */}
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        開始與 ReflectWiseAI 通話
      </button>

      {/* 對話框視窗 */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-2xl font-bold mb-4">🧠 ReflectwiseAI 助理 - Nui</h2>

            <div className="flex flex-col gap-2 mb-4 h-80 overflow-y-auto">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded ${msg.role === 'user' ? 'bg-blue-100 text-right' : 'bg-green-100 text-left'}`}
                >
                  {msg.role === 'user' ? '你：' : 'Nui：'} {msg.content}
                </div>
              ))}
            </div>

            <textarea
              className="w-full border rounded p-2 mb-2"
              placeholder="輸入或使用錄音..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
            />

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                {loading ? '請稍候...' : '發送'}
              </button>

              <SpeechButton onText={setInput} disabled={loading} />
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
            >
              關閉對話
            </button>
          </div>
        </div>
      )}
    </>
  );
}
