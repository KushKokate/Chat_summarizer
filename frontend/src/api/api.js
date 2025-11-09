import axios from "axios";

const API_BASE = "https://chat-summarizer.zeabur.app/api";


// === Conversations ===
export const getConversations = () =>
  axios.get(`${API_BASE}/conversations/`);

export const getAllConversations = () =>
  axios.get(`${API_BASE}/conversations/all/`);

export const getConversationHistory = (id) =>
  axios.get(`${API_BASE}/conversations/${id}/history/`);

export const createConversation = (title) =>
  axios.post(`${API_BASE}/conversations/create/`, { title });

// === Messages ===
export const sendMessage = (id, content) =>
  axios.post(`${API_BASE}/conversations/${id}/send/`, {
    sender: "user",
    content,
  });

export const endConversation = (id) =>
  axios.post(`${API_BASE}/conversations/${id}/end/`);
