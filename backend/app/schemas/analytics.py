from pydantic import BaseModel
from typing import List


class SchemeUser(BaseModel):
    pan: str
    inv_name: str
    total_units: float
    total_amount: float


class SchemeUsersResponseItem(BaseModel):
    scheme: str
    users: List[SchemeUser]


class SchemeUsersResponse(BaseModel):
    schemes: List[SchemeUsersResponseItem]


class BarChartSchemeData(BaseModel):
    scheme: str
    total_units: float
    total_amount: float


class BarChartResponse(BaseModel):
    data: List[BarChartSchemeData]


class DashboardSummaryResponse(BaseModel):
    total_investors: int
    total_schemes: int
    total_investments: int
    total_nav_units: float
    total_nav_amount: float


class UserSchemeAggregateScheme(BaseModel):
    scheme: str
    total_units: float
    total_amount: float
    nav_price: float


class UserSchemeAggregate(BaseModel):
    pan: str
    inv_name: str
    schemes: list[UserSchemeAggregateScheme]


class UserSchemeAggregateResponse(BaseModel):
    users: list[UserSchemeAggregate]
