from typing import Optional, Tuple

import requests

from core.config import OPENWEATHER_API_KEY

OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"


def fetch_weather(lat: float, lon: float) -> Optional[Tuple[float, float]]:
    """Returns (temperature_celsius, humidity_pct), or None if unavailable."""
    if not OPENWEATHER_API_KEY:
        return None
    try:
        response = requests.get(
            OPENWEATHER_URL,
            params={"lat": lat, "lon": lon, "appid": OPENWEATHER_API_KEY, "units": "metric"},
            timeout=5,
        )
        if response.status_code != 200:
            return None
        data = response.json()
        main = data.get("main", {})
        return main.get("temp"), main.get("humidity")
    except requests.exceptions.RequestException:
        return None
