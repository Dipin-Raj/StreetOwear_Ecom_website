from fastapi import APIRouter, Depends, status, Body
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.wishlist import WishlistService
from app.core.security import get_current_user
from app.schemas.wishlist import WishlistOut
from app.models.models import User

router = APIRouter(tags=["Wishlist"], prefix="/wishlist")


@router.get("/", status_code=status.HTTP_200_OK, response_model=WishlistOut)
def get_wishlist(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return WishlistService.get_wishlist(db, current_user.id)


@router.post("/", status_code=status.HTTP_201_CREATED)
def add_to_wishlist(product_id: int = Body(..., embed=True), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return WishlistService.add_to_wishlist(db, current_user.id, product_id)


@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
def remove_from_wishlist(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return WishlistService.remove_from_wishlist(db, current_user.id, product_id)
