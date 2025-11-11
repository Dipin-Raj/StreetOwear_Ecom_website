from fastapi import APIRouter, Depends, Query, status
from app.db.database import get_db
from app.services.users import UserService
from sqlalchemy.orm import Session
from app.schemas.users import UserCreate, UserOut, UsersOut, UserOutDelete, UserUpdate, AdminOut
from app.core.security import get_current_user, check_admin_role
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials
from app.models.models import User
from app.utils.responses import ResponseHandler


router = APIRouter(tags=["Users"], prefix="/users")
auth_scheme = HTTPBearer()


# Get All Users
@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=UsersOut,
    dependencies=[Depends(check_admin_role)])
def get_all_users(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: str | None = Query("", description="Search based username"),
    role: str = Query("user", enum=["user", "admin"])
):
    users = UserService.get_all_users(db, page, limit, search, role)
    return {"message": f"Page {page} with {limit} users", "data": users}


# Get Current User Profile
@router.get("/me", status_code=status.HTTP_200_OK, response_model=UserOut)
def get_current_user_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = UserService.get_user(db, current_user.id)
    return ResponseHandler.success("Successfully retrieved current user", user)


# Get Current Admin Profile
@router.get("/admin/me", status_code=status.HTTP_200_OK, response_model=AdminOut, dependencies=[Depends(check_admin_role)])
def get_current_admin_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = UserService.get_user(db, current_user.id)
    return ResponseHandler.success("Successfully retrieved current admin", user)


# Get User By ID
@router.get(
    "/{user_id}",
    status_code=status.HTTP_200_OK,
    response_model=UserOut,
    dependencies=[Depends(check_admin_role)])
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = UserService.get_user(db, user_id)
    return ResponseHandler.success(f"Successfully retrieved user with id {user_id}", user)


# Update Current User Profile
@router.put("/me", status_code=status.HTTP_200_OK, response_model=UserOut)
def update_current_user_profile(
    updated_user: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = UserService.update_user(db, current_user.id, updated_user)
    return ResponseHandler.success("Successfully updated current user", user)


# Update Existing User
@router.put(
    "/{user_id}",
    status_code=status.HTTP_200_OK,
    response_model=UserOut,
    dependencies=[Depends(check_admin_role)])
def update_user(user_id: int, updated_user: UserUpdate, db: Session = Depends(get_db)):
    user = UserService.update_user(db, user_id, updated_user)
    return ResponseHandler.success(f"Successfully updated user with id {user_id}", user)


# Delete User By ID
@router.delete(
    "/{user_id}",
    status_code=status.HTTP_200_OK,
    response_model=UserOutDelete,
    dependencies=[Depends(check_admin_role)])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = UserService.delete_user(db, user_id)
    return ResponseHandler.success(f"Successfully deleted user with id {user_id}", user)


@router.get("/test", status_code=status.HTTP_200_OK)
def test_endpoint():
    return {"message": "Test successful"}
