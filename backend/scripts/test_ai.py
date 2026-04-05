import os
import requests
import json

# Backend URL
url = "http://127.0.0.1:8000/api/ai/refine/"

# Test data
data = {
    "section": "Skills",
    "content": "Python, Django, React"
}

try:
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
