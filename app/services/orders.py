from sqlalchemy.orm import Session
from app.models.models import Order, OrderItem, CartItem, Product
from app.schemas.orders import OrderCreate
from app.services.carts import CartService
from fastapi import HTTPException, status

class OrderService:
    @staticmethod
    def create_order(db: Session, user_id: int, order_details: OrderCreate):
        cart = CartService.get_cart_by_user_id(db, user_id)

        if not cart or not cart.cart_items:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found or is empty")

        subtotal = sum(item.subtotal for item in cart.cart_items)
        tax = subtotal * 0.10
        total_amount = subtotal + tax

        new_order = Order(
            user_id=user_id,
            total_amount=total_amount,
            address=order_details.address,
            payment_method=order_details.payment_method,
        )

        db.add(new_order)
        db.flush() # Use flush to get new_order.id without committing the transaction yet
        db.refresh(new_order)

        out_of_stock_items = []
        for item in cart.cart_items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with id {item.product_id} not found")

            if product.stock < item.quantity:
                out_of_stock_items.append(product.title)

        if out_of_stock_items:
            print(f"Raising HTTPException: The following products are out of stock or have insufficient stock: {', '.join(out_of_stock_items)}.")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"The following products are out of stock or have insufficient stock: {', '.join(out_of_stock_items)}."
            )

        for item in cart.cart_items:
            product = db.query(Product).filter(Product.id == item.product_id).first() # Re-fetch to ensure latest state after potential concurrent updates
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                subtotal=item.subtotal,
            )
            db.add(order_item)

            # Decrease the stock of the product
            product.stock -= item.quantity
            if product.stock <= 0:
                product.is_available = False
            db.add(product)

        # Clear the cart
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()

        db.commit()

        return {"message": "Order created successfully", "data": new_order}

    @staticmethod
    def get_user_orders(db: Session, user_id: int, page: int, limit: int):
        orders = db.query(Order).filter(Order.user_id == user_id).offset((page - 1) * limit).limit(limit).all()
        return {"message": f"Page {page} with {limit} orders", "data": orders}

    @staticmethod
    def get_all_orders(db: Session, page: int, limit: int):
        orders = db.query(Order).offset((page - 1) * limit).limit(limit).all()
        return {"message": f"Page {page} with {limit} orders", "data": orders}

    @staticmethod
    def update_order_status(db: Session, order_id: int, new_status: str):
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Order with id {order_id} not found")

        order.status = new_status
        db.commit()
        db.refresh(order)
        return {"message": f"Order with id {order_id} status updated to {new_status}", "data": order}

    @staticmethod
    def delete_order(db: Session, order_id: int, user_id: int):
        order = db.query(Order).filter(Order.id == order_id, Order.user_id == user_id).first()
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Order with id {order_id} not found")

        db.delete(order)
        db.commit()

        return {"message": f"Order with id {order_id} has been successfully deleted."}
