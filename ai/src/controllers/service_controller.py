from .app import App

PING = 'ping'

def ping():
    return {'msg': 'ping'}, 200
