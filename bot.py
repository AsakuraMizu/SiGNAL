import os
import nonebot

from loader import get_conf

nonebot.init(get_conf())
nonebot.load_plugins(os.path.join(os.path.dirname(__file__), 'plugins'), 'plugins')

app = nonebot.get_bot().asgi

if __name__ == '__main__':
    nonebot.run(use_reloader=True)
