from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, Token
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(db: Session, user: UserCreate) -> Token:
    hashed = pwd_context.hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    token = jwt.encode({"sub": str(db_user.id), "exp": datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)}, settings.secret_key)
    return Token(access_token=token)

def authenticate_user(db: Session, user: UserLogin) -> Token:
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not pwd_context.verify(user.password, db_user.hashed_password):
        raise Exception("Invalid credentials")
    token = jwt.encode({"sub": str(db_user.id), "exp": datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)}, settings.secret_key)
    return Token(access_token=token)

def create_access_token(data: dict):
    return jwt.encode(data, settings.secret_key, algorithm="HS256")
