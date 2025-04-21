import requests
import dotenv
import os

def get_pronunciation(word: str):
    # Load environment variables from .env file
    dotenv.load_dotenv()

    # Get API URL and key from environment variables
    api_url = os.getenv("SOYLE_API_URL")
    api_key = os.getenv("SOYLE_API_KEY")

    # Make a request to the API
    response = requests.post(
        url=api_url,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "source_language": "kaz",
            "target_language": "kaz",
            "text": word
        }
    )

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error fetching pronunciation: {response.status_code} - {response.text}")
