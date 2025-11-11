from sqlalchemy.orm import Session, joinedload
from app.models.models import User
from app.schemas.users import UserCreate, UserUpdate
from app.utils.responses import ResponseHandler
from app.core.security import get_password_hash


class UserService:
    @staticmethod
    def get_all_users(db: Session, page: int, limit: int, search: str = "", role: str = None):
        query = db.query(User).order_by(User.id.asc()).filter(User.username.contains(search))
        if role:
            query = query.filter(User.role == role)
        users = query.limit(limit).offset((page - 1) * limit).all()
        return users

    @staticmethod
    def get_user(db: Session, user_id: int):
        user = db.query(User).options(joinedload(User.carts)).filter(User.id == user_id).first()
        if not user:
            ResponseHandler.not_found_error("User", user_id)
        return user

    @staticmethod
    def create_user(db: Session, user: UserCreate):
        hashed_password = get_password_hash(user.password)
        user.password = hashed_password
        db_user = User(id=None, **user.model_dump())
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return ResponseHandler.create_success(db_user.username, db_user.id, db_user)

    @staticmethod
    def update_user(db: Session, user_id: int, updated_user: UserUpdate):
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            ResponseHandler.not_found_error("User", user_id)

        update_data = updated_user.model_dump(exclude_unset=True)

        if "password" in update_data and update_data["password"]:
            update_data["password"] = get_password_hash(update_data["password"])

        for key, value in update_data.items():
            setattr(db_user, key, value)

        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def delete_user(db: Session, user_id: int):
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            ResponseHandler.not_found_error("User", user_id)
        db.delete(db_user)
        db.commit()
        return db_user
