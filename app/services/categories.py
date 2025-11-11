from sqlalchemy.orm import Session
from app.models.models import Category
from app.schemas.categories import CategoryCreate, CategoryUpdate
from app.utils.responses import ResponseHandler
from fastapi import UploadFile
import shutil
import os


class CategoryService:
    @staticmethod
    def get_all_categories(db: Session, page: int, limit: int, search: str = ""):
        categories = db.query(Category).order_by(Category.id.asc()).filter(
            Category.name.contains(search)).limit(limit).offset((page - 1) * limit).all()
        return {"message": f"Page {page} with {limit} categories", "data": categories}

    @staticmethod
    def get_category(db: Session, category_id: int):
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            ResponseHandler.not_found_error("Category", category_id)
        return ResponseHandler.get_single_success(category.name, category_id, category)

    @staticmethod
    def create_category(db: Session, name: str, description: str, thumbnail: UploadFile):
        file_path = f"uploads/{thumbnail.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(thumbnail.file, buffer)
        thumbnail_url = f"/uploads/{thumbnail.filename}"

        db_category = Category(name=name, description=description, thumbnail=thumbnail_url)
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        return ResponseHandler.create_success(db_category.name, db_category.id, db_category)

    @staticmethod
    def update_category(db: Session, category_id: int, name: str, description: str, thumbnail: UploadFile | None):
        db_category = db.query(Category).filter(Category.id == category_id).first()
        if not db_category:
            ResponseHandler.not_found_error("Category", category_id)

        db_category.name = name
        db_category.description = description

        # Handle thumbnail update
        if thumbnail is None:
            # If thumbnail is None, it means the existing thumbnail should be deleted
            if db_category.thumbnail:
                try:
                    os.remove(db_category.thumbnail.lstrip("/"))
                except FileNotFoundError:
                    pass
            db_category.thumbnail = None
        elif thumbnail: # If a new thumbnail file is provided
            file_path = f"uploads/{thumbnail.filename}"
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(thumbnail.file, buffer)
            db_category.thumbnail = f"/uploads/{thumbnail.filename}"

        db.commit()
        db.refresh(db_category)
        return ResponseHandler.update_success(db_category.name, db_category.id, db_category)

    @staticmethod
    def delete_category(db: Session, category_id: int):
        db_category = db.query(Category).filter(Category.id == category_id).first()
        if not db_category:
            ResponseHandler.not_found_error("Category", category_id)
        db.delete(db_category)
        db.commit()
        return ResponseHandler.delete_success(db_category.name, db_category.id, db_category)
