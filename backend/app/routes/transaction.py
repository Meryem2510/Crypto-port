# app/routes/transactions.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.models.user import User
from app.models.portfolio_entry import PortfolioEntry
from app.models.asset import Asset
from app.schemas.transaction import TransactionCreate, TransactionResponse
from app.services.dependecy import get_current_user
from app.services.market_data import get_current_price

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.post("/buy", response_model=TransactionResponse)
def buy_asset(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    asset = db.query(Asset).filter(Asset.id == transaction.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Fetch current market price
    price = get_current_price(asset.symbol)

    entry = db.query(PortfolioEntry).filter(
        PortfolioEntry.user_id == current_user.id,
        PortfolioEntry.asset_id == transaction.asset_id
    ).first()

    if entry:
        total_quantity = entry.quantity + transaction.quantity
        entry.average_buy_price = (
            entry.average_buy_price * entry.quantity + price * transaction.quantity
        ) / total_quantity
        entry.quantity = total_quantity
    else:
        entry = PortfolioEntry(
            user_id=current_user.id,
            asset_id=transaction.asset_id,
            quantity=transaction.quantity,
            average_buy_price=price
        )
        db.add(entry)

    db.commit()
    db.refresh(entry)

    return TransactionResponse(
        asset_id=entry.asset_id,
        quantity=transaction.quantity,
        average_buy_price=entry.average_buy_price,
        type="buy",
        price=price,
        date=datetime.utcnow()
    )

@router.post("/sell", response_model=TransactionResponse)
def sell_asset(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    asset = db.query(Asset).filter(Asset.id == transaction.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    price = get_current_price(asset.symbol)

    entry = db.query(PortfolioEntry).filter(
        PortfolioEntry.user_id == current_user.id,
        PortfolioEntry.asset_id == transaction.asset_id
    ).first()

    if not entry:
        raise HTTPException(status_code=400, detail="Asset not in portfolio")
    if transaction.quantity > entry.quantity:
        raise HTTPException(status_code=400, detail="Not enough quantity to sell")

    entry.quantity -= transaction.quantity
    if entry.quantity == 0:
        db.delete(entry)

    db.commit()

    return TransactionResponse(
        asset_id=entry.asset_id,
        quantity=transaction.quantity,
        average_buy_price=entry.average_buy_price,
        type="sell",
        price=price,
        date=datetime.utcnow()
    )
