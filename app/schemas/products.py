from pydantic import BaseModel, validator
from datetime import datetime
from typing import List, Optional, ClassVar
from app.schemas.categories import CategoryBase


# Base Models
class BaseConfig:
    from_attributes = True


class ProductImageOut(BaseModel):
    id: int
    image_url: str

    class Config(BaseConfig):
        pass


class ProductBase(BaseModel):
    id: int
    title: str
    description: Optional[str]
    price: float

    @validator("discount_percentage", pre=True)
    def validate_discount_percentage(cls, v):
        if v < 0 or v > 100:
            raise ValueError("discount_percentage must be between 0 and 100")
        return v

    discount_percentage: float
    rating: float
    stock: int
    brand: str
    thumbnail: str
    images: List[ProductImageOut]
    is_published: bool
    created_at: datetime
    category_id: int
    category: CategoryBase

    class Config(BaseConfig):
        pass


# Create Product
class ProductCreate(BaseModel):
    title: str
    description: Optional[str]
    price: float
    discount_percentage: float
    rating: float
    stock: int
    brand: str
    is_published: bool
    category_id: int

    class Config(BaseConfig):
        pass


# Update Product
class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    discount_percentage: Optional[float] = None
    rating: Optional[float] = None
    stock: Optional[int] = None
    brand: Optional[str] = None
    is_published: Optional[bool] = None
    category_id: Optional[int] = None

    class Config(BaseConfig):
        pass


# Get Products
class ProductOut(ProductBase):
    pass


class ProductsOut(BaseModel):
    message: str
    data: List[ProductOut]

    class Config(BaseConfig):
        pass


# Delete Product
class ProductDelete(ProductBase):
    category: ClassVar[CategoryBase]


class ProductOutDelete(BaseModel):
    message: str
    data: ProductDelete


# Review Schemas
class ProductForReviewOut(BaseModel):
    id: int
    title: str

    class Config(BaseConfig):
        pass


class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    product_id: int

class ReviewOut(ReviewBase):
    id: int
    user_id: int
    created_at: datetime
    product: ProductForReviewOut

    class Config(BaseConfig):
        pass
