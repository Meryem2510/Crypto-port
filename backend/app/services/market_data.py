# app/services/market_data.py
import requests
import time
from decimal import Decimal
import logging
from functools import lru_cache

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Map database symbols to CoinGecko IDs
SYMBOL_TO_COINGECKO_ID = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "ADA": "cardano"
    # Add more as needed
}

# Global cache
_price_cache = {}
_CACHE_DURATION = 60  # Cache for 60 seconds
_LAST_BULK_FETCH_TIME = 0
_BULK_CACHE_DURATION = 30  # Bulk fetch every 30 seconds

def _fetch_from_coingecko(symbols: list = None) -> dict:
    """
    Fetch prices from CoinGecko API.
    If symbols provided, fetch specific ones. Otherwise fetch all.
    """
    try:
        if symbols:
            # Fetch specific symbols
            coin_ids = [SYMBOL_TO_COINGECKO_ID.get(s.upper()) for s in symbols]
            coin_ids = [cid for cid in coin_ids if cid]  # Remove None
            
            if not coin_ids:
                return {}
                
            url = "https://api.coingecko.com/api/v3/simple/price"
            params = {
                "ids": ",".join(coin_ids),
                "vs_currencies": "usd",
                "precision": "full"
            }
        else:
            # Fetch all mapped symbols
            coin_ids = list(SYMBOL_TO_COINGECKO_ID.values())
            url = "https://api.coingecko.com/api/v3/simple/price"
            params = {
                "ids": ",".join(coin_ids),
                "vs_currencies": "usd",
                "precision": "full"
            }
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json"
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        
        if response.status_code != 200:
            if response.status_code == 429:
                logger.warning("Rate limit exceeded. Using cached values.")
            else:
                logger.error(f"CoinGecko API error: {response.status_code} - {response.text}")
            return {}
        
        data = response.json()
        return data
        
    except Exception as e:
        logger.error(f"Error fetching from CoinGecko: {e}")
        return {}

def get_current_price(symbol: str) -> Decimal:
    """
    Fetch current price with caching to avoid rate limits.
    """
    symbol_upper = symbol.upper()
    current_time = time.time()
    
    # Check cache first
    if symbol_upper in _price_cache:
        price, timestamp = _price_cache[symbol_upper]
        if current_time - timestamp < _CACHE_DURATION:
            return price
    
    # Cache miss or expired - fetch fresh price
    coingecko_id = SYMBOL_TO_COINGECKO_ID.get(symbol_upper)
    if not coingecko_id:
        logger.warning(f"Unknown symbol: {symbol}")
        return Decimal("0.0")
    
    # Try bulk fetch first (more efficient)
    global _LAST_BULK_FETCH_TIME
    if current_time - _LAST_BULK_FETCH_TIME > _BULK_CACHE_DURATION:
        logger.info("Performing bulk price fetch...")
        bulk_data = _fetch_from_coingecko()
        if bulk_data:
            _LAST_BULK_FETCH_TIME = current_time
            # Update cache with all fetched prices
            for sym, cg_id in SYMBOL_TO_COINGECKO_ID.items():
                if cg_id in bulk_data and "usd" in bulk_data[cg_id]:
                    price = Decimal(str(bulk_data[cg_id]["usd"]))
                    _price_cache[sym] = (price, current_time)
            
            # Return requested price if available
            if symbol_upper in _price_cache:
                return _price_cache[symbol_upper][0]
    
    # If bulk fetch failed or symbol not in bulk, fetch single
    logger.info(f"Fetching single price for {symbol}...")
    data = _fetch_from_coingecko([symbol])
    
    if data and coingecko_id in data and "usd" in data[coingecko_id]:
        price = Decimal(str(data[coingecko_id]["usd"]))
        _price_cache[symbol_upper] = (price, current_time)
        return price
    
    # If API call failed, return cached value even if expired, or 0
    if symbol_upper in _price_cache:
        price, _ = _price_cache[symbol_upper]
        logger.warning(f"API failed, using expired cache for {symbol}: ${price}")
        return price
    
    logger.error(f"Failed to fetch price for {symbol}")
    return Decimal("0.0")

# Optional: Batch function for fetching multiple prices at once
def get_current_prices(symbols: list) -> dict:
    """Fetch multiple prices efficiently in one API call."""
    current_time = time.time()
    result = {}
    
    # Check cache for each symbol
    symbols_to_fetch = []
    for symbol in symbols:
        symbol_upper = symbol.upper()
        if symbol_upper in _price_cache:
            price, timestamp = _price_cache[symbol_upper]
            if current_time - timestamp < _CACHE_DURATION:
                result[symbol_upper] = price
            else:
                symbols_to_fetch.append(symbol)
        else:
            symbols_to_fetch.append(symbol)
    
    # Fetch remaining symbols
    if symbols_to_fetch:
        data = _fetch_from_coingecko(symbols_to_fetch)
        
        for symbol in symbols_to_fetch:
            symbol_upper = symbol.upper()
            coingecko_id = SYMBOL_TO_COINGECKO_ID.get(symbol_upper)
            
            if coingecko_id and data and coingecko_id in data and "usd" in data[coingecko_id]:
                price = Decimal(str(data[coingecko_id]["usd"]))
                result[symbol_upper] = price
                _price_cache[symbol_upper] = (price, current_time)
            else:
                # Use cache even if expired, or 0
                if symbol_upper in _price_cache:
                    price, _ = _price_cache[symbol_upper]
                    result[symbol_upper] = price
                else:
                    result[symbol_upper] = Decimal("0.0")
    
    return result