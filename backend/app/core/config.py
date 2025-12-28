from dotenv import load_dotenv
import os
from datetime import timedelta

load_dotenv()  # load environment variables from .env

DATABASE_URL = os.getenv("DATABASE_URL")

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET", "fallbacksecret")
ALGORITHM = os.getenv("JWT_ALGO", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # you can also put this in .env if you want


load_dotenv()

class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL")
    JWT_SECRET = os.getenv("JWT_SECRET", "fallbacksecret")
    JWT_ALGO = os.getenv("JWT_ALGO", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = 30

settings = Settings()
