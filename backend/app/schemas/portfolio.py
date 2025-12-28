from pydantic import BaseModel

class PortfolioEntryCreate(BaseModel):
    asset_id: int
    quantity: float
    average_buy_price: float

class PortfolioEntryResponse(BaseModel):
    id: int
    user_id: int
    asset_id: int
    quantity: float
    average_buy_price: float

    class Config:
        orm_mode = True
