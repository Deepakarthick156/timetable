import sys
import json
import urllib.request
import urllib.error

api_key = sys.argv[1]

models_to_test = [
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite-preview-02-05",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-001"
]

for model in models_to_test:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    data = json.dumps({"contents": [{"parts": [{"text": "Hello"}]}]}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode('utf-8'))
            print(f"[SUCCESS] {model}")
            sys.exit(0)
    except urllib.error.HTTPError as e:
        err = e.read().decode('utf-8')
        try:
            err_json = json.loads(err)
            reason = err_json.get("error", {}).get("message", err)
            print(f"[FAILED] {model}: {e.code} - {reason}")
        except:
            print(f"[FAILED] {model}: {e.code} - {err}")
    except Exception as e:
        print(f"[FAILED] {model}: {e}")

print("No working model found.")
sys.exit(1)
