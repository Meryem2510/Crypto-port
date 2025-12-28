# app/models/portfolio_entry.py
from sqlalchemy import Column, Integer, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.db.base import Base

class PortfolioEntry(Base):
    __tablename__ = "portfolio_entries"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    average_buy_price = Column(Float, nullable=False)

    # Relationships
    user = relationship("User", back_populates="portfolio_entries")
    asset = relationship("Asset", back_populates="portfolio_entries")
    transactions = relationship("Transaction", back_populates="portfolio_entry", cascade="all, delete-orphan")
