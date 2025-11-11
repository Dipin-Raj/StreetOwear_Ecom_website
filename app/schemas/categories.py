from typing import List, Optional
from pydantic import BaseModel, Field


class BaseConfig:
    from_attributes = True


class CategoryBase(BaseModel):
    id: int
    name: str
    thumbnail: Optional[str] = None

    class Config(BaseConfig):
        pass


class CategoryCreate(BaseModel):
    name: str
    thumbnail: Optional[str] = None


class CategoryUpdate(BaseModel):
    name: str
    thumbnail: Optional[str] = None


class CategoryOut(BaseModel):
    message: str
    data: CategoryBase


class CategoriesOut(BaseModel):
    message: str
    data: List[CategoryBase]


class CategoryDelete(BaseModel):
    id: int
    name: str


class CategoryOutDelete(BaseModel):
    message: str
    data: CategoryDelete
