from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Numeric, Text, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum

from app.core.database import Base

class UnitStatus(str, enum.Enum):
    APPRAISED = "appraised"
    BOUGHT = "bought"
    SOLD = "sold"
    RETURNED = "returned"
    VOID = "void"

class Unit(Base):
    __tablename__ = "units"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    imei = Column(String(15), unique=True)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False)
    model_id = Column(UUID(as_uuid=True), ForeignKey("models.id"), nullable=False)
    variant_id = Column(UUID(as_uuid=True), ForeignKey("variants.id"), nullable=False)
    color_id = Column(UUID(as_uuid=True), ForeignKey("colors.id"), nullable=False)
    physical_condition_id = Column(UUID(as_uuid=True), ForeignKey("physical_conditions.id"), nullable=False)
    battery_health = Column(Integer, nullable=True)
    accessories = Column(JSON, default=list)
    notes = Column(Text)
    purchase_price = Column(Numeric(15, 2))
    selling_price = Column(Numeric(15, 2))
    status = Column(Enum(UnitStatus), default=UnitStatus.APPRAISED)
    appraised_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    appraised_at = Column(DateTime, server_default=func.now())
    bought_at = Column(DateTime)
    sold_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    brand = relationship("Brand")
    model = relationship("Model", back_populates="units")
    variant = relationship("Variant", back_populates="units")
    color = relationship("Color", back_populates="units")
    physical_condition = relationship("PhysicalCondition", back_populates="units")
    appraiser = relationship("User", foreign_keys=[appraised_by])
    transactions = relationship("Transaction", back_populates="unit", cascade="all, delete-orphan")
    price_history = relationship("PriceHistory", back_populates="unit", cascade="all, delete-orphan")
    ml_training_data = relationship("MLTrainingData", back_populates="unit", cascade="all, delete-orphan")

class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    unit_id = Column(UUID(as_uuid=True), ForeignKey("units.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    purchase_price = Column(Numeric(15, 2), nullable=False)
    selling_price = Column(Numeric(15, 2))
    profit = Column(Numeric(15, 2))
    status = Column(Enum(TransactionStatus), default=TransactionStatus.PENDING)
    transaction_date = Column(DateTime, default=func.now())
    notes = Column(Text)
    market_price_at_time = Column(Numeric(15, 2))
    rule_engine_version = Column(String(20))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    unit = relationship("Unit", back_populates="transactions")
    user = relationship("User")

class PriceHistory(Base):
    __tablename__ = "price_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    unit_id = Column(UUID(as_uuid=True), ForeignKey("units.id", ondelete="CASCADE"), nullable=False)
    old_price = Column(Numeric(15, 2))
    new_price = Column(Numeric(15, 2))
    changed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    reason = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    unit = relationship("Unit", back_populates="price_history")
    changer = relationship("User")

class MLTrainingData(Base):
    __tablename__ = "ml_training_data"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    unit_id = Column(UUID(as_uuid=True), ForeignKey("units.id", ondelete="CASCADE"), nullable=False)
    features = Column(JSON, nullable=False)
    actual_price = Column(Numeric(15, 2), nullable=False)
    predicted_price = Column(Numeric(15, 2))
    model_version = Column(String(50))
    is_used_for_training = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    unit = relationship("Unit", back_populates="ml_training_data")