class CalculationError(Exception):
    """Exception raised for errors in calculation processes."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

class ValidationError(Exception):
    """Exception raised for validation errors in input data."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

class ConfigurationError(Exception):
    """Exception raised for errors in configuration settings."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

class ServiceError(Exception):
    """Exception raised for errors in service operations."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message) 