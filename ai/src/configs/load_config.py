import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    class FlaskConfig:
        def __init__(self):
            self.name = os.getenv('FLASK_NAME')
            self.debug = os.getenv('FLASK_DEBUG')
            self.port = os.getenv('FLASK_PORT')
            self.host = os.getenv('FLASK_HOST')
    
    def __init__(self):
        self.flask = self.FlaskConfig()
