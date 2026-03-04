"""
Analytics Schemas
Pydantic models for analytics-related requests and responses
"""

from typing import Optional, List
from pydantic import BaseModel


class AnalyticsEventResponse(BaseModel):
    """Analytics event response"""
    id: str
    user_id: Optional[str] = None
    event_type: str
    page: str
    metadata: Optional[dict] = None
    timestamp: str


class AnalyticsEventCreate(BaseModel):
    """Create analytics event request"""
    event_type: str
    page: str
    metadata: Optional[dict] = None


class AnalyticsSummary(BaseModel):
    """Analytics summary response"""
    total_users: int
    total_words: int
    total_posts: int
    total_page_views: Optional[int] = 0
    active_today: Optional[int] = 0
    active_this_week: Optional[int] = 0
    active_this_month: Optional[int] = 0
