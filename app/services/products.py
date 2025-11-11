from sqlalchemy.orm import Session
from app.models.models import Product, Category, ProductImage, User
from app.schemas.products import ProductCreate, ProductUpdate
from app.utils.responses import ResponseHandler
from fastapi import UploadFile
import shutil
import os

class ProductService:
    @staticmethod
    def get_all_products(db: Session, page: int, limit: int, search: str = "", category_id: int | None = None, sort_by: str | None = None, sort_dir: str | None = "asc", current_user: User | None = None):
        query = db.query(Product)
        if search:
            query = query.filter(Product.title.ilike(f"%{search}%"))
        if category_id is not None:
            query = query.filter(Product.category_id == category_id)
        
        # Filter by is_available for non-admin users
        if current_user and current_user.role != "admin":
            query = query.filter(Product.is_available == True)

        if sort_by:
            if hasattr(Product, sort_by):
                if sort_dir == "desc":
                    query = query.order_by(getattr(Product, sort_by).desc())
                else:
                    query = query.order_by(getattr(Product, sort_by).asc())

        if current_user and current_user.role == "admin" and (limit == 0 or limit is None):
            # For admin, if limit is 0 or None, fetch all products without pagination
            products = query.all()
        else:
            # For other cases, apply limit and offset for pagination
            products = query.limit(limit).offset((page - 1) * limit).all()
        return {"message": f"Page {page} with {limit} products", "data": products}

    @staticmethod
    def get_product(db: Session, product_id: int):
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            ResponseHandler.not_found_error("Product", product_id)
        return product

    @staticmethod
    def create_product(db: Session, product: ProductCreate, thumbnail: UploadFile, images: list[UploadFile]):
        category_exists = db.query(Category).filter(Category.id == product.category_id).first()
        if not category_exists:
            ResponseHandler.not_found_error("Category", product.category_id)

        # Save the thumbnail
        file_path = f"uploads/{thumbnail.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(thumbnail.file, buffer)

        thumbnail_url = f"/uploads/{thumbnail.filename}"

        db_product = Product(**product.model_dump(), thumbnail=thumbnail_url)
        db.add(db_product)
        db.commit()
        db.refresh(db_product)

        # Handle additional images
        if images:
            for image in images:
                file_path = f"uploads/{image.filename}"
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(image.file, buffer)
                image_url = f"/uploads/{image.filename}"
                db_image = ProductImage(product_id=db_product.id, image_url=image_url)
                db.add(db_image)
            db.commit()
            db.refresh(db_product)

        return ResponseHandler.create_success(db_product.title, db_product.id, db_product)

    @staticmethod
    def update_product(db: Session, product_id: int, product_data: ProductUpdate, thumbnail: UploadFile | None, images: list[UploadFile]):
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            ResponseHandler.not_found_error("Product", product_id)

        # Update product fields only if they are provided in the ProductUpdate schema
        for key, value in product_data.model_dump(exclude_unset=True).items():
            setattr(db_product, key, value)

        # If stock is updated to be greater than 0, set is_available to True
        if db_product.stock > 0:
            db_product.is_available = True
        else:
            db_product.is_available = False

        # Handle thumbnail update
        if thumbnail is None:
            # If thumbnail is None, it means the existing thumbnail should be deleted
            if db_product.thumbnail:
                try:
                    os.remove(db_product.thumbnail.lstrip("/"))
                except FileNotFoundError:
                    pass
            db_product.thumbnail = None
        elif thumbnail is not None: # If a new thumbnail file is provided
            file_path = f"uploads/{thumbnail.filename}"
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(thumbnail.file, buffer)
            db_product.thumbnail = f"/uploads/{thumbnail.filename}"

        # Handle additional images update
        if images:
            for image in images:
                file_path = f"uploads/{image.filename}"
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(image.file, buffer)
                image_url = f"/uploads/{image.filename}"
                db_image = ProductImage(product_id=db_product.id, image_url=image_url)
                db.add(db_image)
            db.commit()
            db.refresh(db_product)

        db.commit()
        db.refresh(db_product)
        return ResponseHandler.update_success(db_product.title, db_product.id, db_product)

    @staticmethod
    def delete_product(db: Session, product_id: int):
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            ResponseHandler.not_found_error("Product", product_id)
        db.delete(db_product)
        db.commit()
        return ResponseHandler.delete_success(db_product.title, db_product.id, db_product)

    @staticmethod
    def delete_product_image(db: Session, product_id: int, image_id: int):
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            ResponseHandler.not_found_error("Product", product_id)

        image_to_delete = db.query(ProductImage).filter(ProductImage.id == image_id).first()
        if not image_to_delete:
            ResponseHandler.not_found_error("Image", image_id)

        # Check if the image belongs to the product
        if image_to_delete.product_id != product_id:
            ResponseHandler.bad_request_error("Image does not belong to this product")

        # Delete the image file
        try:
            os.remove(image_to_delete.image_url.lstrip("/"))
        except FileNotFoundError:
            pass

        db.delete(image_to_delete)
        db.commit()

