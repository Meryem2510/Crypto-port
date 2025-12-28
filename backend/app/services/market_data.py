# app/services/market_data.py
import requests

# Map database symbols to CoinGecko IDs
SYMBOL_TO_COINGECKO_ID = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "ADA": "cardano"
}

def get_current_price(symbol: str) -> float:
    """
    Fetch current price in USD for a given crypto symbol.
    """
    coingecko_id = SYMBOL_TO_COINGECKO_ID.get(symbol.upper())
    if not coingecko_id:
        return 0.0  # Unknown symbol

    url = "https://api.coingecko.com/api/v3/simple/price"
    params = {
        "ids": coingecko_id,
        "vs_currencies": "usd"
    }
    response = requests.get(url, params=params)
    if response.status_code != 200:
        return 0.0

    data = response.json()
    return data.get(coingecko_id, {}).get("usd", 0.0)
