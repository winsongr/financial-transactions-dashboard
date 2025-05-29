from pydantic import BaseModel
from typing import List

class NavPieChartSlice(BaseModel):
    scheme: str
    usercode: str
    user_name: str
    total_units: float
    nav_price: float

class NavPieChartResponse(BaseModel):
    slices: List[NavPieChartSlice]

class SchemeUser(BaseModel):
    usercode: str
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
