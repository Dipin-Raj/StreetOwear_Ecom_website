from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.reviews import ReviewService
from app.schemas.products import ReviewCreate, ReviewOut
from app.core.security import get_current_user
from app.models.models import User
from typing import List

router = APIRouter(tags=["Reviews"], prefix="/reviews")

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=ReviewOut)
async def create_review(
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ReviewService.create_review(db, review, current_user.id)

@router.get("/", status_code=status.HTTP_200_OK, response_model=List[ReviewOut])
async def get_all_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can view all reviews.")
    return await ReviewService.get_all_reviews(db)

@router.get("/product/{product_id}", status_code=status.HTTP_200_OK, response_model=List[ReviewOut])
async def get_reviews_for_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    return await ReviewService.get_reviews_for_product(db, product_id)

@router.get("/user/{user_id}", status_code=status.HTTP_200_OK, response_model=List[ReviewOut])
async def get_reviews_by_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # Ensure user is authenticated
):
    # Optional: Add logic to ensure user_id matches current_user.id or current_user is admin
    if user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view these reviews")
    return await ReviewService.get_reviews_by_user(db, user_id)
