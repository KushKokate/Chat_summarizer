import React, { useEffect, useRef, useState } from "react";
import { sendMessage, endConversation } from "../api/api";

export default function ChatBox({ convoId, initialMessages = [] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setIsLoading(true);

    const userMessage = {
      sender: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await sendMessage(convoId, userMessage.content);
      const aiMessage = {
        sender: "ai",
        content: res.data.ai_response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "system",
          content: "⚠️ Failed to get AI response. Try again later.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnd = async () => {
    try {
      const res = await endConversation(convoId);
      const summaryMessage = {
        sender: "system",
        content: `🧾 Summary:\n\n${res.data.summary.replace(/\n/g, "\n\n")}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, summaryMessage]);
      window.dispatchEvent(new Event("chat-ended"));
    } catch (err) {
      console.error("Error ending conversation:", err);
    }
  };

  return (
    <div className="flex flex-col flex-1 p-4 bg-gray-950 text-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 scrollbar-thin scrollbar-thumb-gray-700">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start ${
              m.sender === "user"
                ? "justify-end"
                : m.sender === "ai"
                ? "justify-start"
                : "justify-center"
            }`}
          >
            {m.sender !== "system" && (
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-2 ${
                  m.sender === "user" ? "bg-blue-600" : "bg-gray-700"
                }`}
              >
                {m.sender === "user" ? "U" : "AI"}
              </div>
            )}
            <div
              className={`p-3 rounded-2xl max-w-[80%] break-words shadow-sm transition-all duration-300 whitespace-pre-wrap ${
                m.sender === "user"
                  ? "bg-blue-600 text-white"
                  : m.sender === "ai"
                  ? "bg-gray-700 text-gray-100"
                  : "bg-green-700 text-white italic text-sm"
              }`}
            >
              {m.content}
              {m.sender !== "system" && (
                <div className="text-xs text-gray-400 mt-1 text-right">
                  {new Date(m.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing animation */}
        {isLoading && (
          <div className="flex justify-start space-x-1 p-3">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.2s]"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.4s]"></span>
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-gray-800 pt-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 bg-gray-800 rounded-xl px-4 py-2 outline-none placeholder-gray-400"
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
        <button
          onClick={handleEnd}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl transition-all duration-200"
        >
          End
        </button>
      </div>
    </div>
  );
}
