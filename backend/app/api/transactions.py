import re
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.transaction_csv_upload import TransactionCsvUploadService
from app.core.database import get_db
from app.repositories.transaction import TransactionRepository
from app.schemas.transaction import (
    TransactionPaginatedResponse,
    TransactionSchema,
)
from app.schemas.analytics import (
    SchemeUsersResponse,
    SchemeUsersResponseItem,
    SchemeUser,
    BarChartResponse,
    BarChartSchemeData,
    DashboardSummaryResponse,
    UserSchemeAggregateResponse,
)
from fastapi.responses import StreamingResponse
from app.services.pdf_generator import PDFReportGenerator
from app.services.analytics import AnalyticsService
import io
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/transactions/upload")
async def upload_transactions_csv(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type != "text/csv" or not file.filename.lower().endswith(
        ".csv"
    ):
        logger.error(f"Invalid file: {file.filename} ({file.content_type})")
        raise HTTPException(400, "Please upload a valid CSV file.")
    content = await file.read()
    if not content:
        logger.error("Upload failed: empty file")
        raise HTTPException(400, "Uploaded file is empty.")
    await file.seek(0)
    svc = TransactionCsvUploadService()
    try:
        inserted = await svc.process_and_insert(db, file)
        logger.info(f"CSV upload successful: {inserted} records inserted.")
        return {"inserted": inserted}
    except ValueError as e:
        msg = str(e)
        logger.error(f"CSV upload failed: {msg}")
        if "Missing columns" in msg:
            m = re.search(r"Missing columns: (\[.*?\])", msg)
            detail = (
                f"Missing required columns: {m.group(1)}. Please use the provided template."
                if m
                else "Missing required columns. Please use the provided template."
            )
            raise HTTPException(400, detail)

        if "Failed to convert column" in msg:
            raise HTTPException(
                400,
                "Some columns contain invalid data. Please check your file.",
            )
        if "CSV validation failed" in msg:
            raise HTTPException(
                400,
                "CSV format is invalid. Please check your file and required columns.",
            )
        raise HTTPException(500, "Upload failed: " + msg)
    except Exception as exc:
        logger.error(f"Unexpected error during CSV upload: {exc}")
        raise HTTPException(500, f"An unexpected error occurred: {exc}")


@router.get("/transactions", response_model=TransactionPaginatedResponse)
async def get_transactions(
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    repo = TransactionRepository()
    try:
        result = await repo.get_all_paginated(db, offset=offset, limit=limit)
        items = [
            TransactionSchema.model_validate(obj) for obj in result["items"]
        ]
        return TransactionPaginatedResponse(items=items, total=result["total"])
    except Exception as e:
        logger.error(f"Error getting transactions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/transactions/scheme-users", response_model=SchemeUsersResponse)
async def get_scheme_users(db: AsyncSession = Depends(get_db)):
    repo = TransactionRepository()
    try:
        schemes = await repo.get_all_schemes(db)
        scheme_users = []
        for scheme in schemes:
            users = await repo.get_users_by_scheme(db, scheme)
            pan_map = {}
            for user in users:
                pan = user["pan"]
                if pan not in pan_map:
                    pan_map[pan] = {
                        "pan": pan,
                        "inv_name": user["inv_name"],
                        "total_units": 0.0,
                        "total_amount": 0.0,
                    }
                pan_map[pan]["total_units"] += user["total_units"] or 0.0
                pan_map[pan]["total_amount"] += user["total_amount"] or 0.0
            scheme_users.append(
                SchemeUsersResponseItem(
                    scheme=scheme,
                    users=[SchemeUser(**user) for user in pan_map.values()],
                )
            )
        return SchemeUsersResponse(schemes=scheme_users)
    except Exception as e:
        logger.error(f"Error getting scheme users: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/transactions/scheme-distribution", response_model=BarChartResponse
)
async def get_nav_bar_chart(db: AsyncSession = Depends(get_db)):
    repo = TransactionRepository()
    try:
        rows = await repo.get_units_and_amount_grouped_by_scheme(db)
        data = [
            BarChartSchemeData(
                scheme=row.scheme,
                total_units=row.total_units or 0.0,
                total_amount=row.total_amount or 0.0,
            )
            for row in rows
        ]
        return BarChartResponse(data=data)
    except Exception as e:
        logger.error(f"Error getting scheme distribution: {e}")
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
        scheme_details.append({"scheme": scheme, "users": users})

    pdf_data = {
        "schemes": [
            {
                "scheme": row.scheme,
                "total_units": row.total_units or 0.0,
                "total_amount": row.total_amount or 0.0,
            }
            for row in schemes
        ],
        "slices": [
            {
                "scheme": row.scheme,
                "pan": row.pan,
                "user_name": row.inv_name,
                "total_units": row.total_units,
                "nav_price": row.nav_price,
            }
            for row in slices
        ],
        "details": scheme_details,
    }
    generator = PDFReportGenerator()
    pdf_bytes = generator.generate_report(pdf_data)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=investment_report.pdf"
        },
    )


@router.get(
    "/transactions/dashboard-summary", response_model=DashboardSummaryResponse
)
async def get_dashboard_summary(db: AsyncSession = Depends(get_db)):
    summary = await AnalyticsService.get_dashboard_summary(db)
    return DashboardSummaryResponse(**summary)


@router.get(
    "/transactions/user-scheme-aggregates",
    response_model=UserSchemeAggregateResponse,
)
async def get_user_scheme_aggregates(db: AsyncSession = Depends(get_db)):
    repo = TransactionRepository()
    try:
        users = await repo.get_user_scheme_aggregates(db)
        return UserSchemeAggregateResponse(users=users)
    except Exception as e:
        logger.error(f"Error getting user scheme aggregates: {e}")
        raise HTTPException(status_code=500, detail=str(e))
