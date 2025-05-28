from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Type, List, Optional, Any, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select

T = TypeVar('T')

class AbstractRepository(ABC, Generic[T]):
    def __init__(self, model: Type[T]):
        self.model = model

    @abstractmethod
    async def get(self, db: AsyncSession, id: int) -> Optional[T]:
        pass

    @abstractmethod
    async def get_all(self, db: AsyncSession) -> List[T]:
        pass

    @abstractmethod
    async def create(self, db: AsyncSession, obj_in: dict) -> Optional[T]:
        pass

    @abstractmethod
    async def update(self, db: AsyncSession, db_obj: T, obj_in: dict) -> Optional[T]:
        pass

    @abstractmethod
    async def delete(self, db: AsyncSession, id: int) -> bool:
        pass

    async def filter_query(self, db: AsyncSession, filters: Dict[str, Any]):
        stmt = select(self.model)
        for attr, value in filters.items():
            stmt = stmt.where(getattr(self.model, attr) == value)
        result = await db.execute(stmt)
        return result.scalars().all()

class SQLAlchemyRepository(AbstractRepository[T]):
    async def get(self, db: AsyncSession, id: int) -> Optional[T]:
        try:
            result = await db.execute(select(self.model).where(self.model.id == id))
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            print(f"Error fetching {self.model.__name__} by id: {e}")
            return None

    async def get_all(self, db: AsyncSession) -> List[T]:
        try:
            result = await db.execute(select(self.model))
            return result.scalars().all()
        except SQLAlchemyError as e:
            print(f"Error fetching all {self.model.__name__}: {e}")
            return []

    async def create(self, db: AsyncSession, obj_in: dict) -> Optional[T]:
        try:
            obj = self.model(**obj_in)
            db.add(obj)
            await db.commit()
            await db.refresh(obj)
            return obj
        except SQLAlchemyError as e:
            await db.rollback()
            print(f"Error creating {self.model.__name__}: {e}")
            return None

    async def update(self, db: AsyncSession, db_obj: T, obj_in: dict) -> Optional[T]:
        try:
            for key, value in obj_in.items():
                setattr(db_obj, key, value)
            await db.commit()
            await db.refresh(db_obj)
            return db_obj
        except SQLAlchemyError as e:
            await db.rollback()
            print(f"Error updating {self.model.__name__}: {e}")
            return None

    async def delete(self, db: AsyncSession, id: int) -> bool:
        try:
            result = await db.execute(select(self.model).where(self.model.id == id))
            obj = result.scalar_one_or_none()
            if obj:
                await db.delete(obj)
                await db.commit()
                return True
            return False
        except SQLAlchemyError as e:
            await db.rollback()
            print(f"Error deleting {self.model.__name__}: {e}")
            return False 