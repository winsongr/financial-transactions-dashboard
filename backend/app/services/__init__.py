from typing import Dict, Any, Callable


class ServiceRegistry:
    _services: Dict[str, Any] = {}

    @classmethod
    def register(cls, name: str, service: Any):
        cls._services[name] = service

    @classmethod
    def get(cls, name: str) -> Any:
        return cls._services.get(name)

    @classmethod
    def clear(cls):
        cls._services.clear()


def inject(service_name: str) -> Callable:
    def decorator(func):
        def wrapper(*args, **kwargs):
            service = ServiceRegistry.get(service_name)
            if not service:
                raise ValueError(f"Service '{service_name}' not found in registry.")
            return func(service, *args, **kwargs)
        return wrapper
    return decorator

class BaseService:
    pass 