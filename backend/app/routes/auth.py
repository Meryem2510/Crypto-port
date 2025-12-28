from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate
from app.services.auth_service import create_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import UserLogin, Token
from app.services.auth_service import login_user



router = APIRouter(prefix="/auth", tags=["auth"])
@router.post("/register", response_model=dict)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    user = create_user(db, email=user_in.email, password=user_in.password)
    return {"id": user.id, "email": user.email}



@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    token = login_user(db, user_in.email, user_in.password)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    return {"access_token": token, "token_type": "bearer"}
