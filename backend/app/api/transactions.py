from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.transaction_csv_upload import TransactionCsvUploadService
from app.core.database import get_db
from app.repositories.transaction import TransactionRepository
from app.schemas.transaction import TransactionPaginatedResponse, TransactionSchema
from app.schemas.analytics import NavPieChartResponse, NavPieChartSlice, SchemeUsersResponse, SchemeUsersResponseItem, SchemeUser, BarChartResponse, BarChartSchemeData, DashboardSummaryResponse
from fastapi.responses import StreamingResponse
from app.services.pdf_generator import PDFReportGenerator
from app.services.analytics import AnalyticsService
import io

router = APIRouter()

@router.post("/transactions/upload")
async def upload_transactions_csv(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    service = TransactionCsvUploadService()
    try:
        result = await service.process_and_insert(db, file)
        return {"inserted": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transactions", response_model=TransactionPaginatedResponse)
async def get_transactions(
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    repo = TransactionRepository()
    try:
        result = await repo.get_all_paginated(db, offset=offset, limit=limit)
        items = [TransactionSchema.model_validate(obj) for obj in result["items"]]
        return TransactionPaginatedResponse(items=items, total=result["total"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transactions/nav-pie-chart", response_model=NavPieChartResponse)
async def get_nav_pie_chart(db: AsyncSession = Depends(get_db)):
    repo = TransactionRepository()
    try:
        rows = await repo.get_nav_units_grouped_by_scheme_and_user(db)
        slices = [
            NavPieChartSlice(
                scheme=row.scheme,
                usercode=row.usercode,
                user_name=row.inv_name,
                total_units=row.total_units,
                nav_price=row.nav_price
            )
            for row in rows
        ]
        return NavPieChartResponse(slices=slices)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transactions/scheme-users", response_model=SchemeUsersResponse)
async def get_scheme_users(db: AsyncSession = Depends(get_db)):
    repo = TransactionRepository()
    try:
        schemes = await repo.get_all_schemes(db)
        scheme_users = []
        for scheme in schemes:
            users = await repo.get_users_by_scheme(db, scheme)
            scheme_users.append(
                SchemeUsersResponseItem(
                    scheme=scheme,
                    users=[SchemeUser(**user) for user in users]
                )
            )
        return SchemeUsersResponse(schemes=scheme_users)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transactions/nav-bar-chart", response_model=BarChartResponse)
async def get_nav_bar_chart(db: AsyncSession = Depends(get_db)):
    repo = TransactionRepository()
    try:
        rows = await repo.get_units_and_amount_grouped_by_scheme(db)
        data = [
            BarChartSchemeData(
                scheme=row.scheme,
                total_units=row.total_units or 0.0,
                total_amount=row.total_amount or 0.0
            )
            for row in rows
        ]
        return BarChartResponse(data=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transactions/export-report")
async def export_report(db: AsyncSession = Depends(get_db)):
    repo = TransactionRepository()

    schemes = await repo.get_units_and_amount_grouped_by_scheme(db)
    slices = await repo.get_nav_units_grouped_by_scheme_and_user(db)
    scheme_details = []
    all_schemes = await repo.get_all_schemes(db)
    for scheme in all_schemes:
        users = await repo.get_users_by_scheme(db, scheme)
        scheme_details.append({
            "scheme": scheme,
            "users": users
        })

    pdf_data = {
        "schemes": [
            {"scheme": row.scheme, "total_units": row.total_units or 0.0, "total_amount": row.total_amount or 0.0}
            for row in schemes
        ],
        "slices": [
            {
                "scheme": row.scheme,
                "usercode": row.usercode,
                "user_name": row.inv_name,
                "total_units": row.total_units,
                "nav_price": row.nav_price
            }
            for row in slices
        ],
        "details": scheme_details
    }
    generator = PDFReportGenerator()
    pdf_bytes = generator.generate_report(pdf_data)
    return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=investment_report.pdf"})

@router.get("/transactions/dashboard-summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(db: AsyncSession = Depends(get_db)):
    summary = await AnalyticsService.get_dashboard_summary(db)
    return DashboardSummaryResponse(**summary)
