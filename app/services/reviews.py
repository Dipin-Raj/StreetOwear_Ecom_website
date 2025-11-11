from sqlalchemy.orm import Session, joinedload
from app.models.models import Review, Product, User
from app.schemas.products import ReviewCreate
from app.utils.responses import ResponseHandler
from fastapi import HTTPException, status
from sqlalchemy import func

class ReviewService:
    @staticmethod
    async def create_review(db: Session, review: ReviewCreate, user_id: int):
        # Check if product exists
        product = db.query(Product).filter(Product.id == review.product_id).first()
        if not product:
            ResponseHandler.not_found_error("Product", review.product_id)

        # Check if user has already reviewed this product (optional, but good practice)
        existing_review = db.query(Review).filter(
            Review.product_id == review.product_id,
            Review.user_id == user_id
        ).first()
        if existing_review:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already reviewed this product.")

        db_review = Review(
            **review.model_dump(),
            user_id=user_id
        )
        db.add(db_review)
        db.commit()
        db.refresh(db_review)

        # Update product's average rating and review count
        product.review_count = db.query(Review).filter(Review.product_id == product.id).count()
        product.average_rating = db.query(func.avg(Review.rating)).filter(Review.product_id == product.id).scalar()
        db.commit()
        db.refresh(product)

        return db_review

    @staticmethod
    async def get_reviews_for_product(db: Session, product_id: int):
        reviews = db.query(Review).filter(Review.product_id == product_id).all()
        return reviews

    @staticmethod
    async def get_reviews_by_user(db: Session, user_id: int):
        reviews = db.query(Review).filter(Review.user_id == user_id).all()
        return reviews
    
    @staticmethod
    async def get_all_reviews(db: Session):
        reviews = db.query(Review).options(joinedload(Review.product)).all()
        return reviews
