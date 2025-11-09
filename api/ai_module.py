import os
import requests
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize OpenRouter API client
client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

# Global headers for summarization models (Hugging Face fallbacks)
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
    "HTTP-Referer": "https://chat-summarizer.zeabur.app",  # required by OpenRouter
    "X-Title": "Chat Summarizer"
}

# Optional fallback model endpoints (for summary)
MODEL_URLS = [
    "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
    "https://api-inference.huggingface.co/models/google/flan-t5-base"
]

# ✅ Get AI response using OpenRouter
def get_ai_response(messages):
    try:
        print("🧠 Sending chat completion request to OpenRouter...")
        response = client.chat.completions.create(
            model="mistralai/mixtral-8x7b",  # ✅ correct model ID
            messages=messages,
            max_tokens=300
        )

        ai_message = response.choices[0].message.content.strip()
        print("✅ AI Response:", ai_message[:120], "...")
        return ai_message

    except Exception as e:
        print("❌ AI Error:", e)
        return "⚠️ Sorry, OpenRouter model could not generate a response."


# ✅ Summarize conversation using fallback models
def summarize_conversation(conversation_text):
    """
    Summarizes the conversation text using Hugging Face fallback models.
    """
    for model_url in MODEL_URLS:
        try:
            payload = {"inputs": f"Summarize this conversation:\n{conversation_text}"}
            print(f"🧩 Trying summarization model: {model_url}")
            response = requests.post(model_url, headers=headers, json=payload, timeout=25)
            response.raise_for_status()
            data = response.json()

            if isinstance(data, list) and len(data) > 0 and "generated_text" in data[0]:
                summary = data[0]["generated_text"].strip()
                print("✅ Summary generated successfully.")
                return summary

        except Exception as e:
            print(f"⚠️ Summary model failed ({model_url}): {e}")
            continue

    return "⚠️ Could not summarize (all models unavailable)."
