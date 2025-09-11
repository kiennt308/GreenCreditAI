from src.controllers.app import App, Env
from src.controllers.apis import *

app = App(env=Env(), routes=APIS)
if __name__ == "__main__":
    app.run()
