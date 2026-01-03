# app/schemas/transaction.py
from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal
from typing import Optional


from pydantic import BaseModel

class TransactionCreate(BaseModel):
    asset_id: int
    quantity: float



# app/schemas/transaction.py

class TransactionResponse(BaseModel):
    asset_id: int
    quantity: float
    average_buy_price: float
    type: str  
    price: float
    date: datetime
    wallet_balance: Optional[Decimal] = None

    class Config:
        orm_mode = True

