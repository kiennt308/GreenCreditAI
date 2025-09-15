from ..configs.load_config import Config
from ..stores.store import Store

class Env:
    def __init__(self):
        self.config = Config()
        self.db_store = Store(self.config)