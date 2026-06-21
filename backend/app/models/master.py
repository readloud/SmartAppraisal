from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Numeric, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base

class Brand(Base):
    __tablename__ = "brands"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    logo_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    models = relationship("Model", back_populates="brand", cascade="all, delete-orphan")

class Model(Base):
    __tablename__ = "models"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    launch_year = Column(Integer)
    release_price = Column(Numeric(15, 2))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    brand = relationship("Brand", back_populates="models")
    variants = relationship("Variant", back_populates="model", cascade="all, delete-orphan")
    units = relationship("Unit", back_populates="model")

class Variant(Base):
    __tablename__ = "variants"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_id = Column(UUID(as_uuid=True), ForeignKey("models.id", ondelete="CASCADE"), nullable=False)
    ram = Column(Integer, nullable=False)
    rom = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    model = relationship("Model", back_populates="variants")
    units = relationship("Unit", back_populates="variant")

class Color(Base):
    __tablename__ = "colors"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False)
    hex_code = Column(String(7))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    units = relationship("Unit", back_populates="color")

class PhysicalCondition(Base):
    __tablename__ = "physical_conditions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    label = Column(String(50), unique=True, nullable=False)
    score = Column(Integer, nullable=False)
    description = Column(String(500))
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    units = relationship("Unit", back_populates="physical_condition")

class Accessory(Base):
    __tablename__ = "accessories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    weight = Column(Numeric(3, 2), default=1.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())