from ..models.route import Route
from ..constants.api_methods import METHOD_GET, METHOD_HEAD, METHOD_DELETE, METHOD_PATCH, METHOD_PUT, METHOD_POST

ROUTE_PING = Route(
    name='ping',
    path='/ping',
    method=METHOD_GET
)

ROUTE_TRAIN_ESG_OVERALL = Route(
    name='train_esg_overall',
    path='/train/esg_overall',
    method=METHOD_POST
)

ROUTE_TRAIN_MARKET_CAP = Route(
    name='train_market_cap',
    path='/train/market_cap',
    method=METHOD_POST
)

ROUTE_PREDICT_ESG_OVERALL = Route(
    name='predict_esg_overall',
    path='/predict/esg_overall',
    method=METHOD_POST
)