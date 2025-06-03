import pandas as pd
from typing import List, Callable, Any, Optional, Dict, Awaitable, Union
from .base import BaseService
import asyncio

Step = Callable[[pd.DataFrame], pd.DataFrame]
AsyncStep = Callable[[pd.DataFrame], Awaitable[pd.DataFrame]]


class CsvProcessorService(BaseService):
    def __init__(self, logger=None):
        super().__init__(logger)
        self.validation_strategies: List[Callable[[str], bool]] = []
        self.transformations: List[Union[Step, AsyncStep]] = []
        self.error_handlers: List[
            Callable[[Exception, Optional[Any]], None]
        ] = []
        self.validation_errors: List[Dict[str, Any]] = []
        self.pipeline_steps: List[Union[Step, AsyncStep]] = []
        self.rollback_stack: List[Callable[[], None]] = []
        self.progress_callback: Optional[Callable[[int, int], None]] = None

    def add_validation(self, strategy: Callable[[str], bool]):
        self.validation_strategies.append(strategy)

    def add_transformation(self, transformation: Union[Step, AsyncStep]):
        self.transformations.append(transformation)

    def add_pipeline_step(self, step: Union[Step, AsyncStep]):
        self.pipeline_steps.append(step)

    def add_error_handler(
        self, handler: Callable[[Exception, Optional[Any]], None]
    ):
        self.error_handlers.append(handler)

    def set_progress_callback(self, callback: Callable[[int, int], None]):
        self.progress_callback = callback

    def clear_validation_errors(self):
        self.validation_errors.clear()

    def validate_file(self, file_path: str) -> bool:
        self.log_info(f"Starting validation for file: {file_path}")
        self.clear_validation_errors()
        all_passed = True
        for strategy in self.validation_strategies:
            try:
                if not strategy(file_path):
                    error_detail = "Validation failed"
                    if (
                        strategy.__name__ == "schema_validation"
                        and hasattr(strategy, "missing_columns")
                        and strategy.missing_columns
                    ):
                        error_detail = (
                            f"Missing columns: {strategy.missing_columns}"
                        )
                    error = {
                        "file": file_path,
                        "strategy": strategy.__name__,
                        "error": error_detail,
                    }
                    self.validation_errors.append(error)
                    self.log_error(
                        f"Validation failed for {file_path} with {strategy.__name__}: {error_detail}"
                    )
                    all_passed = False
            except Exception as e:
                error = {
                    "file": file_path,
                    "strategy": strategy.__name__,
                    "error": str(e),
                }
                self.validation_errors.append(error)
                self.handle_error(
                    e,
                    context={
                        "file_path": file_path,
                        "strategy": strategy.__name__,
                    },
                )
                all_passed = False
        if all_passed:
            self.log_info(f"Validation passed for file: {file_path}")
        return all_passed

    def get_validation_errors(self) -> List[Dict[str, Any]]:
        return self.validation_errors

    @staticmethod
    def schema_validation(
        expected_columns: List[str],
    ) -> Callable[[str], bool]:
        def clean(col: str) -> str:
            return col.strip().strip("'\"").lower()

        expected_columns_clean = [clean(col) for col in expected_columns]

        def validate(file_path: str) -> bool:
            df = pd.read_csv(file_path, nrows=1)
            df.columns = [clean(col) for col in df.columns]
            missing = [
                col for col in expected_columns_clean if col not in df.columns
            ]
            if missing:
                print(f"[DEBUG] CSV header columns: {df.columns.tolist()}")
                print(f"[DEBUG] Expected columns: {expected_columns_clean}")
                print(f"[DEBUG] Missing columns: {missing}")
                validate.missing_columns = missing
                return False
            return True

        validate.__name__ = "schema_validation"
        validate.missing_columns = []
        return validate

    @staticmethod
    def business_rule_validation(
        rule: Callable[[pd.DataFrame], bool],
    ) -> Callable[[str], bool]:
        def validate(file_path: str) -> bool:
            df = pd.read_csv(file_path)
            df.columns = [col.strip().lower() for col in df.columns]
            return rule(df)

        validate.__name__ = "business_rule_validation"
        return validate

    @staticmethod
    def data_quality_check(
        check: Callable[[pd.DataFrame], bool],
    ) -> Callable[[str], bool]:
        def validate(file_path: str) -> bool:
            df = pd.read_csv(file_path)
            df.columns = [col.strip().lower() for col in df.columns]
            return check(df)

        validate.__name__ = "data_quality_check"
        return validate

    def process(self, file_path: str, chunk_size: int = 10000) -> int:
        self.log_info(f"Starting processing for file: {file_path}")
        if not self.validate_file(file_path):
            self.log_error(f"File validation failed: {file_path}")
            return 0
        processed_rows = 0
        try:
            for chunk in pd.read_csv(file_path, chunksize=chunk_size):
                chunk.columns = [col.strip().lower() for col in chunk.columns]
                df = chunk
                for step in self.pipeline_steps or self.transformations:
                    try:
                        if asyncio.iscoroutinefunction(step):
                            df = asyncio.run(step(df))
                        else:
                            df = step(df)
                    except Exception as e:
                        self.handle_error(
                            e,
                            context={
                                "stage": "pipeline",
                                "step": getattr(step, "__name__", str(step)),
                            },
                        )
                        for rollback in reversed(self.rollback_stack):
                            try:
                                rollback()
                            except Exception as re:
                                self.log_error(f"Rollback failed: {str(re)}")
                        continue
                processed_rows += len(df)
                if self.progress_callback:
                    self.progress_callback(processed_rows, chunk_size)
            self.log_info(
                f"Processing completed for file: {file_path}, rows processed: {processed_rows}"
            )
        except Exception as e:
            self.handle_error(e, context={"file_path": file_path})
        return processed_rows

    async def process_async(
        self, file_path: str, chunk_size: int = 10000
    ) -> int:
        self.log_info(f"Starting async processing for file: {file_path}")
        if not self.validate_file(file_path):
            self.log_error(f"File validation failed: {file_path}")
            return 0
        processed_rows = 0
        try:
            loop = asyncio.get_event_loop()
            for chunk in pd.read_csv(file_path, chunksize=chunk_size):
                chunk.columns = [col.strip().lower() for col in chunk.columns]
                df = chunk
                for step in self.pipeline_steps or self.transformations:
                    try:
                        if asyncio.iscoroutinefunction(step):
                            df = await step(df)
                        else:
                            df = await loop.run_in_executor(None, step, df)
                    except Exception as e:
                        self.handle_error(
                            e,
                            context={
                                "stage": "pipeline",
                                "step": getattr(step, "__name__", str(step)),
                            },
                        )
                        for rollback in reversed(self.rollback_stack):
                            try:
                                rollback()
                            except Exception as re:
                                self.log_error(f"Rollback failed: {str(re)}")
                        continue
                processed_rows += len(df)
                if self.progress_callback:
                    self.progress_callback(processed_rows, chunk_size)
            self.log_info(
                f"Async processing completed for file: {file_path}, rows processed: {processed_rows}"
            )
        except Exception as e:
            self.handle_error(e, context={"file_path": file_path})
        return processed_rows

    def handle_error(
        self, error: Exception, context: Optional[Any] = None
    ) -> None:
        super().handle_error(error, context)
        for handler in self.error_handlers:
            try:
                handler(error, context)
            except Exception as e:
                self.log_error(
                    f"Error in error handler: {str(e)}", context=context
                )
