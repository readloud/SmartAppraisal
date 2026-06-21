from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import ipaddress

from app.core.database import get_db
from app.core.security import (
    verify_password, get_password_hash, create_access_token,
    create_refresh_token, verify_token, get_current_user
)
from app.core.config import settings
from app.models.user import User, Session as UserSession, AuditLog
from app.schemas.auth import (
    LoginRequest, LoginResponse, RefreshTokenRequest,
    UserResponse, ChangePasswordRequest
)

router = APIRouter()
security = HTTPBearer()

@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """User login"""
    # Find user
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    # Generate tokens
    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    
    # Save session
    session = UserSession(
        user_id=user.id,
        token=access_token,
        expires_at=datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    db.add(session)
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Log audit
    audit = AuditLog(
        user_id=user.id,
        action="login",
        table_name="users",
        record_id=user.id,
        ip_address=str(request.client.host) if hasattr(request, 'client') else None,
        user_agent=request.headers.get("user-agent")
    )
    db.add(audit)
    db.commit()
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )

@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """User logout - invalidate session"""
    # Get token from header
    token = security.required(request)
    
    session = db.query(UserSession).filter(
        UserSession.token == token.credentials,
        UserSession.user_id == current_user.id
    ).first()
    
    if session:
        db.delete(session)
        db.commit()
    
    # Log audit
    audit = AuditLog(
        user_id=current_user.id,
        action="logout",
        table_name="users",
        record_id=current_user.id
    )
    db.add(audit)
    db.commit()
    
    return {"message": "Logged out successfully"}

@router.post("/refresh")
async def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """Refresh access token"""
    try:
        payload = verify_token(request.refresh_token, token_type="refresh")
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Create new access token
        new_access_token = create_access_token({"sub": str(user.id), "role": user.role})
        
        # Update session
        session = db.query(UserSession).filter(
            UserSession.token == request.refresh_token
        ).first()
        
        if session:
            session.token = new_access_token
            session.expires_at = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            db.commit()
        
        return {"access_token": new_access_token, "token_type": "bearer"}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    """Get current user info"""
    return UserResponse.from_orm(current_user)

@router.put("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    if not verify_password(request.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password"
        )
    
    if request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    current_user.password_hash = get_password_hash(request.new_password)
    db.commit()
    
    # Log audit
    audit = AuditLog(
        user_id=current_user.id,
        action="change_password",
        table_name="users",
        record_id=current_user.id
    )
    db.add(audit)
    db.commit()
    
    return {"message": "Password changed successfully"}