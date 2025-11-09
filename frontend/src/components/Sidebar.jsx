import React, { useEffect, useState } from "react";
import { getAllConversations } from "../api/api";

export default function Sidebar({ onSelectChat, onNewChat, activeId, refreshFlag }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);

  // Fetch all chats whenever refreshFlag changes
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await getAllConversations();
        setConversations(res.data);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [refreshFlag]);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute top-3 left-3 md:hidden bg-gray-800 px-3 py-1 rounded-md text-white z-50"
      >
        {open ? "✖" : "☰"}
      </button>

      <div
        className={`fixed md:static h-full md:h-auto z-40 bg-gray-900 text-white p-4 flex flex-col border-r border-gray-800 transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 w-64`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">🗂️ Chats</h2>
          <button
            onClick={onNewChat}
            className="bg-green-600 hover:bg-green-500 text-sm px-2 py-1 rounded-lg"
          >
            ➕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-700">
          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="text-gray-500 text-sm">No conversations yet.</p>
          ) : (
            conversations.map((chat) => (
              <button
                key={chat.id}
                onClick={() => {
                  onSelectChat(chat.id);
                  if (window.innerWidth < 768) setOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-lg transition ${
                  activeId === chat.id
                    ? "bg-blue-600"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                {chat.title || `Chat ${chat.id}`}
                {chat.summary && (
                  <p className="text-xs text-gray-400 truncate">
                    {chat.summary.slice(0, 40)}...
                  </p>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
