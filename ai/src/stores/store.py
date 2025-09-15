from pymongo import MongoClient
from ..configs.load_config import Config

class Store:
    def __init__(self, config: Config):
        try:
            client = MongoClient(
                host=config.mongodb.host,
                port=int(config.mongodb.port),
                username=config.mongodb.username,
                password=config.mongodb.password
            )
        except Exception as e:
            print("Error when create connection to MongoDB", e)
            raise e

        self.__database__ = client.get_database(config.mongodb.database)
