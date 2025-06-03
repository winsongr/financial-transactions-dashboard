import logging
from typing import Any, Optional


class BaseService:
    def __init__(self, logger: Optional[logging.Logger] = None):
        self.logger = logger or logging.getLogger(self.__class__.__name__)

    def log_info(self, message: str, **kwargs):
        self.logger.info(message, extra=kwargs)

    def log_error(self, message: str, **kwargs):
        self.logger.error(message, extra=kwargs)

    def handle_error(
        self, error: Exception, context: Optional[Any] = None
    ) -> None:
        self.log_error(f"Error: {str(error)}", context=context)
        raise

    def health_check(self) -> bool:
        try:
            self.log_info("Health check passed.")
            return True
        except Exception as e:
            self.log_error(f"Health check failed: {e}")
            self.handle_error(e)
            return False
