from pydantic import BaseModel, Field

class DepositRequest(BaseModel):
    amount: float = Field(gt=0, example=100.0)


class WalletResponse(BaseModel):
    user_id: int
    balance: float
    currency: str

    class Config:
        from_attributes = True