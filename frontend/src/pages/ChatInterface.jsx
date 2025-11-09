import React, { useEffect, useState } from "react";
import {
  createConversation,
  getConversationHistory,
} from "../api/api";
import ChatBox from "../components/ChatBox";
import Sidebar from "../components/Sidebar";

export default function ChatInterface() {
  const [convoId, setConvoId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [creating, setCreating] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const startConversation = async () => {
    try {
      setCreating(true);
      const res = await createConversation("New Chat");
      setConvoId(res.data.id);
      setMessages([]);
      setRefreshFlag((prev) => prev + 1);
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setCreating(false);
    }
  };

  const openConversation = async (id) => {
    try {
      const res = await getConversationHistory(id);
      setConvoId(id);
      setMessages(res.data.messages);
    } catch (err) {
      console.error("Error loading chat history:", err);
    }
  };

  useEffect(() => {
    const refreshListener = () => setRefreshFlag((prev) => prev + 1);
    window.addEventListener("chat-ended", refreshListener);
    return () => window.removeEventListener("chat-ended", refreshListener);
  }, []);

  return (
    <div className="h-screen flex bg-gray-950 text-white">
      <Sidebar
        onSelectChat={openConversation}
        onNewChat={startConversation}
        activeId={convoId}
        refreshFlag={refreshFlag}
      />

      <div className="flex-1 flex flex-col">
        <header className="p-4 text-xl font-bold border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-950 z-10">
          <span>💬 Chat Summariser Portal</span>
          {convoId && (
            <button
              onClick={() => setConvoId(null)}
              className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg"
            >
              🗑️ Clear Chat
            </button>
          )}
        </header>

        <main className="flex-1 flex flex-col">
          {!convoId ? (
            <div className="flex-1 flex justify-center items-center text-gray-400">
              Select a chat or start a new one 👆
            </div>
          ) : (
            <ChatBox convoId={convoId} initialMessages={messages} />
          )}
        </main>
      </div>
    </div>
  );
}
