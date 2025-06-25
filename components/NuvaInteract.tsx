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

  const [, setShowIntroCard] = useState(true);

  const suggestionPrompts = [
    {
      label: "模擬：台商資產傳承個案對話",
      content: `我想進行一段 SPIN 模擬對話。

我是業務員，開始對話模擬。`
    },
    {
      label: "學習：我想了解 SPIN 框架怎麼用",
      content: `我是一名新業務員，想要學習如何使用 SPIN 提問技巧來進行銷售。

請你依據 SPIN 四個階段（S/P/I/N）幫我解釋每個階段的目標與提問範例，並給我一些使用建議。`
    }
  ];


  useEffect(() => {
    if (messages.length > 0) {
      setShowIntroCard(false);
    }
  }, [messages]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (
      readyToSpeak &&
      messages.length > prevMessagesLength.current &&
      !isStreaming
    ) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant" && lastMsg.content.trim()) {
        // speak(lastMsg.content);
      }
      prevMessagesLength.current = messages.length;
    }
  }, [messages, readyToSpeak, isStreaming]);

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

  return (
    <div
    className="p-6 max-w-6xl mx-auto flex flex-col md:flex-row gap-6
               bg-white/70 backdrop-blur-md border border-blue-100 
               rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
    onClick={handleClickAnywhere}
  >
      {/* 左側輸入區塊 */}
<div className="flex-1 flex flex-col space-y-4">
  <h2 className="text-3xl font-bold text-blue-800 text-center">超級業務提問系統</h2>
  <p className="text-center text-blue-500 text-sm">
    引導式銷售對話．語音互動支援．幫助你精準成交
  </p>

  <Card className="bg-blue-50/60 border border-blue-100 shadow-sm rounded-xl p-4 space-y-3">
    <p className="text-blue-800 text-sm leading-relaxed">
      👋 你好，我是 <span className="font-bold">超級提問教練</span>。
      <br />
      請描述你想練習的銷售情境，或點選下方的建議主題，我將用{" "}
      <strong>SPIN 模型</strong> 引導你完成一次高效的對話練習。
    </p>
    <div className="flex flex-wrap gap-2">
      {suggestionPrompts.map((opt, idx) => (
        <Button
          key={idx}
          variant="outline"
          className="rounded-full border-blue-300 text-blue-700 hover:bg-blue-100"
          onClick={() => {
            sendInteract(opt.content);
            setReadyToSpeak(true);
          }}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  </Card>

  <Textarea
    placeholder="此處可輸入..."
    value={input}
    onChange={handleInputChange}
    rows={3}
    className="p-4 border border-gray-300 rounded-lg shadow-sm 
               focus:ring-2 focus:ring-blue-500 focus:outline-none"
  />

  <div className="flex gap-2">
    <Button
      onClick={handleSubmit}
      disabled={loading || !input.trim()}
      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white 
                 hover:from-blue-700 hover:to-blue-600 rounded-xl 
                 shadow-md hover:shadow-lg focus:outline-none 
                 focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:bg-gray-300"
    >
      {loading ? "請稍候..." : "送出"}
    </Button>
    <SpeechButton onText={setInput} disabled={loading} />
  </div>
</div>

{/* 右側對話區塊 */}
<div className="flex-1 max-h-[70vh] overflow-y-auto bg-white border shadow-inner rounded-xl p-4">
  <ScrollArea className="h-full pr-2">
    <div className="space-y-3">
      {messages.map((msg, idx) => (
        <Card
          key={idx}
          className={`max-w-full ${msg.role === "user"
            ? "ml-auto bg-gradient-to-r from-blue-500 to-blue-400 text-white"
            : "mr-auto bg-gray-100 border text-gray-800"
            } rounded-xl p-3 shadow`}
        >
          <CardContent className="text-sm whitespace-pre-wrap px-0">
            <span className="block text-xs font-semibold mb-1 opacity-80">
              {msg.role === "user" ? "你" : "超級教練"}
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
                      <p className="font-semibold text-blue-700 text-base">
                        Step {stepNumber}
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {chunk.trim()}
                      </p>
                    </div>
                  );
                })
            ) : (
              <p>{msg.content}</p>
            )}
          </CardContent>
        </Card>
      ))}
      <div ref={bottomRef} />
    </div>
  </ScrollArea>
</div>

    </div>
  );
}
