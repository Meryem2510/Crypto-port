# app/routes/assets.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.asset import Asset
from app.services.dependecy import get_current_user
from app.services.market_data import get_current_prices
from app.schemas.asset import AssetWithPrice
from decimal import Decimal

router = APIRouter(prefix="/assets", tags=["assets"])

@router.get("/", response_model=list[AssetWithPrice])
def get_assets(db: Session = Depends(get_db)):
    assets = db.query(Asset).all()
    
    if not assets:
        return []
    
    # Get all symbols
    symbols = [asset.symbol for asset in assets]
    
    # Fetch ALL prices in ONE API call
    prices = get_current_prices(symbols)
    
    result = []
    for asset in assets:
        current_price = prices.get(asset.symbol.upper(), Decimal("0.0"))
        
        asset_data = {
            "id": asset.id,
            "symbol": asset.symbol,
            "name": asset.name,
            "current_price": float(current_price)  # Convert to float for JSON
        }
        result.append(asset_data)
    
    return result
