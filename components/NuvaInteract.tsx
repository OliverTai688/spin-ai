"use client";

import { useState, useRef, useEffect } from "react";
import { useNuvaAI } from "@/lib/hooks/useNuvaAI";
import SpeechButton from "./SpeechButton";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

export default function NuvaInteract() {
  const { messages, loading, isStreaming, sendInteract } = useNuvaAI();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(0);
  const [readyToSpeak, setReadyToSpeak] = useState(false);
  const [pendingSpeech, setPendingSpeech] = useState<string | null>(null);

  const handleSubmit = () => {
    if (input.trim()) {
      sendInteract(input);
      setInput("");
      setReadyToSpeak(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setReadyToSpeak(true);
  };

  const handleClickAnywhere = () => {
    setReadyToSpeak(true);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 每次新 AI 回答時，安排說話
  useEffect(() => {
    if (
      readyToSpeak &&
      messages.length > prevMessagesLength.current &&
      !isStreaming
    ) {
      // ✅ 等 streaming 完成！
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant" && lastMsg.content.trim()) {
        // speak(lastMsg.content);
      }
      prevMessagesLength.current = messages.length;
    }
  }, [messages, readyToSpeak, isStreaming]);

  // 確保 voices 載入完成才說話
  useEffect(() => {
    if (typeof window !== "undefined") {
      const synth = window.speechSynthesis;
      if (!synth.getVoices().length) {
        synth.onvoiceschanged = () => {
          if (pendingSpeech) {
            //speak(pendingSpeech);
            setPendingSpeech(null);
          }
        };
      }
    }
  }, [pendingSpeech]);

  // const trySpeak = (text: string) => {
  //   const synth = window.speechSynthesis;
  //   if (synth.getVoices().length > 0) {
  //     speak(text);
  //   } else {
  //     setPendingSpeech(text);
  //   }
  // };

  // const speak = (text: string) => {
  //   const synth = window.speechSynthesis;

  //   console.log("🔵 準備播放文字:", text);

  //   if (synth.speaking) {
  //     console.log("🟡 目前正在播放，先取消");
  //     synth.cancel();
  //   }

  //   const voices = synth.getVoices();
  //   console.log("🟣 系統語音列表:", voices);

  //   const zhVoice =
  //     voices.find((voice) => voice.lang === "zh-TW") ||
  //     voices.find((voice) => voice.lang.startsWith("zh")) ||
  //     null;

  //   if (zhVoice) {
  //     console.log("✅ 選到中文語音:", zhVoice.name, zhVoice.lang);
  //   } else {
  //     console.log("⚠️ 沒有找到中文語音，使用預設");
  //   }

  //   const utterance = new SpeechSynthesisUtterance(text);
  //   utterance.lang = "zh-TW";
  //   if (zhVoice) {
  //     utterance.voice = zhVoice;
  //   }
  //   utterance.rate = 1.0;
  //   utterance.pitch = 1.2;
  //   utterance.volume = 1.0;

  //   // 🔥 加上語音事件監聽
  //   utterance.onstart = () => {
  //     console.log("🟢 語音播放開始");
  //   };
  //   utterance.onend = () => {
  //     console.log("✅ 語音播放結束");
  //   };
  //   utterance.onerror = (e) => {
  //     console.error("❌ 語音播放錯誤:", e.error);
  //   };

  //   console.log("🛫 呼叫 synth.speak() 開始播放");
  //   synth.speak(utterance);
  // };

  return (
    <div
      className="p-6 max-w-2xl mx-auto min-h-screen flex flex-col space-y-6 bg-gradient-to-r from-blue-50 via-gray-100 to-white rounded-lg shadow-xl"
      onClick={handleClickAnywhere}
    >
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">
        ReflectwiseAI 助理
      </h2>

      {/* 聊天紀錄區塊 */}
      <ScrollArea className="flex-1 mb-4 pr-2 rounded-lg bg-white shadow-sm">
        <div className="space-y-3 px-4 py-3">
          {messages.map((msg, idx) => (
            <Card
              key={idx}
              className={`max-w-full ${
                msg.role === "user"
                  ? "ml-auto bg-blue-100"
                  : "mr-auto bg-gray-100"
              } rounded-lg p-3 shadow-sm`}
            >
              <CardContent className="text-sm text-gray-800">
                <span className="block font-medium mb-1 text-gray-600">
                  {msg.role === "user" ? "你" : "Nui"}
                </span>
                {msg.role === "assistant" &&
                /\*\*Step \d\*\*[:：]/.test(msg.content) ? (
                  msg.content
                    .split(/\*\*Step (\d)\*\*[:：]/)
                    .filter(Boolean)
                    .map((chunk, index, arr) => {
                      if (index % 2 === 0) return null;
                      const stepNumber = arr[index - 1];
                      return (
                        <div key={index} className="mb-2">
                          <p className="font-semibold text-yellow-700">
                            Step {stepNumber}
                          </p>
                          <p className="whitespace-pre-wrap">{chunk.trim()}</p>
                        </div>
                      );
                    })
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </CardContent>
            </Card>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* 輸入區塊 */}
      <Textarea
        placeholder="輸入或錄音..."
        value={input}
        onChange={handleInputChange}
        rows={3}
        className="mb-4 p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />

      {/* 按鈕區塊 */}
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          className="flex-1 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {loading ? "請稍候..." : "發送"}
        </Button>

        <SpeechButton onText={setInput} disabled={loading} />
      </div>
    </div>
  );
}
