from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User
from app.schemas.user import UserCreate, UserResponse, Token, RefreshRequest
from app.utils.auth import hash_password, verify_password, create_access_token, create_refresh_token, decode_refresh_token
from app.dependencies import get_current_user
from app.core.logging_config import logger

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201,
    summary="Register a new user",
    description="""
Register a new user in the CRM system.

**Roles available:**
- `admin` → Full access to everything
- `manager` → Can manage team data
- `sales_rep` → Can only access own data

**Returns:** Created user object with id, email, role, and timestamps.
    """
)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hash_password(user_data.password),
        role=user_data.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info(f"New user registered: {user.email} (role={user.role})")
    return user

@router.post(
    "/login",
    response_model=Token,
    summary="Login and get access token",
    description="""
Authenticate a user and return a JWT access token and refresh token.

**How to use the token:**
- Copy the `access_token` from the response
- Click the **Authorize** button at the top of Swagger UI
- Paste the token to access protected endpoints

**Access token expires in:** 30 minutes
**Refresh token expires in:** 7 days — use it against `/api/auth/refresh` to get a new access token.
    """
)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        logger.warning(f"Failed login attempt for email: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    refresh_token = create_refresh_token(data={"sub": user.email})
    user.refresh_token = refresh_token
    db.commit()
    logger.info(f"User logged in: {user.email}")
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post(
    "/refresh",
    response_model=Token,
    summary="Get a new access token using a refresh token",
    description="""
Exchange a valid refresh token for a new access token.

**Use this when:** the access token has expired (401 responses).

**Returns 401** if the refresh token is invalid, expired, or doesn't match what's stored for the user.
    """
)
def refresh(data: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_refresh_token(data.refresh_token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user or user.refresh_token != data.refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    new_refresh_token = create_refresh_token(data={"sub": user.email})
    user.refresh_token = new_refresh_token
    db.commit()
    return {"access_token": access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}


@router.post(
    "/logout",
    status_code=204,
    summary="Logout and revoke refresh token",
    description="""
Clears the stored refresh token for the current user, so it can no longer be used to get new access tokens.
    """
)
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.refresh_token = None
    db.commit()

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current logged-in user",
    description="""
Returns the profile of the currently authenticated user.

**Requires:** Valid JWT token in Authorization header.

**Returns:** User object with id, email, full name, role, and status.
    """
)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
