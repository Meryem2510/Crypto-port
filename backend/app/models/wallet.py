from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime , Numeric
from sqlalchemy.sql import func
from app.db.base import Base

class Wallet(Base):
    __tablename__ = "wallet"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    balance = Column(Numeric(18, 2), nullable=False, default=0)
    currency = Column(String(10), nullable=False, default="USD")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
