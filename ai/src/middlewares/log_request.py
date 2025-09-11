from flask import request, Response
from src.utils.logger import logger

def log_request(response: Response):
    status_code = response.status_code

    if 200 <= status_code < 300:
        log_level = logger.info  # 2xx Success -> INFO
    elif 300 <= status_code < 400:
        log_level = logger.warning  # 3xx Redirection -> WARNING
    elif 400 <= status_code < 500:
        log_level = logger.error  # 4xx Client Error -> ERROR
    elif 500 <= status_code < 600:
        log_level = logger.error  # 5xx Server Error -> ERROR
    else:
        log_level = logger.debug  # Default to DEBUG for unknown cases

    log_level(f"Request: {request.method} {request.path} {response.status_code}. \n"
              f"Response = {response.data.decode('utf-8')} \n")
    return response
