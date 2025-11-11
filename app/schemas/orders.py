from pydantic import BaseModel
from datetime import datetime
from typing import List
from app.schemas.products import ProductBase

class BaseConfig:
    from_attributes = True

class OrderItemBase(BaseModel):
    id: int
    product: ProductBase
    quantity: int
    subtotal: float

    class Config(BaseConfig):
        pass

class OrderBase(BaseModel):
    id: int
    total_amount: float
    status: str
    created_at: datetime
    order_items: List[OrderItemBase]

    class Config(BaseConfig):
        pass

class OrderCreate(BaseModel):
    address: str
    payment_method: str

class OrderOut(BaseModel):
    message: str
    data: OrderBase

    class Config(BaseConfig):
        pass

class OrdersOut(BaseModel):
    message: str
    data: List[OrderBase]

    class Config(BaseConfig):
        pass
