import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

def get_ai_response(messages):
    try:
        response = client.chat.completions.create(
            model="mistralai/mixtral-8x7b-instruct",  # ✅ corrected model ID
            messages=messages,
            max_tokens=200
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print("AI Error:", e)
        return "⚠️ Sorry, OpenRouter model could not generate a response."


def summarize_conversation(conversation_text):
    """
    Summarize the conversation using the same fallback logic.
    """
    for model_url in MODEL_URLS:
        try:
            payload = {"inputs": f"Summarize this conversation: {conversation_text}"}
            print(f"Trying summary model: {model_url}")
            response = requests.post(model_url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()

            if isinstance(data, list) and len(data) > 0 and "generated_text" in data[0]:
                return data[0]["generated_text"]
        except Exception as e:
            print(f"Summary model failed ({model_url}): {e}")
            continue

    return "⚠️ Could not summarize (all models unavailable)."
