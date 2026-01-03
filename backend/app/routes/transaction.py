# app/routes/transactions.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal

from app.db.session import get_db
from app.models.user import User
from app.models.portfolio_entry import PortfolioEntry
from app.models.asset import Asset
from app.models.wallet import Wallet
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

    price = get_current_price(asset.symbol)
    total_cost = Decimal(transaction.quantity) * Decimal(price)

    # Fetch user's wallet
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    if wallet.balance < total_cost:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    # Deduct from wallet
    wallet.balance -= total_cost
    db.add(wallet)

    # Update or create portfolio entry
    entry = db.query(PortfolioEntry).filter(
        PortfolioEntry.user_id == current_user.id,
        PortfolioEntry.asset_id == transaction.asset_id
    ).first()

    if entry:
        # Convert to Decimal for precise arithmetic
        entry_avg_price = Decimal(str(entry.average_buy_price)) if entry.average_buy_price else Decimal('0')
        entry_qty = Decimal(str(entry.quantity))
        trans_qty = Decimal(str(transaction.quantity))
        current_price = Decimal(str(price))
        
        # Calculate weighted average
        numerator = (entry_avg_price * entry_qty) + (current_price * trans_qty)
        total_quantity = entry_qty + trans_qty
        
        # Update entry
        entry.average_buy_price = float(numerator / total_quantity)
        entry.quantity = float(total_quantity)
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
    db.refresh(wallet)

    return TransactionResponse(
        asset_id=entry.asset_id,
        quantity=transaction.quantity,
        average_buy_price=entry.average_buy_price,
        type="buy",
        price=price,
        date=datetime.utcnow(),
        wallet_balance=wallet.balance  # Added wallet balance to response
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
    total_sell = Decimal(transaction.quantity) * Decimal(price)

    # Fetch user's portfolio entry
    entry = db.query(PortfolioEntry).filter(
        PortfolioEntry.user_id == current_user.id,
        PortfolioEntry.asset_id == transaction.asset_id
    ).first()
    if not entry:
        raise HTTPException(status_code=400, detail="Asset not in portfolio")
    if transaction.quantity > entry.quantity:
        raise HTTPException(status_code=400, detail="Not enough quantity to sell")

    # Update wallet
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    wallet.balance += total_sell
    db.add(wallet)

    # Update portfolio
    entry.quantity -= transaction.quantity
    if entry.quantity == 0:
        db.delete(entry)
    else:
        db.add(entry)

    db.commit()
    db.refresh(wallet)

    return TransactionResponse(
        asset_id=entry.asset_id,
        quantity=transaction.quantity,
        average_buy_price=entry.average_buy_price,
        type="sell",
        price=price,
        date=datetime.utcnow(),
        wallet_balance=wallet.balance  # ✅ ADD THIS
    )
