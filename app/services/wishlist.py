from sqlalchemy.orm import Session
from app.models.models import Wishlist, Product
from app.utils.responses import ResponseHandler

class WishlistService:
    @staticmethod
    def get_wishlist(db: Session, user_id: int):
        wishlist = db.query(Wishlist).filter(Wishlist.user_id == user_id).first()
        if not wishlist:
            # Create a wishlist if it doesn't exist
            wishlist = Wishlist(user_id=user_id)
            db.add(wishlist)
            db.commit()
            db.refresh(wishlist)
        return wishlist

    @staticmethod
    def add_to_wishlist(db: Session, user_id: int, product_id: int):
        wishlist = db.query(Wishlist).filter(Wishlist.user_id == user_id).first()
        if not wishlist:
            wishlist = Wishlist(user_id=user_id)
            db.add(wishlist)
            db.commit()
            db.refresh(wishlist)

        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            ResponseHandler.not_found_error("Product", product_id)

        if product in wishlist.products:
            ResponseHandler.bad_request_error("Product already in wishlist")

        wishlist.products.append(product)
        db.commit()
        return {"message": "Product added to wishlist"}

    @staticmethod
    def remove_from_wishlist(db: Session, user_id: int, product_id: int):
        wishlist = db.query(Wishlist).filter(Wishlist.user_id == user_id).first()
        if not wishlist:
            ResponseHandler.not_found_error("Wishlist for user", user_id)

        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            ResponseHandler.not_found_error("Product", product_id)

        if product not in wishlist.products:
            ResponseHandler.bad_request_error("Product not in wishlist")

        wishlist.products.remove(product)
        db.commit()
        return {"message": "Product removed from wishlist"}
