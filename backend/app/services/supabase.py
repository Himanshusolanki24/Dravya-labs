import requests
from app.core.config import settings

headers = {
    "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def insert_row(table: str, data: dict):
    url = f"{settings.SUPABASE_URL}/rest/v1/{table}"
    response = requests.post(url, json=data, headers=headers)
    response.raise_for_status()

def fetch_row_by_id(table: str, column: str, value: str):
    url = f"{settings.SUPABASE_URL}/rest/v1/{table}?{column}=eq.{value}&select=*"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    data = response.json()
    return data[0] if data else None
