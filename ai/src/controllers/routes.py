from ..models.route import Route
from ..constants.api_methods import METHOD_GET, METHOD_HEAD, METHOD_DELETE, METHOD_PATCH, METHOD_PUT, METHOD_POST

ROUTE_PING = Route(
    name='ping',
    path='/ping',
    method=METHOD_GET
)
