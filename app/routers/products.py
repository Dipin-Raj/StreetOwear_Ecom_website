from fastapi import APIRouter, Depends, Query, status, File, UploadFile, Form
from app.db.database import get_db
from app.services.products import ProductService
from sqlalchemy.orm import Session
from app.schemas.products import ProductCreate, ProductOut, ProductsOut, ProductOutDelete, ProductUpdate
from app.core.security import get_current_user, check_admin_role
from pydantic import ValidationError
from app.models.models import User

router = APIRouter(tags=["Products"], prefix="/products")


# Get All Products
@router.get("/", status_code=status.HTTP_200_OK, response_model=ProductsOut)
def get_all_products(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=0, le=100, description="Items per page"), # Changed ge=1 to ge=0
    search: str | None = Query("", description="Search based title of products"),
    category_id: int | None = Query(None, description="Filter by category ID"),
    sort_by: str | None = Query(None, description="Sort by column (e.g., 'created_at')"),
    current_user: User = Depends(get_current_user)
):
    return ProductService.get_all_products(db, page, limit, search, category_id, sort_by, current_user)


# Get Product By ID
@router.get("/{product_id}", status_code=status.HTTP_200_OK, response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return ProductService.get_product(db, product_id)


# Create New Product
@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=ProductOut,
    dependencies=[Depends(check_admin_role)])
def create_product(
        title: str = Form(...),
        description: str = Form(...),
        price: float = Form(...),
        discount_percentage: float = Form(0.0),
        rating: float = Form(0.0),
        stock: int = Form(...),
        brand: str = Form(...),
        category_id: int = Form(...),
        is_published: bool = Form(True),
        thumbnail: UploadFile = File(...),
        images: list[UploadFile] = File([]),
        db: Session = Depends(get_db)):
    try:
        product_data = ProductCreate(title=title, description=description, price=price, discount_percentage=discount_percentage, rating=rating, stock=stock, brand=brand, category_id=category_id, is_published=is_published)
    except ValidationError as e:
        print(e)
        raise e
    return ProductService.create_product(db, product_data, thumbnail, images)


# Update Exist Product
@router.put(
    "/{product_id}",
    status_code=status.HTTP_200_OK,
    response_model=ProductOut,
    dependencies=[Depends(check_admin_role)])
def update_product(
        product_id: int,
        product_data: ProductUpdate,
        thumbnail: UploadFile | None = File(None),
        images: list[UploadFile] = File([]),
        db: Session = Depends(get_db)):
    return ProductService.update_product(db, product_id, product_data, thumbnail, images)


# Delete Product By ID
@router.delete(
    "/{product_id}",
    status_code=status.HTTP_200_OK,
    response_model=ProductOutDelete,
    dependencies=[Depends(check_admin_role)])
def delete_product(
        product_id: int,
        db: Session = Depends(get_db)):
    return ProductService.delete_product(db, product_id)


# Delete Product Image By ID
@router.delete(
    "/{product_id}/images/{image_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(check_admin_role)])
def delete_product_image(
        product_id: int,
        image_id: int,
        db: Session = Depends(get_db)):
    ProductService.delete_product_image(db, product_id, image_id)
    return {"message": "Image deleted successfully"}
