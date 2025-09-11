from .app import App

PING = 'ping'

def ping(self: App):
    return {'msg': 'ping'}, 200
