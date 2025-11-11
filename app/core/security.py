from fastapi.security.http import HTTPAuthorizationCredentials
from passlib.context import CryptContext
from datetime import datetime, timedelta
from app.core.config import settings
from jose import JWTError, jwt
from app.schemas.auth import LoginResponse
from fastapi.encoders import jsonable_encoder
from fastapi import HTTPException, Depends, status
from app.models.models import User
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer
from app.db.database import get_db
from app.utils.responses import ResponseHandler


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
auth_scheme = HTTPBearer()

# Create Hash Password


def get_password_hash(password):
    # Truncate password to 72 bytes as bcrypt has a limit
    truncated_password = password.encode('utf-8')[:72].decode('utf-8', 'ignore')
    return pwd_context.hash(truncated_password)


# Verify Hash Password
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


# Create Access & Refresh Token
async def get_user_token(user: User, refresh_token=None):
    payload = {"id": user.id}

    access_token_expiry = timedelta(minutes=settings.access_token_expire_minutes)

    access_token = await create_access_token(payload, access_token_expiry)

    if not refresh_token:
        refresh_token = await create_refresh_token(payload)

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=access_token_expiry.seconds,
        user=user
    )


# Create Access Token
async def create_access_token(data: dict, access_token_expiry=None):
    payload = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    payload.update({"exp": expire})

    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


# Create Refresh Token
async def create_refresh_token(data):
    return jwt.encode(data, settings.secret_key, settings.algorithm)


# Get Payload Of Token
def get_token_payload(token):
    try:
        return jwt.decode(token, settings.secret_key, [settings.algorithm])
    except JWTError:
        raise ResponseHandler.invalid_token('access')


def get_user_from_token(token: str, db: Session):
    payload = get_token_payload(token)
    user_id = payload.get('id')
    if user_id is None:
        raise ResponseHandler.invalid_token('access')
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise ResponseHandler.invalid_token('access')
    return user


def get_current_user(token: HTTPAuthorizationCredentials = Depends(auth_scheme), db: Session = Depends(get_db)):
    return get_user_from_token(token.credentials, db)


def get_current_user_id(token: HTTPAuthorizationCredentials = Depends(auth_scheme), db: Session = Depends(get_db)):
    user = get_user_from_token(token.credentials, db)
    return user.id



def check_admin_role(
        token: HTTPAuthorizationCredentials = Depends(auth_scheme),
        db: Session = Depends(get_db)):
    user = get_token_payload(token.credentials)
    user_id = user.get('id')
    role_user = db.query(User).filter(User.id == user_id).first()
    if role_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")
