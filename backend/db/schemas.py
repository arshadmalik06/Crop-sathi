from typing import Any, Optional

from pydantic import BaseModel, Field


class CropRecommendationRequest(BaseModel):
    N: int = Field(..., ge=0, le=1000, description="Nitrogen content in soil (kg/ha)")
    P: int = Field(..., ge=0, le=1000, description="Phosphorus content in soil (kg/ha)")
    K: int = Field(..., ge=0, le=1000, description="Potassium content in soil (kg/ha)")
    ph: float = Field(..., ge=0, le=14, description="Soil pH")
    rainfall: float = Field(..., ge=0, le=5000, description="Rainfall (mm)")
    lat: Optional[float] = Field(None, description="Latitude, used to fetch live weather")
    lon: Optional[float] = Field(None, description="Longitude, used to fetch live weather")
    temperature: Optional[float] = Field(None, description="Override temperature (°C) if known")
    humidity: Optional[float] = Field(None, description="Override humidity (%) if known")


class CropRecommendationResponse(BaseModel):
    success: bool
    prediction: Optional[str] = None
    confidence: Optional[float] = None
    top_3: Optional[list[str]] = None
    top_3_confidence: Optional[list[float]] = None
    inputs: Optional[dict[str, Any]] = None
    error: Optional[str] = None


class DiseaseDetectionResponse(BaseModel):
    success: bool
    predicted_class: Optional[str] = None
    plant_name: Optional[str] = None
    disease_status: Optional[str] = None
    confidence: Optional[float] = None
    is_confident: Optional[bool] = None
    model_used: Optional[str] = None
    error: Optional[str] = None


class SyncAction(BaseModel):
    type: str = Field(..., description="'crop_recommendation' or 'disease_detection'")
    payload: dict[str, Any]
    client_id: Optional[str] = Field(None, description="Client-generated id to correlate results")


class SyncRequest(BaseModel):
    actions: list[SyncAction]


class SyncResultItem(BaseModel):
    client_id: Optional[str]
    type: str
    success: bool
    result: Optional[dict[str, Any]] = None
    error: Optional[str] = None


class SyncResponse(BaseModel):
    results: list[SyncResultItem]
