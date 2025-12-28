# app/models/asset.py
from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.db.base import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True)
    symbol = Column(String(50), nullable=False, unique=True)
    name = Column(String(100), nullable=False)

    # Relationships
    portfolio_entries = relationship("PortfolioEntry", back_populates="asset", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="asset", cascade="all, delete-orphan")
