from pydantic import BaseModel , EmailStr
from typing import List, Optional
from datetime import datetime
from app.schemas.carts import CartBase


class BaseConfig:
    from_attributes = True


class UserBase(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    address: Optional[str] = None # Add address
    phone_number: Optional[str] = None # Add phone_number
    carts: Optional[List[CartBase]] = None

    class Config(BaseConfig):
        pass


class AdminBase(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    address: Optional[str] = None # Add address
    phone_number: Optional[str] = None # Add phone_number

    class Config(BaseConfig):
        pass


class UserCreate(BaseModel):
    full_name: str
    username: str
    email: str
    password: str

    class Config(BaseConfig):
        pass


class UserUpdate(BaseModel): # Change to inherit from BaseModel
    full_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    address: Optional[str] = None # Add address
    phone_number: Optional[str] = None # Add phone_number

    class Config(BaseConfig):
        pass


class UserOut(BaseModel):
    message: str
    data: UserBase

    class Config(BaseConfig):
        pass


class AdminOut(BaseModel):
    message: str
    data: AdminBase

    class Config(BaseConfig):
        pass


class UsersOut(BaseModel):
    message: str
    data: List[UserBase]

    class Config(BaseConfig):
        pass


class UserOutDelete(BaseModel):
    message: str
    data: UserBase

    class Config(BaseConfig):
        pass
