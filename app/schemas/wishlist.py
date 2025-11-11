from pydantic import BaseModel
from app.schemas.products import ProductOut

class WishlistOut(BaseModel):
    id: int
    user_id: int
    products: list[ProductOut]

    class Config:
        orm_mode = True
