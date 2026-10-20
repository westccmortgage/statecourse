"""Read-only API discovery through the configured HTTPS proxy; never print keys."""
import concurrent.futures
import json
import os
import urllib.error
import urllib.request


def check(provider, url, variable, header, prefix):
    key = os.environ.get(variable)
    if not key:
        return {"provider": provider, "status": "missing_key"}
    try:
        request = urllib.request.Request(url, headers={header: prefix + key})
        with urllib.request.urlopen(request, timeout=20) as response:
            data = json.load(response)
            models = data.get("data", data.get("models", []))
            candidates = [m.get("id", m.get("name", "")) for m in models]
            return {"provider": provider, "http": response.status,
                    "candidate_models": [m for m in candidates if any(
                        name in m for name in ("gpt-4.1-mini", "gemini-2.5-flash"))]}
    except urllib.error.HTTPError as error:
        return {"provider": provider, "http": error.code}
    except urllib.error.URLError as error:
        return {"provider": provider, "network_error": str(error.reason)}
    except Exception as error:
        return {"provider": provider, "error_type": type(error).__name__}


if __name__ == "__main__":
    with concurrent.futures.ThreadPoolExecutor() as executor:
        tasks = [executor.submit(check, *args) for args in [
            ("OpenAI", "https://api.openai.com/v1/models", "OPENAI_API_KEY", "Authorization", "Bearer "),
            ("Gemini", "https://generativelanguage.googleapis.com/v1beta/models", "GEMINI_API_KEY", "x-goog-api-key", ""),
        ]]
        print(json.dumps([task.result() for task in tasks], indent=2))
