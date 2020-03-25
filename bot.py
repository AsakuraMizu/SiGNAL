import os
import nonebot

import config

nonebot.init(config)
nonebot.load_plugins(os.path.join(os.path.dirname(__file__), 'plugins'), 'plugins')

app = nonebot.get_bot().asgi

if __name__ == '__main__':
    nonebot.run(use_reloader=True)
