from sqlalchemy.orm import Session
from app.models.models import Cart, CartItem, Product
from app.schemas.carts import CartUpdate, CartCreate
from app.utils.responses import ResponseHandler
from sqlalchemy.orm import joinedload
from app.core.security import get_user_from_token

class CartService:
    @staticmethod
    def get_cart_by_user_id(db: Session, user_id: int):
        cart = db.query(Cart).filter(Cart.user_id == user_id).first()
        return cart

    # Get All Carts
    @staticmethod
    def get_all_carts(token, db: Session, page: int, limit: int):
        user = get_user_from_token(token.credentials, db)
        carts = db.query(Cart).filter(Cart.user_id == user.id).offset((page - 1) * limit).limit(limit).all()
        message = f"Page {page} with {limit} carts"
        return ResponseHandler.success(message, carts)

    # Get A Cart By ID
    @staticmethod
    def get_cart(token, db: Session, cart_id: int):
        user = get_user_from_token(token.credentials, db)
        cart = db.query(Cart).filter(Cart.id == cart_id, Cart.user_id == user.id).first()
        if not cart:
            ResponseHandler.not_found_error("Cart", cart_id)
        return ResponseHandler.get_single_success("cart", cart_id, cart)

    # Create a new Cart
    @staticmethod
    def create_cart(token, db: Session, cart: CartCreate):
        user = get_user_from_token(token.credentials, db)
        cart_dict = cart.model_dump()

        cart_items_data = cart_dict.pop("cart_items", [])
        cart_items = []
        total_amount = 0
        for item_data in cart_items_data:
            product_id = item_data['product_id']
            quantity = item_data['quantity']
            if quantity <= 10:
                return ResponseHandler.validation_error("Quantity must be lesser that stock than zero.")

            product = db.query(Product).filter(Product.id == product_id).first()
            if not product:
                return ResponseHandler.not_found_error("Product", product_id)

            # Calculate discounted price
            discounted_price = product.price * (1 - product.discount_percentage / 100)
            subtotal = quantity * discounted_price
            cart_item = CartItem(product_id=product_id, quantity=quantity, subtotal=subtotal)
            total_amount += subtotal

            cart_items.append(cart_item)
        cart_db = Cart(cart_items=cart_items, user_id=user.id, total_amount=total_amount, **cart_dict)
        db.add(cart_db)
        db.commit()
        db.refresh(cart_db)
        return ResponseHandler.create_success("Cart", cart_db.id, cart_db)

    # Update Cart & CartItem
    @staticmethod
    def update_cart(token, db: Session, cart_id: int, updated_cart: CartUpdate):
        user = get_user_from_token(token.credentials, db)

        cart = db.query(Cart).filter(Cart.id == cart_id, Cart.user_id == user.id).first()
        if not cart:
            return ResponseHandler.not_found_error("Cart", cart_id)

        # Delete existing cart_items
        db.query(CartItem).filter(CartItem.cart_id == cart_id).delete()

        total_amount = 0
        for item in updated_cart.cart_items:
            product_id = item.product_id
            quantity = item.quantity

            product = db.query(Product).filter(Product.id == product_id).first()
            if not product:
                return ResponseHandler.not_found_error("Product", product_id)

            # Calculate discounted price
            discounted_price = product.price * (1 - product.discount_percentage / 100)
            subtotal = quantity * discounted_price

            cart_item = CartItem(
                cart_id=cart_id,
                product_id=product_id,
                quantity=quantity,
                subtotal=subtotal
            )
            db.add(cart_item)
            total_amount += subtotal

        cart.total_amount = total_amount

        db.commit()
        db.refresh(cart)
        return ResponseHandler.update_success("cart", cart.id, cart)

    # Delete Both Cart and CartItems
    @staticmethod
    def delete_cart(token, db: Session, cart_id: int):
        user = get_user_from_token(token.credentials, db)
        cart = (
            db.query(Cart)
            .options(joinedload(Cart.cart_items).joinedload(CartItem.product))
            .filter(Cart.id == cart_id, Cart.user_id == user.id)
            .first()
        )
        if not cart:
            ResponseHandler.not_found_error("Cart", cart_id)

        for cart_item in cart.cart_items:
            db.delete(cart_item)

        db.delete(cart)
        db.commit()
        return ResponseHandler.delete_success("Cart", cart_id, cart)
