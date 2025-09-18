import logging
# import json
# The line `from flask_log_request_id import RequestIDLogFilter` is importing the `RequestIDLogFilter`
# class from the `flask_log_request_id` module. This class is likely used to filter log messages based
# on a request ID, which can be helpful for tracking logs related to a specific request in a Flask
# application.
# from flask_log_request_id import RequestIDLogFilter


class LogColors:
    BLACK = '\033[30m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    CYAN = '\033[36m'
    WHITE = '\033[37m'
    RESET = '\033[39m'


class ColoredFormatter(logging.Formatter):
    LOG_COLORS = {
        'DEBUG': LogColors.BLUE,
        'INFO': LogColors.GREEN,
        'WARNING': LogColors.YELLOW,
        'ERROR': LogColors.RED,
        'CRITICAL': LogColors.MAGENTA
    }

    def format(self, record: logging.LogRecord):
        log_color = self.LOG_COLORS.get(record.levelname, LogColors.RESET)
        record.asctime = self.formatTime(record, self.datefmt)
        fields = record.__dict__

        # Create a colorized log message
        log_msg = (
            # f"{LogColors.BLACK} [{record.request_id}] {LogColors.RESET} - "
            f"[{record.asctime}] {LogColors.RESET} - "
            f"{LogColors.CYAN} [{record.levelname}] {LogColors.RESET} - "
            f"[{record.filename}:{record.lineno}] \n"
            f"-{log_color}{record.msg}{LogColors.RESET}"
        )
        return log_msg


logger = logging.getLogger(__name__)
logger.setLevel("DEBUG")

formatter = ColoredFormatter(
    "%(asctime)s %(levelname)s %(filename)s:%(lineno)d - %(msg)s", datefmt='%Y-%m-%d %H:%M:%S')

handler = logging.StreamHandler()
logger.addHandler(handler)

# handler.addFilter(RequestIDLogFilter())
handler.setFormatter(formatter)
