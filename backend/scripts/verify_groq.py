import os
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv()

key = os.getenv('GROQ_API_KEY')
print(f"Key loaded: {key[:10]}...")

payload = json.dumps({
    "model": "llama-3.3-70b-versatile",
    "messages": [{"role": "user", "content": "Hello, are you working?"}],
    "max_tokens": 10
}).encode('utf-8')

req = urllib.request.Request(
    "https://api.groq.com/openai/v1/chat/completions",
    data=payload,
    headers={
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    },
    method="POST"
)

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        print("GROQ SUCCESS")
        print(f"Reply: {result['choices'][0]['message']['content']}")
except Exception as e:
    print(f"GROQ FAILURE: {e}")
