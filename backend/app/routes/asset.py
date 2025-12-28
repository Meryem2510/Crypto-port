# app/routes/assets.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.asset import Asset
from app.services.dependecy import get_current_user
from app.services.market_data import get_current_price
from app.schemas.asset import AssetWithPrice

router = APIRouter(prefix="/assets", tags=["assets"])

@router.get("/", response_model=list[AssetWithPrice])
def list_assets(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    assets = db.query(Asset).all()
    results = []
    for asset in assets:
        current_price = get_current_price(asset.symbol)
        results.append({
            "id": asset.id,
            "symbol": asset.symbol,
            "name": asset.name,
            "current_price": current_price
        })
    return results
