from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.wallet import Wallet
from app.schemas.wallet import DepositRequest, WalletResponse
from app.services.dependecy import get_current_user

router = APIRouter(prefix="/wallet", tags=["Wallet"])


@router.post("/deposit", response_model=WalletResponse)
def deposit(payload: DepositRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()

    if not wallet:
        wallet = Wallet(user_id=current_user.id, balance=Decimal("0.00"))
        db.add(wallet)
        db.commit()
        db.refresh(wallet)

    wallet.balance += Decimal(payload.amount)
    db.commit()
    db.refresh(wallet)

    return wallet


@router.get("/balance", response_model=WalletResponse)
def get_balance(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Get the current balance of the logged-in user's wallet
    """
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()

    if not wallet:
        # Optionally auto-create wallet
        wallet = Wallet(user_id=current_user.id, balance=0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)

    return wallet