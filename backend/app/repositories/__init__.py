from typing import Generic, TypeVar, Type, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

T = TypeVar('T')

class BaseRepository(Generic[T]):
    def __init__(self, model: Type[T]):
        self.model = model

    def get(self, db: Session, id: int) -> Optional[T]:
        try:
            return db.query(self.model).get(id)
        except SQLAlchemyError as e:
            print(f"Error fetching {self.model.__name__} by id: {e}")
            return None

    def get_all(self, db: Session) -> List[T]:
        try:
            return db.query(self.model).all()
        except SQLAlchemyError as e:
            print(f"Error fetching all {self.model.__name__}: {e}")
            return []

    def create(self, db: Session, obj_in: dict) -> Optional[T]:
        try:
            obj = self.model(**obj_in)
            db.add(obj)
            db.commit()
            db.refresh(obj)
            return obj
        except SQLAlchemyError as e:
            db.rollback()
            print(f"Error creating {self.model.__name__}: {e}")
            return None

    def update(self, db: Session, db_obj: T, obj_in: dict) -> Optional[T]:
        try:
            for key, value in obj_in.items():
                setattr(db_obj, key, value)
            db.commit()
            db.refresh(db_obj)
            return db_obj
        except SQLAlchemyError as e:
            db.rollback()
            print(f"Error updating {self.model.__name__}: {e}")
            return None

    def delete(self, db: Session, id: int) -> bool:
        try:
            obj = db.query(self.model).get(id)
            if obj:
                db.delete(obj)
                db.commit()
                return True
            return False
        except SQLAlchemyError as e:
            db.rollback()
            print(f"Error deleting {self.model.__name__}: {e}")
            return False 