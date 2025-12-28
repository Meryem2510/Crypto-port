# app/schemas/transaction.py
from pydantic import BaseModel
from datetime import datetime


from pydantic import BaseModel

class TransactionCreate(BaseModel):
    asset_id: int
    quantity: float



# app/schemas/transaction.py

class TransactionResponse(BaseModel):
    asset_id: int
    quantity: float
    average_buy_price: float
    type: str  # 'buy' or 'sell'
    price: float
    date: datetime

    class Config:
        orm_mode = True

