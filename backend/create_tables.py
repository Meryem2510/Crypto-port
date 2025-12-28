# create_tables.py

from app.db.base import Base
from app.db.session import engine

# Import all models so SQLAlchemy registers them
from app.models.user import User
from app.models.asset import Asset
from app.models.portfolio_entry import PortfolioEntry
from app.models.transaction import Transaction

def create_all_tables():
    Base.metadata.drop_all(bind=engine)  # Optional: drops existing tables
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

if __name__ == "__main__":
    create_all_tables()
