# seed.py
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.user import User
from app.models.asset import Asset
from app.models.portfolio_entry import PortfolioEntry
from app.models.transaction import Transaction
from app.core.security import hash_password

# Make sure all tables exist
Base.metadata.create_all(bind=engine)

def seed():
    db: Session = SessionLocal()

    # 1. Create a test user
    user_email = "test@example.com"
    existing_user = db.query(User).filter(User.email == user_email).first()
    if not existing_user:
        test_user = User(email=user_email, hashed_password=hash_password("supersecret"))
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
    else:
        test_user = existing_user

    # 2. Add some assets
    assets_data = [
        {"symbol": "BTC", "name": "Bitcoin"},
        {"symbol": "ETH", "name": "Ethereum"},
        {"symbol": "ADA", "name": "Cardano"}
    ]

    assets = []
    for a in assets_data:
        asset = db.query(Asset).filter(Asset.symbol == a["symbol"]).first()
        if not asset:
            asset = Asset(symbol=a["symbol"], name=a["name"])
            db.add(asset)
            db.commit()
            db.refresh(asset)
        assets.append(asset)

    # 3. Add portfolio entries for the user
    portfolio_entries = []
    for asset in assets[:2]:  # let's give the user BTC and ETH
        entry = db.query(PortfolioEntry).filter(
            PortfolioEntry.user_id == test_user.id,
            PortfolioEntry.asset_id == asset.id
        ).first()
        if not entry:
            entry = PortfolioEntry(
                user_id=test_user.id,
                asset_id=asset.id,
                quantity=1.5,  # example quantity
                average_buy_price=1000  # example price
            )
            db.add(entry)
            db.commit()
            db.refresh(entry)
        portfolio_entries.append(entry)

    # 4. Add some transactions
    for entry in portfolio_entries:
        transaction = Transaction(
            user_id=test_user.id,
            portfolio_entry_id=entry.id,
            asset_id=entry.asset_id,
            type="buy",
            quantity=entry.quantity,
            price=entry.average_buy_price
        )
        db.add(transaction)

    db.commit()
    db.close()
    print("Seeding completed successfully!")

if __name__ == "__main__":
    seed()
