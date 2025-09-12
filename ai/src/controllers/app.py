from flask import Flask
from flask_cors import CORS
from flask_log_request_id import RequestID

from src.middlewares.log_request import log_request
from ..models.route import Route
from .env import Env

class App:
    """
    A stateful Flask application wrapper.

    Attributes:
        app (Flask): The Flask application instance.
        env (Env): Environment configuration and services.
    """

    def __init__(self, env: Env, routes: list[tuple[Route, any]] = None):
        self.env = env
        self.app = Flask(env.config.flask.name)

        self._setup_request_id()
        self._setup_routes(routes or [])
        self._setup_cors()
        # Uncomment if middleware compatibility is resolved
        # self._setup_middlewares()

    def __call__(self, *args, **kwargs):
        return self.app(*args, **kwargs)

    def _setup_request_id(self):
        """Attach request ID middleware."""
        RequestID(self.app)

    def _setup_middlewares(self):
        """Attach custom middlewares."""
        self.app.after_request(log_request)

    def _setup_cors(self):
        """Enable CORS for the application."""
        CORS(self.app)

    def _setup_routes(self, routes: list[tuple[Route, any]]):
        """Register routes to the Flask app."""
        for route, handler in routes:
            setattr(self, route.name, handler)
            self.app.add_url_rule(
                route.path,
                route.name,
                getattr(self, route.name),
                methods=route.method
            )

    def run(self):
        """Run the Flask application."""
        self.app.run(
            host=self.env.config.flask.host,
            port=int(self.env.config.flask.port),
            debug=bool(self.env.config.flask.debug),
        )
