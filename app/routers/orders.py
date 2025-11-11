from fastapi import APIRouter, Depends, Query, status
from app.db.database import get_db
from app.services.orders import OrderService
from sqlalchemy.orm import Session
from app.schemas.orders import OrderOut, OrdersOut, OrderCreate
from app.core.security import get_current_user, check_admin_role
from app.models.models import User

router = APIRouter(tags=["Orders"], prefix="/orders")

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=OrderOut)
def create_order(
    order_details: OrderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return OrderService.create_order(db, user.id, order_details)

@router.get("/", status_code=status.HTTP_200_OK, response_model=OrdersOut)
def get_user_orders(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    user: User = Depends(get_current_user)
):
    return OrderService.get_user_orders(db, user.id, page, limit)

@router.get("/all", status_code=status.HTTP_200_OK, response_model=OrdersOut, dependencies=[Depends(check_admin_role)])
def get_all_orders(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
):
    return OrderService.get_all_orders(db, page, limit)

@router.put("/{order_id}/status", status_code=status.HTTP_200_OK, response_model=OrderOut, dependencies=[Depends(check_admin_role)])
def update_order_status(
    order_id: int,
    new_status: str = Query(..., description="New status for the order"),
    db: Session = Depends(get_db),
):
    return OrderService.update_order_status(db, order_id, new_status)

@router.delete("/{order_id}", status_code=status.HTTP_200_OK)
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return OrderService.delete_order(db, order_id, user.id)
