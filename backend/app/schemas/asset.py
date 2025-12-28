from pydantic import BaseModel

class AssetWithPrice(BaseModel):
    id: int
    symbol: str
    name: str
    current_price: float

    class Config:
        orm_mode = True