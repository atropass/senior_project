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
    response_dict = response.json()
    # Check if the request was successful
    if 'detail' in response_dict:
        for i in range(10):
            print(f"Attempt {i + 1}: Retrying pronunciation request...")
            response = requests.post(
                url=api_url,
                headers={
                    'Authorization': f"Bearer {api_key}",
                    'Content-Type': 'application/json',
                },
                json={
                    'source_language': 'kaz',
                    'target_language': 'kaz',
                    'text': word
                }
            )
            response_dict = response.json()
            if 'detail' not in response_dict:
                break
            if i == 9:
                raise Exception(f"Error fetching pronunciation after 10 attempts: {response.status_code} - {response.text}")

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error fetching pronunciation: {response.status_code} - {response.text}")
