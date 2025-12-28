# app/services/portfolio_service.py
from sqlalchemy.orm import Session
from app.models.portfolio_entry import PortfolioEntry
from app.models.transaction import Transaction

def buy_asset(db: Session, user_id: int, asset_id: int, quantity: float, price: float):
    entry = db.query(PortfolioEntry).filter_by(user_id=user_id, asset_id=asset_id).first()
    if entry:
        # update average_buy_price
        total_cost = entry.average_buy_price * entry.quantity + price * quantity
        entry.quantity += quantity
        entry.average_buy_price = total_cost / entry.quantity
    else:
        entry = PortfolioEntry(user_id=user_id, asset_id=asset_id, quantity=quantity, average_buy_price=price)
        db.add(entry)

    db.commit()
    db.refresh(entry)

    # log transaction
    transaction = Transaction(
        user_id=user_id,
        portfolio_entry_id=entry.id,
        type="buy",
        quantity=quantity,
        price=price
    )
    db.add(transaction)
    db.commit()
    return entry

def sell_asset(db: Session, user_id: int, asset_id: int, quantity: float, price: float):
    entry = db.query(PortfolioEntry).filter_by(user_id=user_id, asset_id=asset_id).first()
    if not entry or entry.quantity < quantity:
        raise ValueError("Not enough assets to sell")

    entry.quantity -= quantity
    if entry.quantity == 0:
        db.delete(entry)
    db.commit()

    # log transaction
    transaction = Transaction(
        user_id=user_id,
        portfolio_entry_id=entry.id,
        type="sell",
        quantity=quantity,
        price=price
    )
    db.add(transaction)
    db.commit()
    return entry
