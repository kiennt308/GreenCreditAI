from src.controllers.service_controller import *
from src.controllers.routes import *
from src.controllers.model_controller import *

APIS = [
    (ROUTE_PING, ping),
    (ROUTE_TRAIN_ESG_OVERALL, train_model_esg_overall),
    (ROUTE_TRAIN_MARKET_CAP, train_model_market_cap),
]
