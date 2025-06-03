from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.transaction import TransactionRepository
from app.services.csv_processor import CsvProcessorService
import os
import pandas as pd
import aiofiles
import asyncio
from app.models.transaction import Transaction
from sqlalchemy.sql.sqltypes import Integer, String, Float, DateTime
from app.services.base import BaseService


class TransactionCsvUploadService(BaseService):
    def __init__(self, upload_dir: str = "uploads", logger=None):
        super().__init__(logger)
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)
        self.csv_processor = CsvProcessorService(logger=self.logger)
        self.csv_processor.add_validation(
            CsvProcessorService.schema_validation(["trxnno", "amount"])
        )

    async def save_file(self, file) -> str:
        file_location = os.path.join(self.upload_dir, file.filename)
        try:
            async with aiofiles.open(file_location, "wb") as f:
                content = await file.read()
                await f.write(content)
            return file_location
        except Exception as e:
            self.log_error(f"Failed to save file: {e}")
            raise

    async def cleanup_file(self, file_path: str) -> None:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                self.log_info(f"Successfully cleaned up file: {file_path}")
        except Exception as e:
            self.log_error(f"Failed to clean up file {file_path}: {e}")

    async def process_and_insert(self, db: AsyncSession, file) -> int:
        file_location = await self.save_file(file)
        try:
            loop = asyncio.get_event_loop()
            df = await loop.run_in_executor(None, pd.read_csv, file_location)

            df.columns = [col.strip().strip("'\"") for col in df.columns]
            df = df.applymap(
                lambda x: x.strip().strip("'\"") if isinstance(x, str) else x
            )

            df = df.loc[
                :, df.columns.map(lambda x: bool(x and str(x).strip()))
            ]

            model_fields = {
                col.name.lower(): col.name
                for col in Transaction.__table__.columns
            }

            def normalize_header(col):
                key = col.strip().lower().replace(" ", "_")
                return model_fields.get(key, col)

            df.columns = [normalize_header(col) for col in df.columns]

            await loop.run_in_executor(
                None, lambda: df.to_csv(file_location, index=False)
            )

            if not self.csv_processor.validate_file(file_location):
                errors = self.csv_processor.get_validation_errors()
                missing_cols = None
                for err in errors:
                    if (
                        err["strategy"] == "schema_validation"
                        and "Missing columns" in err["error"]
                    ):
                        missing_cols = err["error"]
                if missing_cols:
                    raise ValueError(
                        f"CSV schema validation failed: {missing_cols}"
                    )
                raise ValueError(f"CSV validation failed: {errors}")
            loop = asyncio.get_event_loop()
            df = await loop.run_in_executor(None, pd.read_csv, file_location)
            df.columns = [
                col.strip().strip("'\"").lower() for col in df.columns
            ]

            model_type_map = {}
            for col in Transaction.__table__.columns:
                model_type_map[col.name.lower()] = type(col.type)

            def convert_column(series, target_type):
                if target_type is Integer:
                    return pd.to_numeric(series, errors="raise").astype(
                        "Int64"
                    )
                elif target_type is Float:
                    return pd.to_numeric(series, errors="raise").astype(float)
                elif target_type is DateTime:
                    cleaned = series.replace(r"^\s*$", pd.NA, regex=True)
                    cleaned = (
                        cleaned.astype(str)
                        .str.strip()
                        .str.strip("'")
                        .str.strip('"')
                    )
                    dt = pd.to_datetime(
                        cleaned,
                        format="%m/%d/%Y %I:%M:%S %p",
                        errors="raise",
                        utc=True,
                    )
                    return dt.dt.tz_localize(None)
                elif target_type is String:
                    trimmed = (
                        series.astype(str)
                        .str.strip()
                        .str.strip("'")
                        .str.strip('"')
                    )
                    cleaned = trimmed.replace(r"^$", None, regex=True)
                    return cleaned.apply(
                        lambda x: str(x) if x is not None else None
                    )
                else:
                    return series

            for col, target_type in model_type_map.items():
                if col in df.columns:
                    try:
                        df[col] = convert_column(df[col], target_type)
                    except Exception as e:
                        raise ValueError(
                            f"Failed to convert column '{col}' to {target_type.__name__}: {e}"
                        )

            df = df.where(pd.notnull(df), None)

            df = df.replace("", None)

            df = df.apply(lambda x: x.strip() if isinstance(x, str) else x)

            records = [
                {
                    k: (
                        None
                        if (isinstance(v, float) and pd.isna(v)) or v is pd.NaT
                        else v
                    )
                    for k, v in row.items()
                }
                for row in df.to_dict(orient="records")
            ]
            repo = TransactionRepository()
            inserted = await repo.bulk_insert(db, records)

            await self.cleanup_file(file_location)

            return len(inserted)
        except Exception as e:
            self.log_error(f"CSV processing failed: {e}")
            await self.cleanup_file(file_location)
            raise
