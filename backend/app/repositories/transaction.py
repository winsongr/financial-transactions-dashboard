from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .base import SQLAlchemyRepository
from ..models.transaction import Transaction


class TransactionRepository(SQLAlchemyRepository[Transaction]):
    def __init__(self):
        super().__init__(Transaction)

    async def get_by_user(
        self, db: AsyncSession, pan: str
    ) -> List[Transaction]:
        result = await db.execute(
            select(self.model).where(self.model.pan == pan)
        )
        return result.scalars().all()

    async def aggregate_total_amount_by_user(
        self, db: AsyncSession, pan: str
    ) -> float:
        result = await db.execute(
            select(func.sum(self.model.amount)).where(self.model.pan == pan)
        )
        value = result.scalar()
        return value or 0.0

    async def exists_by_trxnno(self, db: AsyncSession, trxnno: str) -> bool:
        result = await db.execute(
            select(self.model.id).where(self.model.trxnno == trxnno)
        )
        return result.first() is not None

    async def bulk_insert(
        self, db: AsyncSession, objs_in: List[Dict[str, Any]]
    ) -> List[Transaction]:
        objs = [self.model(**obj_in) for obj_in in objs_in]
        db.add_all(objs)
        await db.commit()
        return objs

    async def bulk_update(
        self,
        db: AsyncSession,
        updates: List[Dict[str, Any]],
        id_field: str = "id",
    ) -> int:
        count = 0
        for update in updates:
            obj_id = update.get(id_field)
            if obj_id is None:
                continue
            result = await db.execute(
                select(self.model).where(
                    getattr(self.model, id_field) == obj_id
                )
            )
            obj = result.scalar_one_or_none()
            if obj:
                for key, value in update.items():
                    if key != id_field:
                        setattr(obj, key, value)
                count += 1
        await db.commit()
        return count

    async def get_all_paginated(
        self, db: AsyncSession, offset: int = 0, limit: int = 10
    ) -> dict:
        try:
            total = await db.execute(select(func.count(self.model.id)))
            total_count = total.scalar()
            result = await db.execute(
                select(self.model).offset(offset).limit(limit)
            )
            items = result.scalars().all()
            return {"items": items, "total": total_count}
        except Exception as e:
            print(f"Error in paginated fetch: {e}")
            return {"items": [], "total": 0}

    async def get_nav_units_grouped_by_scheme_and_user(self, db: AsyncSession):
        stmt = (
            select(
                self.model.scheme,
                self.model.pan,
                self.model.inv_name,
                func.sum(self.model.units).label("total_units"),
                func.max(self.model.purprice).label("nav_price"),
            )
            .where(self.model.units is not None)
            .group_by(self.model.scheme, self.model.pan, self.model.inv_name)
        )
        result = await db.execute(stmt)
        return result.all()

    async def get_all_schemes(self, db: AsyncSession) -> list[str]:
        stmt = (
            select(self.model.scheme)
            .distinct()
            .where(self.model.scheme.isnot(None))
        )
        result = await db.execute(stmt)
        return [row[0] for row in result.fetchall()]

    async def get_users_by_scheme(
        self, db: AsyncSession, scheme: str
    ) -> list[dict]:
        stmt = (
            select(
                self.model.pan,
                self.model.inv_name,
                func.sum(self.model.units).label("total_units"),
                func.sum(self.model.amount).label("total_amount"),
            )
            .where(self.model.scheme == scheme)
            .where(self.model.pan.isnot(None))
            .where(self.model.inv_name.isnot(None))
            .group_by(self.model.pan, self.model.inv_name)
        )
        result = await db.execute(stmt)
        return [
            {
                "pan": row[0],
                "inv_name": row[1],
                "total_units": row[2],
                "total_amount": row[3],
            }
            for row in result.fetchall()
        ]

    async def get_units_and_amount_grouped_by_scheme(self, db: AsyncSession):
        stmt = (
            select(
                self.model.scheme,
                func.sum(self.model.units).label("total_units"),
                func.sum(self.model.amount).label("total_amount"),
            )
            .where(self.model.scheme.isnot(None))
            .group_by(self.model.scheme)
        )
        result = await db.execute(stmt)
        return result.all()

    async def get_user_scheme_aggregates(self, db: AsyncSession):
        stmt = (
            select(
                self.model.pan,
                self.model.inv_name,
                self.model.scheme,
                func.sum(self.model.units).label("total_units"),
                func.sum(self.model.amount).label("total_amount"),
                func.max(self.model.purprice).label("nav_price"),
            )
            .where(self.model.pan.isnot(None))
            .group_by(self.model.pan, self.model.inv_name, self.model.scheme)
        )
        result = await db.execute(stmt)
        rows = result.fetchall()
        users = {}
        for row in rows:
            pan, inv_name, scheme, total_units, total_amount, nav_price = row
            if pan not in users:
                users[pan] = {"pan": pan, "inv_name": inv_name, "schemes": {}}
            if scheme not in users[pan]["schemes"]:
                users[pan]["schemes"][scheme] = {
                    "scheme": scheme,
                    "total_units": 0.0,
                    "total_amount": 0.0,
                    "nav_price": 0.0,
                }
            users[pan]["schemes"][scheme]["total_units"] += total_units or 0.0
            users[pan]["schemes"][scheme]["total_amount"] += (
                total_amount or 0.0
            )
            users[pan]["schemes"][scheme]["nav_price"] = max(
                users[pan]["schemes"][scheme]["nav_price"], nav_price or 0.0
            )
        for pan in users:
            users[pan]["schemes"] = list(users[pan]["schemes"].values())
        return list(users.values())
