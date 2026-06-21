from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import uuid
import json

from app.core.database import get_db, cache_get, cache_set
from app.core.security import get_current_user
from app.models.user import User
from app.models.master import Brand, Model, Variant, Color, PhysicalCondition, Accessory
from app.models.unit import Unit, UnitStatus, Transaction, PriceHistory, MLTrainingData
from app.services.rule_engine import AppraisalRuleEngine, UnitAttributes, MarketData
from app.schemas.appraisal import (
    AppraisalRequest, AppraisalResponse, PriceUpdateRequest
)

router = APIRouter()

@router.post("/", response_model=AppraisalResponse)
async def create_appraisal(
    request: AppraisalRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new unit appraisal with price recommendation"""
    
    # Validate relationships
    brand = db.query(Brand).filter(Brand.id == request.brand_id, Brand.is_active == True).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    model = db.query(Model).filter(
        Model.id == request.model_id,
        Model.brand_id == request.brand_id,
        Model.is_active == True
    ).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    variant = db.query(Variant).filter(
        Variant.id == request.variant_id,
        Variant.model_id == request.model_id,
        Variant.is_active == True
    ).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
    
    color = db.query(Color).filter(Color.id == request.color_id, Color.is_active == True).first()
    if not color:
        raise HTTPException(status_code=404, detail="Color not found")
    
    condition = db.query(PhysicalCondition).filter(
        PhysicalCondition.id == request.physical_condition_id
    ).first()
    if not condition:
        raise HTTPException(status_code=404, detail="Physical condition not found")
    
    # Check IMEI uniqueness if provided
    if request.imei:
        existing = db.query(Unit).filter(Unit.imei == request.imei).first()
        if existing:
            raise HTTPException(status_code=400, detail="IMEI already exists")
    
    # Get market data for pricing
    market_data = get_market_data(db, request.brand_id, request.model_id, request.variant_id)
    
    # Prepare unit attributes for rule engine
    unit_attrs = UnitAttributes(
        brand_id=str(request.brand_id),
        model_id=str(request.model_id),
        variant_id=str(request.variant_id),
        color_id=str(request.color_id),
        physical_condition_id=str(request.physical_condition_id),
        physical_condition_score=condition.score,
        battery_health=request.battery_health or 80,
        accessories=[str(a) for a in request.accessories],
        model_launch_year=model.launch_year or datetime.now().year - 2,
        notes=request.notes,
        imei=request.imei
    )
    
    # Run rule engine
    engine = AppraisalRuleEngine()
    result = engine.appraise(unit_attrs, market_data)
    
    # Create unit
    unit = Unit(
        imei=request.imei,
        brand_id=request.brand_id,
        model_id=request.model_id,
        variant_id=request.variant_id,
        color_id=request.color_id,
        physical_condition_id=request.physical_condition_id,
        battery_health=request.battery_health,
        accessories=request.accessories,
        notes=request.notes,
        purchase_price=result.suggested_price,
        status=UnitStatus.APPRAISED,
        appraised_by=current_user.id,
        appraised_at=datetime.utcnow()
    )
    db.add(unit)
    db.flush()
    
    # Create transaction
    transaction = Transaction(
        unit_id=unit.id,
        user_id=current_user.id,
        purchase_price=result.suggested_price,
        status="pending",
        transaction_date=datetime.utcnow(),
        market_price_at_time=result.base_price_used,
        rule_engine_version="1.0.0"
    )
    db.add(transaction)
    
    # Save ML training data
    training_data = MLTrainingData(
        unit_id=unit.id,
        features={
            "physical_condition_score": condition.score,
            "battery_health": request.battery_health or 80,
            "accessories_count": len(request.accessories),
            "device_age": datetime.now().year - (model.launch_year or datetime.now().year - 2),
            "market_transactions": market_data.transaction_count if market_data else 0,
            "demand_score": market_data.demand_score if market_data else 0,
            "brand_id": str(request.brand_id),
            "model_id": str(request.model_id),
            "variant_id": str(request.variant_id)
        },
        actual_price=result.suggested_price,
        model_version="v1.0"
    )
    db.add(training_data)
    
    db.commit()
    
    return AppraisalResponse(
        unit_id=unit.id,
        suggested_price=result.suggested_price,
        price_range_min=result.price_range_min,
        price_range_max=result.price_range_max,
        confidence_score=result.confidence_score,
        adjustments=result.adjustments,
        base_price_used=result.base_price_used,
        components=result.components
    )

@router.get("/{unit_id}/recommendation")
async def get_recommendation(
    unit_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """Recalculate recommendation for existing unit"""
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    
    # Recalculate with latest market data
    market_data = get_market_data(db, unit.brand_id, unit.model_id, unit.variant_id)
    condition = db.query(PhysicalCondition).filter(
        PhysicalCondition.id == unit.physical_condition_id
    ).first()
    model = db.query(Model).filter(Model.id == unit.model_id).first()
    
    unit_attrs = UnitAttributes(
        brand_id=str(unit.brand_id),
        model_id=str(unit.model_id),
        variant_id=str(unit.variant_id),
        color_id=str(unit.color_id),
        physical_condition_id=str(unit.physical_condition_id),
        physical_condition_score=condition.score,
        battery_health=unit.battery_health or 80,
        accessories=unit.accessories or [],
        model_launch_year=model.launch_year or datetime.now().year - 2,
        notes=unit.notes,
        imei=unit.imei
    )
    
    engine = AppraisalRuleEngine()
    result = engine.appraise(unit_attrs, market_data)
    
    return {
        "suggested_price": result.suggested_price,
        "price_range": {
            "min": result.price_range_min,
            "max": result.price_range_max
        },
        "confidence_score": result.confidence_score,
        "adjustments": result.adjustments
    }

@router.put("/{unit_id}/price")
async def update_price(
    unit_id: uuid.UUID,
    request: PriceUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update unit price with reason"""
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    
    # Save price history
    price_history = PriceHistory(
        unit_id=unit.id,
        old_price=unit.purchase_price,
        new_price=request.new_price,
        changed_by=current_user.id,
        reason=request.reason
    )
    db.add(price_history)
    
    # Update unit
    unit.purchase_price = request.new_price
    db.commit()
    
    return {"message": "Price updated successfully"}

def get_market_data(db: Session, brand_id: uuid.UUID, model_id: uuid.UUID, variant_id: uuid.UUID):
    """Fetch market data for pricing"""
    cache_key = f"market_data_{brand_id}_{model_id}_{variant_id}"
    cached = cache_get(cache_key)
    if cached:
        return MarketData(**cached)
    
    from app.models.unit import Unit, Transaction
    from sqlalchemy import func
    
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    result = db.query(
        func.avg(Transaction.purchase_price).label("avg_price"),
        func.min(Transaction.purchase_price).label("min_price"),
        func.max(Transaction.purchase_price).label("max_price"),
        func.count(Transaction.id).label("count"),
    ).join(Unit).filter(
        Unit.brand_id == brand_id,
        Unit.model_id == model_id,
        Unit.variant_id == variant_id,
        Transaction.status == "completed",
        Transaction.created_at >= thirty_days_ago
    ).first()
    
    if result and result.count > 0:
        # Calculate demand score
        demand_score = min(100, (result.count / 10) * 50 + (15 * 50))
        
        market_data = MarketData(
            avg_price=float(result.avg_price or 0),
            min_price=float(result.min_price or 0),
            max_price=float(result.max_price or 0),
            transaction_count=result.count,
            avg_days_to_sell=7,  # Default, would come from DB
            demand_score=round(demand_score, 2)
        )
        
        # Cache for 1 hour
        cache_set(cache_key, market_data.__dict__, expire=3600)
        return market_data
    
    return None

# Add timedelta import
from datetime import timedelta