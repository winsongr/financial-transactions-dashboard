from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, distinct
from app.models.transaction import Transaction


class AnalyticsService:
    @staticmethod
    async def get_dashboard_summary(db: AsyncSession) -> dict:
        try:
            total_investors_result = await db.execute(
                select(func.count(distinct(Transaction.pan))).where(
                    Transaction.pan.isnot(None)
                )
            )
            total_investors = total_investors_result.scalar() or 0

            total_schemes_result = await db.execute(
                select(func.count(distinct(Transaction.scheme))).where(
                    Transaction.scheme.isnot(None)
                )
            )
            total_schemes = total_schemes_result.scalar() or 0

            total_investments_result = await db.execute(
                select(func.count(Transaction.id))
            )
            total_investments = total_investments_result.scalar() or 0

            total_nav_units_result = await db.execute(
                select(func.sum(Transaction.units))
            )
            total_nav_units = total_nav_units_result.scalar() or 0.0

            total_nav_amount_result = await db.execute(
                select(func.sum(Transaction.amount))
            )
            total_nav_amount = total_nav_amount_result.scalar() or 0.0

            return {
                "total_investors": total_investors,
                "total_schemes": total_schemes,
                "total_investments": total_investments,
                "total_nav_units": total_nav_units,
                "total_nav_amount": total_nav_amount,
            }
        except Exception as e:
            print(f"Error in dashboard summary: {e}")
            return {
                "total_investors": 0,
                "total_schemes": 0,
                "total_investments": 0,
                "total_nav_units": 0.0,
                "total_nav_amount": 0.0,
            }
