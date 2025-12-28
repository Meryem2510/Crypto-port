from fastapi import APIRouter, Depends , HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.dependecy import get_current_user
from app.models.user import User
from app.models.portfolio_entry import PortfolioEntry
from app.schemas.portfolio import PortfolioEntryCreate, PortfolioEntryResponse


router = APIRouter(prefix="/portfolios", tags=["portfolios"])

@router.post("/", response_model=PortfolioEntryResponse)
def create_or_update_portfolio_entry(
    entry_in: PortfolioEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if the user already has this asset
    entry = db.query(PortfolioEntry).filter(
        PortfolioEntry.user_id == current_user.id,
        PortfolioEntry.asset_id == entry_in.asset_id
    ).first()

    if entry:
        # Calculate new weighted average price
        total_quantity = entry.quantity + entry_in.quantity
        new_average_price = (
            (entry.average_buy_price * entry.quantity) + 
            (entry_in.average_buy_price * entry_in.quantity)
        ) / total_quantity

        entry.quantity = total_quantity
        entry.average_buy_price = new_average_price
        db.commit()
        db.refresh(entry)
        return entry

    # If no existing entry, create a new one
    entry = PortfolioEntry(
        user_id=current_user.id,
        asset_id=entry_in.asset_id,
        quantity=entry_in.quantity,
        average_buy_price=entry_in.average_buy_price
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("/", response_model=list[PortfolioEntryResponse])
def read_my_portfolios(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entries = db.query(PortfolioEntry).filter(
        PortfolioEntry.user_id == current_user.id
    ).all()
    return entries



@router.put("/{entry_id}", response_model=PortfolioEntryResponse)
def update_portfolio_entry(
    entry_id: int,
    entry_in: PortfolioEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(PortfolioEntry).filter(
        PortfolioEntry.id == entry_id,
        PortfolioEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Portfolio entry not found")

    # Update fields
    entry.quantity = entry_in.quantity
    entry.average_buy_price = entry_in.average_buy_price
    db.commit()
    db.refresh(entry)
    return entry



@router.delete("/{entry_id}", status_code=204)
def delete_portfolio_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(PortfolioEntry).filter(
        PortfolioEntry.id == entry_id,
        PortfolioEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Portfolio entry not found")

    db.delete(entry)
    db.commit()
    return
