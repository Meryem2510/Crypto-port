# seed.py
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.db.base import Base

from app.models.user import User
from app.models.asset import Asset
from app.models.portfolio_entry import PortfolioEntry
from app.models.transaction import Transaction
from app.models.wallet import Wallet

from app.core.security import hash_password

# Make sure all tables exist
Base.metadata.create_all(bind=engine)

def seed():
    db: Session = SessionLocal()

    # 1. Create a test user
    user_email = "genesis.laxus@gmail.com"
    existing_user = db.query(User).filter(User.email == user_email).first()

    if not existing_user:
        test_user = User(
            email=user_email,
            hashed_password=hash_password("supersecret")
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
    else:
        test_user = existing_user

    # 2. Create wallet for the user (ONE wallet per user)
    wallet = db.query(Wallet).filter(Wallet.user_id == test_user.id).first()
    if not wallet:
        wallet = Wallet(
            user_id=test_user.id,
            balance=10000.00,   # initial balance (example)
            currency="USD"
        )
        db.add(wallet)
        db.commit()
        db.refresh(wallet)

    # 3. Add some assets
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

    # 4. Add portfolio entries
    portfolio_entries = []
    for asset in assets[:2]:
        entry = db.query(PortfolioEntry).filter(
            PortfolioEntry.user_id == test_user.id,
            PortfolioEntry.asset_id == asset.id
        ).first()

        if not entry:
            entry = PortfolioEntry(
                user_id=test_user.id,
                asset_id=asset.id,
                quantity=1.5,
                average_buy_price=1000
            )
            db.add(entry)
            db.commit()
            db.refresh(entry)

        portfolio_entries.append(entry)

    # 5. Add transactions
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
    print("✅ Seeding completed successfully!")

if __name__ == "__main__":
    seed()