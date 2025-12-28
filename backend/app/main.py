from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.routes import auth
from app.routes import portfolio_entry
from app.routes import asset
from app.routes import transaction
from app.middlewares.cors import setup_cors


app = FastAPI()

setup_cors(app)




# @app.get("/test-db")
# def test_db(db: Session = Depends(get_db)):
#     try:
#         result = db.execute(text("SELECT 1")).fetchone()
#         if result:
#             return {"status": "success", "message": "Database connected!"}
#     except Exception as e:
#         return {"status": "error", "message": str(e)}


app.include_router(auth.router)
app.include_router(portfolio_entry.router)
app.include_router(asset.router)
app.include_router(transaction.router)



