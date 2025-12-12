import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    # 1. Get Token
    print("Getting token...")
    auth_data = {"username": "testuser", "password": "password"}
    try:
        response = requests.post(f"{BASE_URL}/users/token/", json=auth_data)
        if response.status_code != 200:
            print(f"Failed to get token: {response.status_code} {response.text}")
            return
        
        token = response.json().get("access")
        print("Token obtained successfully.")
    except Exception as e:
        print(f"Error connecting: {e}")
        return

    # 2. Create Event
    print("\nCreating event...")
    headers = {"Authorization": f"Bearer {token}"}
    event_data = {
        "start_time": "2025-12-15T10:00:00Z",
        "end_time": "2025-12-15T12:00:00Z",
        "event_type": "lecture"
        # Course and Room should default to Dummy if omitted
    }
    
    response = requests.post(f"{BASE_URL}/calendar/create/", json=event_data, headers=headers)
    print(f"Create Event Status: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    test_api()
